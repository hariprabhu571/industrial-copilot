# 🐳 Docker Setup for Industrial AI Copilot

## Quick Start with Docker

### **Step 1: Start PostgreSQL with Docker**

```bash
# Start PostgreSQL with pgvector extension
docker-compose up -d postgres

# Check if it's running
docker-compose ps
```

### **Step 2: Update Environment Variables**

```bash
cd backend
cp .env.docker .env
```

**Edit `.env` and add your API keys:**
```bash
GEMINI_API_KEY=your_actual_gemini_api_key
GROQ_API_KEY=your_actual_groq_api_key
ADMIN_API_KEY=your_secure_admin_key
```

### **Step 3: Set Up Database Schema**

```bash
# Wait for PostgreSQL to be ready
docker-compose exec postgres pg_isready -U copilot -d copilot_db

# Run database setup
node setup-database.js
```

### **Step 4: Test the System**

```bash
# Run system tests
node test-complete-system.js

# Start the backend
npm start

# In another terminal, test APIs
node test-api-endpoints.js
```

## 🔧 **Docker Commands**

### **Start Services:**
```bash
# Start only PostgreSQL
docker-compose up -d postgres

# Start PostgreSQL + pgAdmin (optional)
docker-compose --profile admin up -d
```

### **Stop Services:**
```bash
docker-compose down
```

### **View Logs:**
```bash
# PostgreSQL logs
docker-compose logs postgres

# Follow logs
docker-compose logs -f postgres
```

### **Database Access:**
```bash
# Connect to PostgreSQL directly
docker-compose exec postgres psql -U copilot -d copilot_db

# Or use pgAdmin at http://localhost:8080
# Email: admin@copilot.com
# Password: admin
```

### **Reset Database:**
```bash
# Stop and remove containers + volumes
docker-compose down -v

# Start fresh
docker-compose up -d postgres
node setup-database.js
```

## 📊 **Database Connection Details**

When using Docker, your connection details are:
```
Host: localhost
Port: 5432
Database: copilot_db
Username: copilot
Password: copilot
```

## 🚨 **Troubleshooting**

### **"Database connection failed"**
```bash
# Check if PostgreSQL is running
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### **"Port 5432 already in use"**
```bash
# Stop any existing PostgreSQL
sudo service postgresql stop

# Or change port in docker-compose.yml
ports:
  - "5433:5432"  # Use port 5433 instead
```

### **"pgvector extension not found"**
The `pgvector/pgvector:pg16` image includes the extension by default.

## 🎯 **Production Notes**

For production:
1. Change default passwords in `docker-compose.yml`
2. Use environment variables for secrets
3. Set up proper volume backups
4. Use managed PostgreSQL service instead of Docker

## 📋 **Complete Setup Checklist**

- [ ] Docker and Docker Compose installed
- [ ] `docker-compose up -d postgres` running
- [ ] `.env` file with real API keys
- [ ] `node setup-database.js` completed
- [ ] `node test-complete-system.js` passes
- [ ] `npm start` works
- [ ] `node test-api-endpoints.js` passes