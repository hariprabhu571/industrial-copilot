import { spawn } from "child_process";
import { detectSection } from "../rag/sectionDetector.js";

export function preprocessText(text) {
  return new Promise((resolve, reject) => {
    const process = spawn("python", ["scripts/nlp_runner.py"]);

    let output = "";
    let error = "";

    process.stdin.write(text);
    process.stdin.end();

    process.stdout.on("data", data => {
      output += data.toString();
    });

    process.stderr.on("data", data => {
      error += data.toString();
    });

    process.on("close", code => {
      if (code !== 0) {
        return reject(new Error(error));
      }

      const parsed = JSON.parse(output);

      const processed = parsed.map(p => ({
        content: p.content,
        section: detectSection(p.content) || "general",
        metadata: {
          pii_masked: p.pii_masked,
          entities: p.entities,
        },
      }));

      console.log("Phase 15.2.1 sample:", processed.slice(0, 3));
      resolve(processed);
    });
  });
}
