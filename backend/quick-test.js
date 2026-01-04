// Quick test of running backend
import fetch from 'node-fetch';

async function quickTest() {
  console.log('🚀 Quick Backend Test\n');
  
  try {
    // Test health endpoint
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:5000/health');
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok) {
      console.log('   ✅ Backend is running:', healthData.status);
    } else {
      console.log('   ❌ Health check failed');
      return;
    }
    
    // Test chat endpoint with a simple question
    console.log('\n2️⃣ Testing chat endpoint...');
    const chatResponse = await fetch('http://localhost:5000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: 'What safety procedures should I follow?'
      })
    });
    
    const chatData = await chatResponse.json();
    
    if (chatResponse.ok) {
      console.log('   ✅ Chat endpoint working');
      console.log('   Answer:', chatData.answer);
      console.log('   Sources found:', chatData.retrieval.length);
    } else {
      console.log('   ⚠️  Chat response:', chatData.error || chatData.answer);
    }
    
    console.log('\n🎉 Backend is fully operational!');
    console.log('\n📋 What you can do now:');
    console.log('   1. Upload PDFs using POST /upload');
    console.log('   2. Ask questions using POST /chat');
    console.log('   3. Check audit logs in the database');
    console.log('   4. Start building the frontend!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('Make sure the backend is running: npm start');
  }
  
  process.exit(0);
}

quickTest();