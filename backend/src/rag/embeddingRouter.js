import { embedTexts as embedExternal } from "./embeddings.js";
import { spawn } from "child_process";

function embedLocal(texts) {
  return new Promise((resolve, reject) => {
    const process = spawn("python", ["scripts/local_embedder.py"]);

    let output = "";
    let error = "";

    process.stdin.write(JSON.stringify({ texts }));
    process.stdin.end();

    process.stdout.on("data", d => (output += d.toString()));
    process.stderr.on("data", d => (error += d.toString()));

    process.on("close", code => {
      if (code !== 0) return reject(error);
      resolve(JSON.parse(output));
    });
  });
}

export async function embedChunks(chunks) {
  const localTexts = [];
  const externalTexts = [];
  const routing = [];

  chunks.forEach((chunk, index) => {
    const sensitive =
      chunk.metadata?.pii_masked ||
      ["policy", "safety", "compliance"].includes(chunk.section);

    if (sensitive) {
      routing.push({ type: "local", index });
      localTexts.push(chunk.content);
    } else {
      routing.push({ type: "external", index });
      externalTexts.push(chunk.content);
    }
  });

  console.log(
    "Embedding routing:",
    routing.map(r => ({
      chunk: r.index,
      provider: r.type,
      pii_masked: chunks[r.index].metadata?.pii_masked || false,
      section: chunks[r.index].section,
    }))
  );
  

  const localEmbeddings = localTexts.length
    ? await embedLocal(localTexts)
    : [];

  const externalEmbeddings = externalTexts.length
    ? await embedExternal(externalTexts)
    : [];

  let li = 0;
  let ei = 0;

  // Return both embeddings and their providers
  const embeddingsWithProviders = routing.map(r => ({
    embedding: r.type === "local" ? localEmbeddings[li++] : externalEmbeddings[ei++],
    provider: r.type === "local" ? "local" : "cloud"
  }));

  return embeddingsWithProviders;
}
