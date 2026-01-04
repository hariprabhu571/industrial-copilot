import pkg from "pg";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  user: process.env.POSTGRES_USER || 'copilot',
  password: process.env.POSTGRES_PASSWORD || 'copilot',
  database: process.env.POSTGRES_DB || 'copilot_db',
  ssl: false,
  connectionTimeoutMillis: 5000,
});

export async function query(text, params) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}
