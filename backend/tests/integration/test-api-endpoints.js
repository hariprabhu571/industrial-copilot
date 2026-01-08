// API Endpoint Testing Script
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3001';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'your-admin-key';

console.log("🚀 Testing API Endpoints\n");
console.log("Starting comprehensive API tests...\n");

// Helper function to wait for server to be ready
async function waitForServer(maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${BASE_URL}/api/health`, { timeout: 5000 });
      if (response.ok) {
        return true;
      }
    } catch (error) {
      if (i === maxAttempts - 1) {
        console.log("   ⚠️  Server not responding, continuing with tests...");
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return false;
}

// Test 1: Health Check
async function testHealthCheck() {
  console.log("1️⃣ Testing Health Check:");
  try {
    await waitForServer();
    const response = await fetch(`${BASE_URL}/api/health`, { timeout: 10000 });
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Health check passed: ${data.status}`);
      return true;
    } else {
      console.log(`   ❌ Health check failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Health check error: ${error.message}`);
    console.log("   Make sure the backend server is running (npm start)");
    return false;
  }
}

// Test 2: Document Upload
async function testDocumentUpload() {
  console.log("\n2️⃣ Testing Document Upload:");
  
  // Create a test PDF content (simple text file for testing)
  const testContent = `
Industrial Safety Manual

Section 1: Safety Procedures
- Always wear protective equipment
- Follow lockout/tagout procedures
- Report incidents immediately

Section 2: Machine Operation
- Check all safety systems before startup
- Monitor temperature and pressure readings
- Shutdown procedures must be followed

Section 3: Emergency Procedures
- Emergency stop locations
- Evacuation routes
- Contact information for emergency services
`;

  try {
    // Create a temporary text file (we'll treat it as PDF for testing)
    const tempFile = path.join(process.cwd(), 'test-document.txt');
    fs.writeFileSync(tempFile, testContent);

    const form = new FormData();
    form.append('file', fs.createReadStream(tempFile), {
      filename: 'test-safety-manual.pdf',
      contentType: 'application/pdf'
    });
    
    form.append('department', 'safety');
    form.append('doc_type', 'manual');
    form.append('version', 'v1.0');

    // Try both endpoints to handle different server configurations
    let response;
    let data;
    
    try {
      response = await fetch(`${BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'X-Admin-Key': ADMIN_API_KEY,
          ...form.getHeaders()
        },
        body: form,
        timeout: 30000
      });
      data = await response.json();
    } catch (error) {
      // Fallback to direct upload endpoint
      response = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'X-Admin-Key': ADMIN_API_KEY,
          ...form.getHeaders()
        },
        body: form,
        timeout: 30000
      });
      data = await response.json();
    }
    
    // Clean up temp file
    fs.unlinkSync(tempFile);

    if (response.ok) {
      console.log(`   ✅ Upload successful:`);
      console.log(`      Document ID: ${data.documentId}`);
      console.log(`      Characters: ${data.characters}`);
      console.log(`      Chunks: ${data.chunks}`);
      return data.documentId;
    } else {
      console.log(`   ❌ Upload failed: ${data.error || 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Upload error: ${error.message}`);
    return null;
  }
}

// Test 3: Chat Query
async function testChatQuery() {
  console.log("\n3️⃣ Testing Chat Query:");
  
  const testQuestions = [
    "What are the safety procedures?",
    "How do I operate the machine safely?",
    "What should I do in an emergency?"
  ];

  for (const question of testQuestions) {
    try {
      // Try both API endpoints to handle different server configurations
      let response;
      let data;
      
      try {
        response = await fetch(`${BASE_URL}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ question, userId: 'test-user' }),
          timeout: 15000
        });
        data = await response.json();
      } catch (error) {
        // Fallback to direct chat endpoint
        response = await fetch(`${BASE_URL}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ question }),
          timeout: 15000
        });
        data = await response.json();
      }

      if (response.ok) {
        console.log(`   ✅ Question: "${question}"`);
        console.log(`      Answer: ${data.answer.substring(0, 100)}...`);
        console.log(`      Sources: ${data.retrieval?.length || 0} documents`);
        
        if (data.retrieval && data.retrieval.length > 0) {
          console.log(`      Top source: ${data.retrieval[0].document.name} (score: ${data.retrieval[0].score})`);
        }
      } else {
        console.log(`   ❌ Chat query failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   ❌ Chat error: ${error.message}`);
    }
    
    console.log(""); // Add spacing between questions
  }
}

// Test 4: Database Verification
async function testDatabaseData() {
  console.log("4️⃣ Testing Database Data:");
  
  try {
    const { query } = await import("../../src/db/postgres.js");
    
    // Check documents
    const docs = await query("SELECT COUNT(*) as count FROM documents");
    console.log(`   ✅ Documents in database: ${docs.rows[0].count}`);
    
    // Check chunks
    const chunks = await query("SELECT COUNT(*) as count FROM chunks");
    console.log(`   ✅ Chunks in database: ${chunks.rows[0].count}`);
    
    // Check embeddings
    const embeddings = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(embedding_cloud) as cloud_count,
        COUNT(embedding_local) as local_count
      FROM embeddings
    `);
    
    console.log(`   ✅ Embeddings in database: ${embeddings.rows[0].total}`);
    console.log(`      Cloud embeddings: ${embeddings.rows[0].cloud_count}`);
    console.log(`      Local embeddings: ${embeddings.rows[0].local_count}`);
    
    // Check PII flags
    const piiChunks = await query("SELECT COUNT(*) as count FROM chunks WHERE pii_masked = true");
    console.log(`   ✅ PII-masked chunks: ${piiChunks.rows[0].count}`);
    
    // Check audit logs
    const auditLogs = await query("SELECT COUNT(*) as count FROM audit_logs");
    console.log(`   ✅ Audit logs: ${auditLogs.rows[0].count}`);
    
  } catch (error) {
    console.log(`   ❌ Database verification failed: ${error.message}`);
  }
}

// Main test runner
async function runAllTests() {
  console.log("Starting comprehensive API tests...\n");
  
  // Test health check first
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log("\n❌ Backend server is not running. Start it with: npm start");
    return;
  }
  
  // Test document upload
  const documentId = await testDocumentUpload();
  
  // Wait a moment for processing
  if (documentId) {
    console.log("\n⏳ Waiting 3 seconds for document processing...");
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Test chat queries
  await testChatQuery();
  
  // Test database data
  await testDatabaseData();
  
  console.log("\n🎉 API Testing Complete!");
  console.log("\n📊 Summary:");
  console.log("   - Health check verifies server is running");
  console.log("   - Upload test verifies document processing pipeline");
  console.log("   - Chat test verifies RAG query system");
  console.log("   - Database test verifies data storage");
  
  process.exit(0);
}

// Run tests if this file is executed directly
runAllTests().catch(console.error);

export { testHealthCheck, testDocumentUpload, testChatQuery, testDatabaseData };