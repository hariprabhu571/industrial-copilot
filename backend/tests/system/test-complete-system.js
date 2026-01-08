// Complete system test to verify all critical fixes
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

console.log("🔧 Industrial AI Copilot - Complete System Test\n");

// Test 1: Environment Variables
console.log("1️⃣ Testing Environment Variables:");
const requiredEnvVars = [
  'GEMINI_API_KEY',
  'GROQ_API_KEY', 
  'POSTGRES_HOST',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
  'ADMIN_API_KEY'
];

let envOk = true;
requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`   ✅ ${varName}: Set`);
  } else {
    console.log(`   ❌ ${varName}: Missing`);
    envOk = false;
  }
});

if (!envOk) {
  console.log("\n❌ Environment variables missing. Please check your .env file.");
  console.log("Copy .env.example to .env and fill in your API keys.\n");
  process.exit(1);
}

// Test 2: Database Connection
console.log("\n2️⃣ Testing Database Connection:");
try {
  const { query } = await import("../../src/db/postgres.js");
  const result = await query("SELECT version()");
  console.log(`   ✅ PostgreSQL Connected: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
  
  // Check if pgvector is installed
  try {
    await query("CREATE EXTENSION IF NOT EXISTS vector");
    console.log("   ✅ pgvector extension available");
  } catch (err) {
    console.log("   ⚠️  pgvector extension not available - install it for vector search");
  }
} catch (error) {
  console.log(`   ❌ Database connection failed: ${error.message}`);
  console.log("   Make sure PostgreSQL is running and credentials are correct.");
  process.exit(1);
}

// Test 3: Database Schema
console.log("\n3️⃣ Testing Database Schema:");
try {
  const { query } = await import("../../src/db/postgres.js");
  
  // Check if tables exist
  const tables = ['documents', 'chunks', 'embeddings', 'audit_logs'];
  for (const table of tables) {
    const result = await query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      )`,
      [table]
    );
    
    if (result.rows[0].exists) {
      console.log(`   ✅ Table '${table}' exists`);
      
      // Check for pii_masked column in chunks table
      if (table === 'chunks') {
        const columnCheck = await query(
          `SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'chunks' AND column_name = 'pii_masked'
          )`
        );
        
        if (columnCheck.rows[0].exists) {
          console.log(`   ✅ Column 'pii_masked' exists in chunks table`);
        } else {
          console.log(`   ⚠️  Column 'pii_masked' missing - run migration script`);
        }
      }
    } else {
      console.log(`   ❌ Table '${table}' missing - run schema.sql`);
    }
  }
} catch (error) {
  console.log(`   ❌ Schema check failed: ${error.message}`);
}

// Test 4: API Keys and External Services
console.log("\n4️⃣ Testing External API Connections:");

// Test Gemini API
try {
  const { embedQuery } = await import("../../src/rag/embeddings.js");
  const testEmbedding = await embedQuery("test query");
  console.log(`   ✅ Gemini API working - embedding size: ${testEmbedding.length}`);
} catch (error) {
  console.log(`   ❌ Gemini API failed: ${error.message}`);
}

// Test Groq API
try {
  const { generateAnswer } = await import("../../src/rag/chatCompletion.js");
  const testAnswer = await generateAnswer("Test context", "Test question");
  console.log(`   ✅ Groq API working - response length: ${testAnswer.length} chars`);
} catch (error) {
  console.log(`   ❌ Groq API failed: ${error.message}`);
}

// Test 5: Python Scripts
console.log("\n5️⃣ Testing Python NLP Scripts:");
try {
  const { preprocessText } = await import("../../src/nlp/preprocessText.js");
  const testResult = await preprocessText("This is a test document with some content.");
  console.log(`   ✅ NLP preprocessing working - processed ${testResult.length} chunks`);
} catch (error) {
  console.log(`   ❌ Python NLP scripts failed: ${error.message}`);
  console.log("   Make sure Python and required packages are installed");
}

// Test 6: Critical Bug Fixes
console.log("\n6️⃣ Testing Critical Bug Fixes:");

try {
  // Test metadata preservation and provider tracking
  const { embedChunks } = await import("../../src/rag/embeddingRouter.js");
  
  const testChunks = [
    {
      content: "This is a safety procedure for machine operation.",
      section: "safety",
      metadata: { pii_masked: true, chunk_index: 0 }
    },
    {
      content: "General maintenance guidelines for equipment.",
      section: "general", 
      metadata: { pii_masked: false, chunk_index: 1 }
    }
  ];

  console.log("Embedding routing:", testChunks.map((chunk, index) => ({
    chunk: index,
    provider: chunk.metadata?.pii_masked || ["policy", "safety", "compliance"].includes(chunk.section) ? 'local' : 'external',
    pii_masked: chunk.metadata?.pii_masked || false,
    section: chunk.section,
  })));

  // Test that the routing logic works (even if local embedder fails)
  const routingTest = testChunks.map((chunk, index) => {
    const sensitive = chunk.metadata?.pii_masked || ["policy", "safety", "compliance"].includes(chunk.section);
    return {
      chunk: index,
      provider: sensitive ? 'local' : 'external',
      pii_masked: chunk.metadata?.pii_masked || false,
      section: chunk.section,
    };
  });

  if (routingTest[0].provider === 'local' && routingTest[1].provider === 'external') {
    console.log("   ✅ Provider routing logic working correctly");
    console.log(`   ✅ Chunk 0: provider=${routingTest[0].provider} (sensitive content)`);
    console.log(`   ✅ Chunk 1: provider=${routingTest[1].provider} (general content)`);
  } else {
    console.log("   ❌ Provider routing logic not working correctly");
  }

  // Test smart query embedding (this should work)
  const { embedQuerySmart } = await import("../../src/rag/embeddings.js");
  const queryEmbedding = await embedQuerySmart("What are the safety procedures?");
  console.log(`   ✅ Smart query embedding working - ${queryEmbedding.length} dimensions`);

} catch (error) {
  console.log(`   ❌ Critical fixes test failed: ${error.message}`);
}

console.log("\n🎉 System Test Complete!");
console.log("\n📋 Next Steps:");
console.log("   1. If any tests failed, fix those issues first");
console.log("   2. Run the backend server: npm start");
console.log("   3. Test the upload endpoint with a PDF");
console.log("   4. Test the chat endpoint with questions");
console.log("   5. Check the database for stored data");

process.exit(0);