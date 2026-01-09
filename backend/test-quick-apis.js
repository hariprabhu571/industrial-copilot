import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function quickTest() {
  console.log('🧪 Quick API Test...\n');
  
  try {
    // Test health
    console.log('1. Testing health...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    console.log(`Health: ${healthResponse.status} - ${healthResponse.ok ? 'OK' : 'FAILED'}`);
    
    // Test auth
    console.log('\n2. Testing authentication...');
    const authResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    console.log(`Auth: ${authResponse.status} - ${authResponse.ok ? 'OK' : 'FAILED'}`);
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      const token = authData.data.token;
      
      // Test equipment
      console.log('\n3. Testing equipment...');
      const equipmentResponse = await fetch(`${API_BASE}/equipment`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`Equipment: ${equipmentResponse.status} - ${equipmentResponse.ok ? 'OK' : 'FAILED'}`);
      
      // Test error codes
      console.log('\n4. Testing error codes...');
      const errorCodesResponse = await fetch(`${API_BASE}/error-codes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`Error Codes: ${errorCodesResponse.status} - ${errorCodesResponse.ok ? 'OK' : 'FAILED'}`);
      
      // Test documents
      console.log('\n5. Testing documents...');
      const documentsResponse = await fetch(`${API_BASE}/documents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`Documents: ${documentsResponse.status} - ${documentsResponse.ok ? 'OK' : 'FAILED'}`);
      
      // Test chat
      console.log('\n6. Testing chat...');
      const chatResponse = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: 'What is this system?',
          conversationId: 'test'
        })
      });
      console.log(`Chat: ${chatResponse.status} - ${chatResponse.ok ? 'OK' : 'FAILED'}`);
      
      // Test audit
      console.log('\n7. Testing audit...');
      const auditResponse = await fetch(`${API_BASE}/audit`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`Audit: ${auditResponse.status} - ${auditResponse.ok ? 'OK' : 'FAILED'}`);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

quickTest();