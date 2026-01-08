# Industrial AI Copilot - Enterprise Folder Structure

This document outlines the enterprise-level folder organization for the Industrial AI Copilot project, designed for scalability, maintainability, and team collaboration.

## 🏢 **ROOT LEVEL STRUCTURE**

```
industrial-ai-copilot/
├── 📁 backend/                    # Backend API application
├── 📁 frontend/                   # Frontend React/Next.js application
├── 📁 docs/                       # Project documentation
├── 📁 tools/                      # Development and deployment tools
├── 📁 deployment/                 # Deployment configurations
├── 📁 .kiro/                      # Kiro AI assistant specifications
├── 📁 .vscode/                    # VS Code workspace settings
├── 📁 .git/                       # Git version control
├── 📄 .gitignore                  # Git ignore rules
├── 📄 README.md                   # Main project documentation
├── 📄 PROJECT_STATUS.md           # Current project status
└── 📄 LICENSE                     # Project license
```

## 🔧 **BACKEND STRUCTURE**

```
backend/
├── 📁 src/                        # Source code
│   ├── 📁 adapters/               # Data access adapters (Database, External APIs)
│   ├── 📁 auth/                   # Authentication & authorization
│   ├── 📁 config/                 # Configuration files
│   ├── 📁 db/                     # Database connections & utilities
│   ├── 📁 models/                 # Data models & schemas
│   ├── 📁 nlp/                    # Natural Language Processing
│   ├── 📁 rag/                    # Retrieval-Augmented Generation
│   ├── 📁 routes/                 # API route handlers
│   ├── 📁 services/               # Business logic services
│   ├── 📄 bootstrap.js            # Application bootstrap
│   ├── 📄 env.js                  # Environment configuration
│   └── 📄 index.js                # Main application entry point
├── 📁 tests/                      # Test suite (organized by type)
│   ├── 📁 unit/                   # Unit tests
│   ├── 📁 integration/            # Integration tests
│   ├── 📁 system/                 # System tests
│   ├── 📁 setup/                  # Setup tests
│   ├── 📄 run-tests.js            # Test runner
│   └── 📄 README.md               # Test documentation
├── 📁 config/                     # Configuration files
│   ├── 📄 app.js                  # Application configuration
│   ├── 📄 database.js             # Database configuration
│   └── 📄 environments/           # Environment-specific configs
├── 📁 docs/                       # Backend-specific documentation
│   ├── 📄 CRITICAL_FIXES_README.md
│   ├── 📄 PHASE29_COMPLETION_STATUS.md
│   ├── 📄 POSTMAN_TESTING_GUIDE.md
│   └── 📄 Phase29_Equipment_Management.postman_collection.json
├── 📁 sql/                        # Database schemas & scripts
│   ├── 📄 schema.sql              # Main database schema
│   ├── 📄 equipment-schema.sql    # Equipment management schema
│   └── 📄 equipment-sample-data.sql # Sample data
├── 📁 migrations/                 # Database migrations
│   ├── 📄 migrate.sql             # Migration scripts
│   └── 📄 001_initial_schema.sql  # Versioned migrations
├── 📁 scripts/                    # Python & utility scripts
│   ├── 📄 nlp_runner.py           # NLP processing
│   ├── 📄 local_embedder.py       # Local embedding service
│   └── 📄 generateToken.js        # Token generation utility
├── 📁 tools/                      # Development tools
│   ├── 📄 setup-database.js       # Database setup
│   ├── 📄 create-test-users.js    # Test user creation
│   └── 📄 data-seeding/           # Data seeding scripts
├── 📁 node_modules/               # Dependencies (auto-generated)
├── 📄 package.json                # Node.js dependencies & scripts
├── 📄 package-lock.json           # Dependency lock file
├── 📄 .env                        # Environment variables (local)
├── 📄 .env.example                # Environment template
├── 📄 .env.docker                 # Docker environment
└── 📄 .gitignore                  # Backend-specific git ignore
```

## 🖥️ **FRONTEND STRUCTURE**

