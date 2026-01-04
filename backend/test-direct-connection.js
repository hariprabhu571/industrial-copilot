// Direct database connection test
import pkg from "pg";
const { Client } = pkg;

async function testDirectConnection() {
  console.log('🔍 Testing direct database connection...\n');
  
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'copilot',
    password: 'copilot',
    database: 'copilot_db',
    ssl: false
  });
  
  try {
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT version()');
    console.log('✅ PostgreSQL version:', result.rows[0].version.split(' ')[0], result.rows[0].version.split(' ')[1]);
    
    // Test pgvector
    try {
      await client.query("SELECT '[1,2,3]'::vector <=> '[1,2,4]'::vector as distance");
      console.log('✅ pgvector extension working');
    } catch (error) {
      console.log('⚠️  pgvector test failed:', error.message);
    }
    
    await client.end();
    console.log('\n🎉 Database connection is working!');
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure Docker container is running:');
    console.log('   docker ps | grep postgres');
    console.log('2. Check container logs:');
    console.log('   docker logs copilot-postgres');
    console.log('3. Try connecting directly:');
    console.log('   docker exec -it copilot-postgres psql -U copilot -d copilot_db');
  }
  
  process.exit(0);
}

testDirectConnection();