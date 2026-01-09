import { query } from './src/db/postgres.js';
import './src/bootstrap.js';

async function checkEquipment() {
  try {
    const result = await query('SELECT id, name FROM equipment LIMIT 5');
    console.log('Equipment IDs:');
    result.rows.forEach(eq => console.log(`  ${eq.id}: ${eq.name}`));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkEquipment();