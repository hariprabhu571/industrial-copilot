import { spawn } from "child_process";
import { detectSection } from "../rag/sectionDetector.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function preprocessText(text) {
  return new Promise((resolve, reject) => {
    // Find the correct path to our enterprise NLP script
    const possiblePaths = [
      path.resolve(__dirname, "../../tests/system/scripts/nlp_runner.py"),
      path.resolve(process.cwd(), "backend/tests/system/scripts/nlp_runner.py"),
      path.resolve(process.cwd(), "tests/system/scripts/nlp_runner.py")
    ];
    
    let scriptPath = null;
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        scriptPath = testPath;
        break;
      }
    }
    
    if (!scriptPath) {
      return reject(new Error("Enterprise NLP script not found. Paths checked: " + possiblePaths.join(", ")));
    }
    
    console.log("Using NLP script at:", scriptPath);
    const pythonProcess = spawn("python", [scriptPath, text]);

    let output = "";
    let error = "";

    pythonProcess.stdout.on("data", data => {
      output += data.toString();
    });

    pythonProcess.stderr.on("data", data => {
      error += data.toString();
    });

    pythonProcess.on("close", code => {
      if (code !== 0) {
        return reject(new Error(error || "Python script execution failed"));
      }

      try {
        const parsed = JSON.parse(output);
        
        // If our enterprise script returns a full analysis, extract the chunks
        if (parsed.chunk_analysis && parsed.chunk_analysis.chunks) {
          const processed = parsed.chunk_analysis.chunks.map(chunk => ({
            content: chunk.content,
            section: chunk.section || detectSection(chunk.content) || "general",
            metadata: {
              pii_masked: chunk.metadata?.pii_masked || false,
              entities: chunk.keywords || [],
              section_confidence: chunk.metadata?.section_confidence || 0.5
            },
          }));

          console.log("Enterprise NLP processing complete:", processed.length, "chunks");
          resolve(processed);
        } else {
          // Fallback: create a single chunk from the input
          const processed = [{
            content: text,
            section: detectSection(text) || "general",
            metadata: {
              pii_masked: parsed.security_analysis?.requires_masking || false,
              entities: parsed.content_analysis?.top_keywords || [],
              section_confidence: 0.8
            }
          }];

          console.log("Enterprise NLP processing (single chunk):", processed.length, "chunks");
          resolve(processed);
        }
      } catch (parseError) {
        reject(new Error(`Failed to parse NLP output: ${parseError.message}`));
      }
    });

    pythonProcess.on("error", (err) => {
      reject(new Error(`Failed to start Python process: ${err.message}`));
    });
  });
}
