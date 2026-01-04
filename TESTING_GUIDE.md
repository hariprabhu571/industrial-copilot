# 🧪 Industrial AI Copilot - Testing Guide

## Quick Start Testing

### **Step 1: Environment Setup**

1. **Copy environment file:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Fill in your API keys in `.env`:**
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   ADMIN_API_KEY=your_admin_key_here
   
   # Database settings (adjust if needed)
   POSTGRES_HOST=localhost
   POSTGRES_USER=copilot
   POSTGRES_PASSWORD=copilot
   POSTGRES_DB=copilot_db
   ```

### **Step 2: Database Setup**

1. **Make sure PostgreSQL is running**
2. **Create the database:**
   ```sql
   CREATE DATABASE copilot_db;
   CREATE USER copilot WITH PASSWORD 'copilot';
   GRANT ALL PRIVILEGES ON DATABASE copilot_db TO copilot;
   ```

3. **Run database setup:**
   ```bash
   node setup-database.js
   ```

### **Step 3: Install Dependencies**

```bash
npm install
```

### **Step 4: Run System Tests**

```bash
# Test all components
node test-complete-system.js
```

**Expected Output:**
```
✅ GEMINI_API_KEY: Set
✅ GROQ_API_KEY: Set
✅ PostgreSQL Connected
✅ pgvector extension available
✅ All tables exist
✅ Gemini API working
✅ Groq API working
✅ NLP preprocessing working
✅ Provider tracking fixed
✅ Smart query embedding working
```

### **Step 5: Start Backend Server**

```bash
npm start
```

**Expected Output:**
```
Backend running on port 5000
```

### **Step 6: Run API Tests**

In a new terminal:
```bash
cd backend
node test-api-endpoints.js
```

**Expected Output:**
```
✅ Health check passed
✅ Upload successful: Document ID: xxx-xxx-xxx
✅ Question: "What are the safety procedures?"
   Answer: Based on the uploaded documents...
   Sources: 3 documents
✅ Documents in database: 1
✅ Chunks in database: 15
✅ Embeddings in database: 15
```

## 🔧 **Manual Testing with Postman/Thunder Client**

### **Test 1: Health Check**
```
GET http://localhost:5000/health
```
Expected: `{"status": "Industrial AI Copilot backend running"}`

### **Test 2: Document Upload**
```
POST http://localhost:5000/upload
Headers: X-Admin-Key: your_admin_key
Body: form-data
  - file: [select a PDF file]
  - department: safety
  - doc_type: manual
```

Expected Response:
```json
{
  "documentId": "uuid-here",
  "characters": 12345,
  "chunks": 15,
  "message": "Document parsed, chunked, embedded, and stored persistently"
}
```

### **Test 3: Chat Query**
```
POST http://localhost:5000/chat
Content-Type: application/json

{
  "question": "What are the safety procedures?"
}
```

Expected Response:
```json
{
  "answer": "Based on the uploaded documents, the safety procedures include...",
  "retrieval": [
    {
      "rank": 1,
      "score": 0.8234,
      "document": {
        "name": "safety-manual.pdf",
        "department": "safety"
      },
      "chunk": {
        "section": "safety",
        "preview": "Always wear protective equipment..."
      }
    }
  ]
}
```

## 🗄️ **Database Verification**

Connect to your PostgreSQL database and run:

```sql
-- Check documents
SELECT COUNT(*) FROM documents;

-- Check chunks with PII flags
SELECT section, pii_masked, COUNT(*) 
FROM chunks 
GROUP BY section, pii_masked;

-- Check embeddings distribution
SELECT 
  COUNT(*) as total,
  COUNT(embedding_cloud) as cloud_embeddings,
  COUNT(embedding_local) as local_embeddings
FROM embeddings;

-- Check recent audit logs
SELECT question, created_at 
FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 5;
```

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **"Database connection failed"**
   - Check PostgreSQL is running
   - Verify credentials in `.env`
   - Ensure database exists

2. **"pgvector extension not available"**
   - Install pgvector: `apt-get install postgresql-15-pgvector`
   - Or use a managed database with vector support

3. **"Gemini API failed"**
   - Check your `GEMINI_API_KEY` is correct
   - Verify you have API credits

4. **"Python NLP scripts failed"**
   - Install Python dependencies: `pip install spacy presidio-analyzer presidio-anonymizer`
   - Download spaCy model: `python -m spacy download en_core_web_sm`

5. **"Upload endpoint returns 403"**
   - Check `X-Admin-Key` header matches your `.env` file

## ✅ **Success Indicators**

Your system is working correctly if:

1. ✅ All system tests pass
2. ✅ Documents upload successfully
3. ✅ Chat queries return relevant answers with sources
4. ✅ Database contains documents, chunks, and embeddings
5. ✅ PII-masked chunks are stored with correct flags
6. ✅ Both cloud and local embeddings are being used appropriately

## 🎯 **Next Steps After Testing**

Once all tests pass:

1. **Phase 23**: Build the React frontend
2. **Phase 25**: Add comprehensive unit tests
3. **Phase 26**: Create deployment configuration
4. **Phase 27**: Production hardening

## 📊 **Performance Benchmarks**

Expected performance on a typical system:
- Document upload (10-page PDF): 5-15 seconds
- Chat query response: 1-3 seconds
- Embedding generation: 0.5-2 seconds per chunk
- Vector similarity search: <100ms

If performance is significantly slower, check:
- Database indexes are created
- API rate limits
- Network connectivity to external APIs