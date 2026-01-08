// Application Configuration
// Centralized application configuration for all environments

import dotenv from 'dotenv';
dotenv.config();

export const appConfig = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || '0.0.0.0',
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    }
  },

  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
    adminApiKey: process.env.ADMIN_API_KEY || 'super-admin-key-123',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
  },

  // External APIs Configuration
  apis: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004'
    },
    groq: {
      apiKey: process.env.GROQ_API_KEY,
      primaryModel: process.env.LLM_PRIMARY_MODEL || 'llama-3.1-8b-instant',
      fallbackModel: process.env.LLM_FALLBACK_MODEL || 'llama-3.1-70b-versatile'
    }
  },

  // RAG Configuration
  rag: {
    chunkSize: parseInt(process.env.CHUNK_SIZE) || 800,
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP) || 150,
    minScore: parseFloat(process.env.MIN_SCORE) || 0.5,
    minResults: parseInt(process.env.MIN_RESULTS) || 3,
    minContextChars: parseInt(process.env.MIN_CONTEXT_CHARS) || 500,
    maxResults: parseInt(process.env.MAX_RESULTS) || 10
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    auditEnabled: process.env.AUDIT_ENABLED !== 'false'
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'text/plain'],
    uploadDir: process.env.UPLOAD_DIR || './uploads'
  }
};

export const getConfig = (section) => {
  return section ? appConfig[section] : appConfig;
};