```
frontend/
├── 📁 app/                        # Next.js app directory
│   ├── 📁 audit/                  # Audit log pages
│   ├── 📁 chat/                   # Chat interface
│   ├── 📁 dashboard/              # Dashboard pages
│   ├── 📁 documents/              # Document management
│   ├── 📁 upload/                 # File upload pages
│   ├── 📁 users/                  # User management
│   ├── 📄 globals.css             # Global styles
│   ├── 📄 layout.tsx              # Root layout
│   └── 📄 page.tsx                # Home page
├── 📁 components/                 # Reusable UI components
│   ├── 📁 ui/                     # Base UI components
│   ├── 📄 app-header.tsx          # Application header
│   ├── 📄 app-sidebar.tsx         # Navigation sidebar
│   ├── 📄 authenticated-layout.tsx # Auth layout wrapper
│   ├── 📄 chat-message.tsx        # Chat message component
│   ├── 📄 conversation-sidebar.tsx # Chat sidebar
│   ├── 📄 login-form.tsx          # Login form
│   ├── 📄 stat-card.tsx           # Statistics card
│   ├── 📄 theme-provider.tsx      # Theme context
│   └── 📄 theme-toggle.tsx        # Dark/light mode toggle
├── 📁 lib/                        # Utility libraries
│   ├── 📄 auth.ts                 # Authentication utilities
│   ├── 📄 store.ts                # State management
│   └── 📄 utils.ts                # General utilities
├── 📁 .next/                      # Next.js build output (auto-generated)
├── 📁 node_modules/               # Dependencies (auto-generated)
├── 📄 components.json             # UI component configuration
├── 📄 next.config.mjs             # Next.js configuration
├── 📄 next-env.d.ts               # Next.js TypeScript definitions
├── 📄 package.json                # Dependencies & scripts
├── 📄 package-lock.json           # Dependency lock file
├── 📄 postcss.config.mjs          # PostCSS configuration
├── 📄 README.md                   # Frontend documentation
└── 📄 tsconfig.json               # TypeScript configuration
```

## 📚 **DOCUMENTATION STRUCTURE**

```
docs/
├── 📄 DOCKER_SETUP.md             # Docker setup guide
├── 📄 SETUP_GUIDE.md              # Installation & setup
├── 📄 TESTING_GUIDE.md            # Testing procedures
├── 📄 REQUIREMENTS.txt            # Project requirements
├── 📄 ENTERPRISE_STRUCTURE.md     # This file
├── 📁 api/                        # API documentation
│   ├── 📄 endpoints.md            # API endpoint reference
│   ├── 📄 authentication.md       # Auth documentation
│   └── 📄 equipment.md            # Equipment API docs
├── 📁 architecture/               # System architecture
│   ├── 📄 overview.md             # System overview
│   ├── 📄 database-design.md      # Database architecture
│   ├── 📄 security.md             # Security architecture
│   └── 📄 rag-pipeline.md         # RAG system design
├── 📁 deployment/                 # Deployment guides
│   ├── 📄 production.md           # Production deployment
│   ├── 📄 staging.md              # Staging environment
│   └── 📄 monitoring.md           # Monitoring setup
└── 📁 user-guides/                # End-user documentation
    ├── 📄 admin-guide.md           # Administrator guide
    ├── 📄 user-manual.md           # User manual
    └── 📄 troubleshooting.md       # Common issues
```

## 🛠️ **TOOLS STRUCTURE**

```
tools/
├── 📁 development/                # Development utilities
│   ├── 📄 local-setup.sh          # Local environment setup
│   ├── 📄 reset-database.sh       # Database reset script
│   └── 📄 generate-docs.js        # Documentation generator
├── 📁 deployment/                 # Deployment scripts
│   ├── 📄 deploy-staging.sh       # Staging deployment
│   ├── 📄 deploy-production.sh    # Production deployment
│   └── 📄 health-check.sh         # Health monitoring
├── 📁 data/                       # Data management tools
│   ├── 📄 backup-database.sh      # Database backup
│   ├── 📄 restore-database.sh     # Database restore
│   └── 📄 migrate-data.js         # Data migration
└── 📁 monitoring/                 # Monitoring tools
    ├── 📄 log-analyzer.py          # Log analysis
    ├── 📄 performance-monitor.js   # Performance monitoring
    └── 📄 alert-system.js          # Alert notifications
```

