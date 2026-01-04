import { query } from "../db/postgres.js";
import { v4 as uuidv4 } from "uuid";

function toPgVector(vec) {
  if (!vec || !Array.isArray(vec)) {
    throw new Error(`Invalid vector: expected array, got ${typeof vec}`);
  }
  return `[${vec.join(",")}]`;
}

export async function saveDocument({
  name,
  source,
  department = "general",
  doc_type = "general",
  version = "v1.0",
  status = "active",
  uploaded_by = "system",
}) {
  const id = uuidv4();

  await query(
    `
    INSERT INTO documents
      (id, name, source, department, doc_type, version, status, uploaded_by)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [
      id,
      name,
      source,
      department,
      doc_type,
      version,
      status,
      uploaded_by,
    ]
  );

  return id;
}


export async function saveChunksWithEmbeddings(
  documentId,
  chunks,
  embeddingsWithProviders
) {
  for (let i = 0; i < chunks.length; i++) {
    const chunkId = uuidv4();
    const chunk = chunks[i];
    const embeddingData = embeddingsWithProviders[i];

    // Save chunk with metadata
    await query(
      `INSERT INTO chunks (id, document_id, chunk_index, content, section, pii_masked)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        chunkId,
        documentId,
        i,
        chunk.content,
        chunk.section || "general",
        chunk.metadata?.pii_masked || false,
      ]
    );

    const vector = toPgVector(embeddingData.embedding);
    const provider = embeddingData.provider;

    console.log(`Processing chunk ${i}: provider=${provider}, embedding_length=${embeddingData.embedding?.length}`);

    if (provider === "cloud") {
      await query(
        `INSERT INTO embeddings (chunk_id, embedding_cloud)
         VALUES ($1, $2::vector)`,
        [chunkId, vector]
      );
    } else {
      await query(
        `INSERT INTO embeddings (chunk_id, embedding_local)
         VALUES ($1, $2::vector)`,
        [chunkId, vector]
      );
    }
    
  }
}


export async function similaritySearch(
  queryEmbedding,
  k = 4,
  sectionWeights = { general: 0.05 },
  queryProvider = 'cloud'
) {
  // Search only the matching embedding type to avoid dimension mismatch
  const embeddingColumn = queryProvider === 'cloud' ? 'embedding_cloud' : 'embedding_local';
  
  const res = await query(
    `
    SELECT
    c.content,
    c.chunk_index,
    c.section,
    c.pii_masked,

    d.id AS document_id,
    d.name AS document_name,
    d.department,
    d.doc_type,
    d.version,
    d.status,

    -- base semantic similarity using the correct embedding column
    1 - (e.${embeddingColumn} <=> $1::vector) AS similarity,

    -- section-based bonus (from JSON)
    COALESCE(($3::jsonb ->> c.section)::float, 0) AS section_bonus,

    -- final weighted score
    (1 - (e.${embeddingColumn} <=> $1::vector)) +
    COALESCE(($3::jsonb ->> c.section)::float, 0) AS score


    FROM embeddings e
    JOIN chunks c ON c.id = e.chunk_id
    JOIN documents d ON d.id = c.document_id
    WHERE e.${embeddingColumn} IS NOT NULL
    ORDER BY score DESC
    LIMIT $2
    `,
    [
      toPgVector(queryEmbedding),
      k,
      JSON.stringify(sectionWeights),
    ]
  );

return res.rows.map(row => ({
  pageContent: row.content,
  score: Number(row.score.toFixed(4)),
  metadata: {
    documentId: row.document_id,
    documentName: row.document_name,
    department: row.department,
    docType: row.doc_type,
    version: row.version,
    status: row.status,
    chunkIndex: row.chunk_index,
    section: row.section,
    piiMasked: row.pii_masked,
    source: "uploaded-pdf",
  },
}));

}




