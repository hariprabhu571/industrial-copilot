import { spawn } from "child_process";

/**
 * Runs spaCy locally via Python
 * Returns sentences + detected entities
 */
export function runSpacy(text) {
  return new Promise((resolve, reject) => {
    const process = spawn("python", ["scripts/spacy_runner.py"]);

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
      resolve(JSON.parse(output));
    });
  });
}
