// Simple backend test
import fetch from 'node-fetch';

async function testBackend() {
  try {
    console.log('🧪 Testing backend server...\n');
    
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   ✅ Health check passed:', healthData.status);
    } else {
      console.log('   ❌ Health check failed:', healthResponse.status);
      return;
    }
    
    // Test 2: Auth endpoint
    console.log('\n2️⃣ Testing auth endpoint...');
    const authResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('   ✅ Auth test passed, got token:', authData.data.token.substring(0, 20) + '...');
      
      // Test 3: Chat endpoint with token
      console.log('\n3️⃣ Testing chat endpoint...');
      const chatResponse = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.data.token}`
        },
        body: JSON.stringify({ question: 'Hello, test question' })
      });
      
      if (chatResponse.ok) {
        const chatData = await chatResponse.json();
        console.log('   ✅ Chat test passed:', chatData.answer.substring(0, 50) + '...');
      } else {
        const errorText = await chatResponse.text();
        console.log('   ❌ Chat test failed:', chatResponse.status, errorText);
      }
      
    } else {
      const errorText = await authResponse.text();
      console.log('   ❌ Auth test failed:', authResponse.status, errorText);
    }
    
  } catch (error) {
    console.log('❌ Backend test failed:', error.message);
    console.log('\n💡 Make sure to start the backend server first:');
    console.log('   cd backend && npm run dev');
  }
}

testBackend();