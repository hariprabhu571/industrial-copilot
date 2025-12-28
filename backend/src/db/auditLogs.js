import { query } from "./postgres.js";
import { v4 as uuidv4 } from "uuid";

export async function saveAuditLog({
  question,
  answer,
  retrievedDocuments,
  metadata = {},
}) {
  const id = uuidv4();

  await query(
    `
    INSERT INTO audit_logs
      (id, question, answer, retrieved_documents, metadata)
    VALUES
      ($1, $2, $3, $4, $5)
    `,
    [
      id,
      question,
      answer,
      JSON.stringify(retrievedDocuments),
      JSON.stringify(metadata),
    ]
  );

  return id;
}
