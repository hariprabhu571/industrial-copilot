// Database Configuration
// Centralized database configuration for all environments

import dotenv from 'dotenv';
dotenv.config();

export const databaseConfig = {
  development: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'copilot_db',
    username: process.env.POSTGRES_USER || 'copilot',
    password: process.env.POSTGRES_PASSWORD || 'copilot',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  
  test: {
    host: process.env.TEST_POSTGRES_HOST || 'localhost',
    port: process.env.TEST_POSTGRES_PORT || 5432,
    database: process.env.TEST_POSTGRES_DB || 'copilot_test_db',
    username: process.env.TEST_POSTGRES_USER || 'copilot',
    password: process.env.TEST_POSTGRES_PASSWORD || 'copilot',
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  
  production: {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    dialect: 'postgres',
    logging: false,
    ssl: process.env.NODE_ENV === 'production',
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000
    }
  }
};

export const getCurrentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return databaseConfig[env];
};