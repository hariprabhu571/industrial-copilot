# Industrial AI Copilot - Complete Setup Guide

## 🚀 **Quick Start (15 minutes)**

### **Prerequisites Check**
Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ Python 3.8+ installed
- ✅ Docker Desktop installed and running
- ✅ Git installed
- ✅ Gemini API key
- ✅ Groq API key

---

## 📥 **Step 1: Clone and Setup Project**

### **Clone Repository**
```bash
git clone <repository-url>
cd industrial-ai-copilot
```

### **Install Backend Dependencies**
```bash
cd backend
npm install
```

### **Install Python Dependencies**
```bash
# Install required Python packages
pip install spacy presidio-analyzer presidio-anonymizer sentence-transformers torch nltk transformers numpy pandas

# Download spaCy language model
python -m spacy download en_core_web_sm
```

---

## 🐳 **Step 2: Database Setup with Docker**

### **Start PostgreSQL Database**
```bash
# From project root directory
docker-compose up -d postgres
```

### **Verify Database is Running**
```bash
# Check container status
docker-compose ps

# Test database connection
docker-compose exec postgres pg_isready -U copilot -d copilot_db
```

### **Initialize Database Schema**
```bash
cd backend
node setup-database.js
```

**Expected Output:**
```
✅ PostgreSQL Connected: PostgreSQL 16.11
✅ pgvector extension installed
✅ All tables created
✅ Performance indexes created
✅ Vector operations verified
```

---

## 🔑 **Step 3: Configure Environment Variables**

### **Create Environment File**
```bash
cd backend
cp .env.docker .env
```

### **Edit .env File**
Open `backend/.env` and update with your API keys:

```bash
# API Keys (REQUIRED - Get from respective providers)
GEMINI_API_KEY=your_actual_gemini_api_key_here
GROQ_API_KEY=your_actual_groq_api_key_here

# Admin Security (CHANGE THESE)
ADMIN_API_KEY=your_secure_admin_key_here
JWT_SECRET=your_secure_jwt_secret_here

# Database (Usually no changes needed)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=copilot
POSTGRES_PASSWORD=copilot
POSTGRES_DB=copilot_db

# Server Configuration
PORT=5000
```

### **Get API Keys**

**Gemini API Key:**
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key to your .env file

**Groq API Key:**
1. Go to https://console.groq.com/keys
2. Sign up/sign in
3. Click "Create API Key"
4. Copy the key to your .env file

---

## 🧪 **Step 4: Test System Components**

### **Test Database and APIs**
```bash
cd backend
node test-complete-system.js
```

**Expected Output:**
```
✅ GEMINI_API_KEY: Set
✅ GROQ_API_KEY: Set
✅ PostgreSQL Connected: PostgreSQL 16.11
✅ pgvector extension available
✅ All tables exist
✅ Column 'pii_masked' exists in chunks table
✅ Gemini API working - embedding size: 768
✅ Groq API working - response length: 80 chars
✅ NLP preprocessing working - processed 1 chunks
✅ Smart query embedding working - 768 dimensions
```

### **Test Local Mode (Without APIs)**
```bash
node test-local-mode.js
```

This tests the core functionality without requiring API keys.

---

## 🚀 **Step 5: Start the Backend Server**

### **Start Server**
```bash
npm start
```

**Expected Output:**
```
Backend running on port 5000
```

### **Test Server Health**
In a new terminal:
```bash
# Windows PowerShell
Invoke-WebRequest -Uri "http://localhost:5000/health" | Select-Object -ExpandProperty Content

# Linux/macOS
curl http://localhost:5000/health
```

**Expected Response:**
```json
{"status":"Industrial AI Copilot backend running"}
```

---

## 📄 **Step 6: Test Document Upload**

### **Using API Client (Postman/Thunder Client)**

**Upload Request:**
- **Method**: POST
- **URL**: `http://localhost:5000/upload`
- **Headers**: 
  - `x-admin-key: your_secure_admin_key_here`
- **Body**: form-data
  - Key: `file` (type: File)
  - Value: Select a PDF file
  - Optional: `department: safety`, `doc_type: manual`

**Expected Response:**
```json
{
  "documentId": "uuid-here",
  "characters": 12345,
  "chunks": 25,
  "message": "Document parsed, chunked, embedded, and stored persistently"
}
```

### **Using Test Script**
```bash
# In another terminal
cd backend
node test-api-endpoints.js
```

---

## 💬 **Step 7: Test Chat Queries**

### **Using API Client**

