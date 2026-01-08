// Industrial AI Copilot - Comprehensive System Test Suite
// Consolidates all testing functionality into a single file

import dotenv from 'dotenv';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const API_BASE = 'http://localhost:3001/api';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'super-admin-key-123';

const TEST_USERS = {
  admin: { username: 'admin', password: 'admin123' },
  plantManager: { username: 'plant.manager', password: 'manager123' },
  technician: { username: 'tech.senior', password: 'tech123' },
  operator: { username: 'operator.line1', password: 'operator123' }
};

console.log("🔧 Industrial AI Copilot - Comprehensive System Test Suite\n");

class SystemTester {
  constructor() {
    this.tokens = {};
    this.testResults = {
      passed: 0,
      failed: 0,
      warnings: 0
    };
  }

  log(message, type = 'info') {
    const symbols = { info: '   ', success: '   ✅', error: '   ❌', warning: '   ⚠️' };
    console.log(`${symbols[type]} ${message}`);
    if (type === 'success') this.testResults.passed++;
    if (type === 'error') this.testResults.failed++;
    if (type === 'warning') this.testResults.warnings++;
  }

  // ==================== ENVIRONMENT TESTS ====================
  async testEnvironment() {
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
        this.log(`${varName}: Set`, 'success');
      } else {
        this.log(`${varName}: Missing`, 'error');
        envOk = false;
      }
    });

    if (!envOk) {
      console.log("\n❌ Environment variables missing. Please check your .env file.");
      process.exit(1);
    }
    console.log("");
  }

  // ==================== DATABASE TESTS ====================
  async testDatabase() {
    console.log("2️⃣ Testing Database Connection:");
    
    try {
      const { query } = await import("../../src/db/postgres.js");
      
      // Test connection
      const result = await query("SELECT version()");
      this.log(`PostgreSQL Connected: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`, 'success');
      
      // Check pgvector extension
      try {
        await query("CREATE EXTENSION IF NOT EXISTS vector");
        this.log("pgvector extension available", 'success');
      } catch (error) {
        this.log(`pgvector extension error: ${error.message}`, 'error');
      }

      // Check tables
      const tables = ['documents', 'chunks', 'embeddings', 'audit_logs'];
      for (const table of tables) {
        try {
          const tableResult = await query(`SELECT COUNT(*) FROM ${table}`);
          this.log(`Table '${table}' exists`, 'success');
        } catch (error) {
          this.log(`Table '${table}' missing: ${error.message}`, 'error');
        }
      }

      // Check for pii_masked column
      try {
        const columnCheck = await query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = 'chunks' AND column_name = 'pii_masked'
        `);
        if (columnCheck.rows.length > 0) {
          this.log("Column 'pii_masked' exists in chunks table", 'success');
        } else {
          this.log("Column 'pii_masked' missing in chunks table", 'warning');
        }
      } catch (error) {
        this.log(`Column check error: ${error.message}`, 'error');
      }

    } catch (error) {
      this.log(`Database connection failed: ${error.message}`, 'error');
    }
    console.log("");
  }

  // ==================== API TESTS ====================
  async testExternalAPIs() {
    console.log("3️⃣ Testing External API Connections:");
    
    // Test Gemini API
    try {
      const { embedQuery } = await import("../../src/rag/embeddings.js");
      const testEmbedding = await embedQuery("test query");
      this.log(`Gemini API working - embedding size: ${testEmbedding.length}`, 'success');
    } catch (error) {
      this.log(`Gemini API failed: ${error.message}`, 'error');
    }

    // Test Groq API
    try {
      const { generateAnswer } = await import("../../src/rag/chatCompletion.js");
      const testAnswer = await generateAnswer("Test question", "Test context");
      this.log(`Groq API working - response length: ${testAnswer.length} chars`, 'success');
    } catch (error) {
      this.log(`Groq API failed: ${error.message}`, 'error');
    }
    console.log("");
  }

  // ==================== NLP TESTS ====================
  async testNLPPipeline() {
    console.log("4️⃣ Testing Python NLP Scripts:");
    
    try {
      const { preprocessText } = await import("../../src/nlp/preprocessText.js");
      const testResult = await preprocessText("This is a test document with some content.");
      this.log(`NLP preprocessing working - processed ${testResult.length} chunks`, 'success');
    } catch (error) {
      this.log(`NLP preprocessing failed: ${error.message}`, 'error');
    }
    console.log("");
  }

  // ==================== AUTHENTICATION TESTS ====================
  async testAuthentication() {
    console.log("5️⃣ Testing Authentication System:");
    
    for (const [role, credentials] of Object.entries(TEST_USERS)) {
      try {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        
        if (data.success) {
          this.tokens[role] = data.data.token;
          this.log(`${role} authenticated successfully`, 'success');
        } else {
          this.log(`${role} authentication failed: ${data.error}`, 'error');
        }
      } catch (error) {
        this.log(`${role} authentication error: ${error.message}`, 'error');
      }
    }
    console.log("");
  }

  // ==================== EQUIPMENT API TESTS ====================
  async testEquipmentAPI() {
    console.log("6️⃣ Testing Equipment Management API:");
    
    if (!this.tokens.admin) {
      this.log("Admin token not available, skipping equipment tests", 'warning');
      console.log("");
      return;
    }

    try {
      // Test equipment search
      const searchResponse = await fetch(`${API_BASE}/equipment`, {
        headers: { 'Authorization': `Bearer ${this.tokens.admin}` }
      });
      
      if (searchResponse.ok) {
        const equipmentData = await searchResponse.json();
        this.log(`Equipment search working: ${equipmentData.data?.length || 0} items`, 'success');
      } else {
        this.log(`Equipment search failed: ${searchResponse.status}`, 'error');
      }

      // Test equipment details
      const detailResponse = await fetch(`${API_BASE}/equipment/EQ-PMP-001`, {
        headers: { 'Authorization': `Bearer ${this.tokens.admin}` }
      });
      
      if (detailResponse.ok) {
        const detailData = await detailResponse.json();
        this.log(`Equipment details working: ${detailData.data?.name || 'Unknown'}`, 'success');
      } else {
        this.log(`Equipment details failed: ${detailResponse.status}`, 'error');
      }

    } catch (error) {
      this.log(`Equipment API error: ${error.message}`, 'error');
    }
    console.log("");
  }

  // ==================== DOCUMENT UPLOAD TESTS ====================
  async testDocumentUpload() {
    console.log("7️⃣ Testing Document Upload:");
    
    try {
      // Create test document
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
`;

      const tempFile = path.join(process.cwd(), 'test-document.txt');
      fs.writeFileSync(tempFile, testContent);

      const form = new FormData();
      form.append('file', fs.createReadStream(tempFile), {
        filename: 'test-safety-manual.txt',
        contentType: 'text/plain'
      });
      
      form.append('department', 'safety');
      form.append('doc_type', 'manual');
      form.append('version', 'v1.0');

      const response = await fetch(`${API_BASE}/upload-legacy/legacy`, {
        method: 'POST',
        headers: {
          'x-admin-key': ADMIN_API_KEY,
          ...form.getHeaders()
        },
        body: form
      });

      // Clean up temp file
      fs.unlinkSync(tempFile);

      if (response.ok) {
        const data = await response.json();
        this.log(`Document upload successful: ${data.documentId}`, 'success');
        this.log(`Characters: ${data.characters}, Chunks: ${data.chunks}`, 'info');
      } else {
        const errorText = await response.text();
        this.log(`Document upload failed: ${errorText}`, 'error');
      }

    } catch (error) {
      this.log(`Document upload error: ${error.message}`, 'error');
    }
    console.log("");
  }

  // ==================== CHAT API TESTS ====================
  async testChatAPI() {
    console.log("8️⃣ Testing Chat API:");
    
    if (!this.tokens.admin) {
      this.log("Admin token not available, skipping chat tests", 'warning');
      console.log("");
      return;
    }

    const testQuestions = [
      "What are the safety procedures?",
      "How do I operate the machine safely?",
      "What should I do in an emergency?"
    ];

    for (const question of testQuestions) {
      try {
        const response = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.tokens.admin}`
          },
          body: JSON.stringify({ question })
        });

        if (response.ok) {
          const data = await response.json();
          this.log(`Chat query successful: "${question.substring(0, 30)}..."`, 'success');
          this.log(`Answer length: ${data.answer.length} chars, Sources: ${data.retrieval?.length || 0}`, 'info');
        } else {
          const errorText = await response.text();
          this.log(`Chat query failed: ${errorText}`, 'error');
        }
      } catch (error) {
        this.log(`Chat error: ${error.message}`, 'error');
      }
    }
    console.log("");
  }

  // ==================== DATABASE DATA VERIFICATION ====================
  async testDatabaseData() {
    console.log("9️⃣ Testing Database Data:");
    
    try {
      const { query } = await import("../../src/db/postgres.js");
      
      // Check documents
      const docs = await query("SELECT COUNT(*) as count FROM documents");
      this.log(`Documents in database: ${docs.rows[0].count}`, 'success');
      
      // Check chunks
      const chunks = await query("SELECT COUNT(*) as count FROM chunks");
      this.log(`Chunks in database: ${chunks.rows[0].count}`, 'success');
      
      // Check embeddings
      const embeddings = await query(`
        SELECT 
          COUNT(*) as total,
          COUNT(embedding_cloud) as cloud_count,
          COUNT(embedding_local) as local_count
        FROM embeddings
      `);
      
      this.log(`Embeddings in database: ${embeddings.rows[0].total}`, 'success');
      this.log(`Cloud embeddings: ${embeddings.rows[0].cloud_count}`, 'info');
      this.log(`Local embeddings: ${embeddings.rows[0].local_count}`, 'info');
      
      // Check PII flags
      const piiChunks = await query("SELECT COUNT(*) as count FROM chunks WHERE pii_masked = true");
      this.log(`PII-masked chunks: ${piiChunks.rows[0].count}`, 'success');
      
      // Check audit logs
      const auditLogs = await query("SELECT COUNT(*) as count FROM audit_logs");
      this.log(`Audit logs: ${auditLogs.rows[0].count}`, 'success');
      
    } catch (error) {
      this.log(`Database verification failed: ${error.message}`, 'error');
    }
    console.log("");
  }

  // ==================== HEALTH CHECK ====================
  async testHealthCheck() {
    console.log("🔟 Testing API Health Check:");
    
    try {
      const response = await fetch(`${API_BASE}/health`);
      const data = await response.json();
      
      if (response.ok) {
        this.log(`Health check passed: ${data.status}`, 'success');
      } else {
        this.log(`Health check failed: ${response.status}`, 'error');
      }
    } catch (error) {
      this.log(`Health check error: ${error.message}`, 'error');
      this.log("Make sure the backend server is running (npm start)", 'info');
    }
    console.log("");
  }

  // ==================== MAIN TEST RUNNER ====================
  async runAllTests() {
    console.log("Starting comprehensive system tests...\n");
    
    await this.testEnvironment();
    await this.testDatabase();
    await this.testExternalAPIs();
    await this.testNLPPipeline();
    await this.testHealthCheck();
    await this.testAuthentication();
    await this.testEquipmentAPI();
    await this.testDocumentUpload();
    await this.testChatAPI();
    await this.testDatabaseData();
    
    // Print summary
    console.log("🎉 System Test Complete!\n");
    console.log("📊 Test Results Summary:");
    console.log(`   ✅ Passed: ${this.testResults.passed}`);
    console.log(`   ❌ Failed: ${this.testResults.failed}`);
    console.log(`   ⚠️  Warnings: ${this.testResults.warnings}`);
    
    if (this.testResults.failed === 0) {
      console.log("\n🚀 All critical tests passed! System is ready for production.");
    } else {
      console.log(`\n⚠️  ${this.testResults.failed} tests failed. Please review and fix issues.`);
    }
    
    console.log("\n📋 Next Steps:");
    console.log("   1. If any tests failed, fix those issues first");
    console.log("   2. Run the backend server: npm start");
    console.log("   3. Test the frontend at: http://localhost:3000");
    console.log("   4. Upload documents and test chat functionality");
    console.log("   5. Test equipment management features");
    
    process.exit(this.testResults.failed > 0 ? 1 : 0);
  }
}

// Run tests if this file is executed directly
const tester = new SystemTester();
tester.runAllTests().catch(console.error);

export default SystemTester;