## 🚀 **DEPLOYMENT STRUCTURE**

```
deployment/
├── 📄 docker-compose.yml          # Docker Compose configuration
├── 📁 docker/                     # Docker configurations
│   ├── 📄 Dockerfile.backend      # Backend Docker image
│   ├── 📄 Dockerfile.frontend     # Frontend Docker image
│   └── 📄 Dockerfile.nginx        # Nginx reverse proxy
├── 📁 kubernetes/                 # Kubernetes manifests
│   ├── 📄 namespace.yaml          # K8s namespace
│   ├── 📄 backend-deployment.yaml # Backend deployment
│   ├── 📄 frontend-deployment.yaml # Frontend deployment
│   ├── 📄 database-statefulset.yaml # Database StatefulSet
│   └── 📄 ingress.yaml            # Ingress configuration
├── 📁 terraform/                  # Infrastructure as Code
│   ├── 📄 main.tf                 # Main Terraform config
│   ├── 📄 variables.tf            # Variable definitions
│   └── 📄 outputs.tf              # Output definitions
├── 📁 ansible/                    # Configuration management
│   ├── 📄 playbook.yml            # Ansible playbook
│   ├── 📄 inventory.ini           # Server inventory
│   └── 📄 roles/                  # Ansible roles
└── 📁 environments/               # Environment-specific configs
    ├── 📄 development.env          # Development environment
    ├── 📄 staging.env              # Staging environment
    └── 📄 production.env           # Production environment
```

## 🔧 **CONFIGURATION MANAGEMENT**

### **Environment-Specific Configurations**
- **Development**: Local development settings
- **Testing**: Test environment configurations
- **Staging**: Pre-production environment
- **Production**: Production-ready configurations

### **Configuration Files**
- **Database**: Connection strings, pool settings
- **APIs**: External service configurations
- **Security**: JWT secrets, encryption keys
- **Logging**: Log levels, output formats
- **Monitoring**: Metrics and alerting

## 📊 **BENEFITS OF THIS STRUCTURE**

### **🎯 Scalability**
- Clear separation of concerns
- Easy to add new features and modules
- Supports team growth and collaboration

### **🔧 Maintainability**
- Logical file organization
- Easy to locate and modify code
- Consistent naming conventions

### **🚀 Deployment**
- Environment-specific configurations
- Infrastructure as Code support
- Container-ready structure

### **👥 Team Collaboration**
- Clear ownership boundaries
- Standardized folder structure
- Easy onboarding for new developers

### **🔍 Monitoring & Debugging**
- Centralized logging configuration
- Easy access to documentation
- Clear separation of concerns

## 📝 **NAMING CONVENTIONS**

### **Folders**
- Use lowercase with hyphens: `user-management`
- Be descriptive: `equipment-adapters` not `adapters`
- Group by functionality: `auth/`, `rag/`, `models/`

### **Files**
- Use camelCase for JavaScript: `userService.js`
- Use kebab-case for configs: `database-config.js`
- Use descriptive names: `equipmentManagementService.js`

### **Environment Variables**
- Use UPPER_CASE with underscores: `DATABASE_URL`
- Group by prefix: `POSTGRES_HOST`, `POSTGRES_PORT`
- Be explicit: `JWT_SECRET_KEY` not `SECRET`

## 🔄 **MIGRATION GUIDE**

When moving to this structure:
1. **Backup current codebase**
2. **Create new folder structure**
3. **Move files systematically**
4. **Update import paths**
5. **Update configuration files**
6. **Test all functionality**
7. **Update documentation**

This enterprise structure provides a solid foundation for scaling the Industrial AI Copilot to handle complex enterprise requirements while maintaining code quality and team productivity.