**Chat Request:**
- **Method**: POST
- **URL**: `http://localhost:5000/chat`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "question": "What are the safety procedures?"
}
```

**Expected Response:**
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

---

## 🔍 **Step 8: Verify Database Data**

### **Connect to Database**
```bash
# Using Docker
docker-compose exec postgres psql -U copilot -d copilot_db

# Or using pgAdmin at http://localhost:8080 (if started)
docker-compose --profile admin up -d
```

### **Check Data**
```sql
-- Check uploaded documents
SELECT id, name, department, doc_type, created_at FROM documents ORDER BY created_at DESC LIMIT 5;

-- Check processed chunks
SELECT COUNT(*) as total_chunks, section, COUNT(*) FROM chunks GROUP BY section;

-- Check embeddings
SELECT 
  COUNT(*) as total,
  COUNT(embedding_cloud) as cloud_embeddings,
  COUNT(embedding_local) as local_embeddings
FROM embeddings;

-- Check recent chat queries
SELECT question, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 5;
```

---

## 🛠️ **Troubleshooting**

### **Common Issues**

**1. "Database connection failed"**
```bash
# Check if PostgreSQL container is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

**2. "API key not valid"**
- Verify API keys are correct in `.env`
- Check for extra spaces or quotes
- Ensure you're using the right API endpoints

**3. "Python NLP scripts failed"**
```bash
# Install missing packages
pip install spacy presidio-analyzer presidio-anonymizer sentence-transformers

# Download spaCy model
python -m spacy download en_core_web_sm
```

**4. "Port 5000 already in use"**
```bash
# Change port in .env file
PORT=5001

# Or kill process using port 5000
# Windows: netstat -ano | findstr :5000
# Linux/macOS: lsof -ti:5000 | xargs kill
```

**5. "Docker not found"**
- Install Docker Desktop
- Start Docker Desktop
- Verify: `docker --version`

### **Performance Issues**

**Slow document processing:**
- Check internet connection for API calls
- Verify sufficient RAM (8GB+)
- Monitor Docker resource allocation

**Slow chat responses:**
- Check database indexes are created
- Verify API response times
- Monitor system resources

---

## 🔒 **Security Configuration**

### **Production Security Checklist**
- [ ] Change default admin API key
- [ ] Use strong JWT secret
- [ ] Enable HTTPS in production
- [ ] Restrict database access
- [ ] Set up firewall rules
- [ ] Enable audit logging
- [ ] Regular API key rotation

### **Environment Security**
```bash
# Set restrictive permissions on .env file
chmod 600 backend/.env

# Never commit .env to version control
echo "backend/.env" >> .gitignore
```

---

## 📊 **Monitoring & Maintenance**

### **Health Checks**
```bash
# System health
node test-complete-system.js

# API endpoints
node test-api-endpoints.js

# Database connection
node test-db-connection.js
```

### **Log Monitoring**
```bash
# Backend logs
npm start

# Database logs
docker-compose logs postgres

# System logs
docker-compose logs
```

### **Database Maintenance**
```bash
# Backup database
docker-compose exec postgres pg_dump -U copilot copilot_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U copilot copilot_db < backup.sql

# Clean up old audit logs (optional)
docker-compose exec postgres psql -U copilot -d copilot_db -c "DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '30 days';"
```

---

## 🚀 **Next Steps**

### **Development**
1. **Frontend Development**: Build React.js user interface
2. **Testing**: Add comprehensive test suite
3. **Documentation**: Complete API documentation

### **Production Deployment**
1. **Docker Compose**: Full-stack deployment
2. **Reverse Proxy**: Nginx configuration
3. **SSL Certificates**: HTTPS setup
4. **Monitoring**: Prometheus/Grafana setup

### **Advanced Features**
1. **User Management**: Multi-user support
2. **Document Versioning**: Version control for documents
3. **Analytics**: Usage analytics and reporting

---

## 📞 **Support**

### **Documentation**
- `PROJECT_STATUS.md` - Current progress and roadmap
- `REQUIREMENTS.txt` - System requirements
- `DOCKER_SETUP.md` - Docker-specific setup
- `TESTING_GUIDE.md` - Testing procedures

### **Logs and Debugging**
- Backend logs: Console output from `npm start`
- Database logs: `docker-compose logs postgres`
- API testing: Use test scripts in `backend/` directory

### **Common Commands**
```bash
# Restart everything
docker-compose restart
npm start

# Reset database
docker-compose down -v
docker-compose up -d postgres
node setup-database.js

# Update dependencies
npm update
pip install --upgrade -r requirements.txt
```

---

**🎉 Congratulations! Your Industrial AI Copilot is now running!**

*Last Updated: January 4, 2026*