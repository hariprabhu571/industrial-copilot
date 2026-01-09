# 🐳 Docker Setup for Industrial AI Copilot

## **System Status: 95% Operational - Production Ready**

This guide covers Docker deployment for the Industrial AI Copilot system with enterprise-level organization.

## **Enterprise Deployment Structure**

Docker configuration is located in the `deployment/` folder:
```
deployment/
├── docker-compose.yml     # Main deployment configuration
└── .env.docker           # Docker environment template
```

## Quick Start with Docker

### **Step 1: Start PostgreSQL with Docker**

```bash
# Navigate to deployment folder
cd deployment

# Start PostgreSQL with pgvector extension
docker-compose up -d postgres

# Check if it's running
docker-compose ps
```

### **Step 2: Update Environment Variables**

```bash
# Copy environment template
cd ../backend
cp .env.docker .env
```

**Edit `backend/.env` and add your API keys:**
```bash
GEMINI_API_KEY=your_actual_gemini_api_key
GROQ_API_KEY=your_actual_groq_api_key
ADMIN_API_KEY=your_secure_admin_key
JWT_SECRET=your_secure_jwt_secret

# Database settings (usually no changes needed)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=copilot
POSTGRES_PASSWORD=copilot
POSTGRES_DB=copilot_db
```

### **Step 3: Set Up Database Schema**

```bash
# Wait for PostgreSQL to be ready
cd ../deployment
docker-compose exec postgres pg_isready -U copilot -d copilot_db

# Run database setup
cd ../backend
node setup-database.js
```

**Expected Output:**
```
✅ PostgreSQL Connected: PostgreSQL 16.11
✅ pgvector extension installed
✅ All tables created (documents, chunks, embeddings, equipment)
✅ Performance indexes created
✅ Equipment management schema ready
✅ Sample equipment data loaded
```

### **Step 4: Test the System**

```bash
# Run enterprise test suite
npm run test:all

# Start the backend
npm start

# In another terminal, test APIs
npm run test:integration
```

## 🔧 **Docker Commands**

### **Start Services:**
```bash
# Navigate to deployment folder
cd deployment

# Start only PostgreSQL
docker-compose up -d postgres

# Start PostgreSQL + pgAdmin (optional)
docker-compose --profile admin up -d

# View running services
docker-compose ps
```

### **Stop Services:**
```bash
# From deployment folder
docker-compose down

# Stop and remove volumes (complete reset)
docker-compose down -v
```

### **View Logs:**
```bash
# PostgreSQL logs
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f postgres

# View all service logs
docker-compose logs
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

# Reinitialize database
cd ../backend
node setup-database.js
```

### **Enterprise Operations:**
```bash
# Check system health
cd ../backend
npm run test:setup

# Backup database
cd ../deployment
docker-compose exec postgres pg_dump -U copilot copilot_db > ../backups/backup-$(date +%Y%m%d).sql

# Restore database
docker-compose exec -T postgres psql -U copilot copilot_db < ../backups/backup-20260107.sql
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
cd deployment
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres

# Verify database is ready
docker-compose exec postgres pg_isready -U copilot -d copilot_db
```

### **"Port 5432 already in use"**
```bash
# Stop any existing PostgreSQL
sudo service postgresql stop

# Or change port in deployment/docker-compose.yml
ports:
  - "5433:5432"  # Use port 5433 instead

# Update backend/.env accordingly
POSTGRES_PORT=5433
```

### **"pgvector extension not found"**
The `pgvector/pgvector:pg16` image includes the extension by default. If issues persist:
```bash
# Verify the correct image is being used
cd deployment
docker-compose config

# Check extension in database
docker-compose exec postgres psql -U copilot -d copilot_db -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

### **"Docker not found"**
- Install Docker Desktop from https://docker.com/products/docker-desktop
- Start Docker Desktop
- Verify installation: `docker --version`

### **"Permission denied" errors**
```bash
# On Linux, add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Or run with sudo
sudo docker-compose up -d postgres
```

### **"Volume mount issues"**
```bash
# Reset all Docker data (WARNING: removes all containers/volumes)
docker system prune -a --volumes

# Or just remove project volumes
cd deployment
docker-compose down -v
```

## 🎯 **Production Notes**

### **Security Considerations**
For production deployment:
1. **Change default passwords** in `deployment/docker-compose.yml`
2. **Use environment variables** for secrets instead of hardcoded values
3. **Set up proper volume backups** for data persistence
4. **Use managed PostgreSQL service** instead of Docker for production
5. **Enable SSL/TLS** for database connections
6. **Implement proper firewall rules** and network security

### **Performance Optimization**
```yaml
# In deployment/docker-compose.yml, add resource limits
services:
  postgres:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'
```

### **Monitoring and Logging**
```bash
# Enable detailed logging
cd deployment
docker-compose logs --tail=100 -f postgres

# Monitor resource usage
docker stats

# Set up log rotation
docker-compose config | grep logging -A 5
```

### **Backup Strategy**
```bash
# Automated backup script
#!/bin/bash
cd deployment
BACKUP_DIR="../backups"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U copilot copilot_db > $BACKUP_DIR/backup_$DATE.sql
echo "Backup created: $BACKUP_DIR/backup_$DATE.sql"
```

## 📋 **Complete Setup Checklist**

### **Development Environment:**
- [ ] Docker and Docker Compose installed
- [ ] `cd deployment && docker-compose up -d postgres` running
- [ ] `backend/.env` file with real API keys
- [ ] `cd ../backend && node setup-database.js` completed
- [ ] `npm run test:all` passes
- [ ] `npm start` works
- [ ] Equipment management API tested

### **Production Environment:**
- [ ] Managed PostgreSQL database configured
- [ ] SSL certificates installed
- [ ] Reverse proxy (Nginx) configured
- [ ] Environment variables secured
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting set up
- [ ] Load balancing configured (if needed)
- [ ] Security hardening completed