import { query } from "../db/postgres.js";
import { v4 as uuidv4 } from "uuid";

function toPgVector(vec) {
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
  embeddings
) {
  for (let i = 0; i < chunks.length; i++) {
    const chunkId = uuidv4();

    await query(
      `INSERT INTO chunks (id, document_id, chunk_index, content, section)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        chunkId,
        documentId,
        i,
        chunks[i].content,
        chunks[i].section || "general",
      ]
    );

    await query(
      `INSERT INTO embeddings (chunk_id, embedding)
       VALUES ($1, $2::vector)`,
      [chunkId, toPgVector(embeddings[i])]
    );
  }
}


export async function similaritySearch(
  queryEmbedding,
  k = 4,
  sectionWeights = { general: 0.05 }
) {
  const res = await query(
    `
    SELECT
    c.content,
    c.chunk_index,
    c.section,

    d.id AS document_id,
    d.name AS document_name,
    d.department,
    d.doc_type,
    d.version,
    d.status,

    -- base semantic similarity
    1 - (e.embedding <=> $1::vector) AS similarity,

    -- section-based bonus (from JSON)
    COALESCE(($3::jsonb ->> c.section)::float, 0) AS section_bonus,

    -- final weighted score
    (1 - (e.embedding <=> $1::vector)) +
    COALESCE(($3::jsonb ->> c.section)::float, 0) AS score


    FROM embeddings e
    JOIN chunks c ON c.id = e.chunk_id
    JOIN documents d ON d.id = c.document_id
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
    source: "uploaded-pdf",
  },
}));

}




