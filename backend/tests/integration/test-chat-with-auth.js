import dotenv from 'dotenv';
dotenv.config();

async function testChatWithAuth() {
  try {
    console.log('🔐 Testing Chat API with authentication...\n');
    
    // First, login to get a token
    console.log('1️⃣ Logging in as viewer...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'viewer',
        password: 'viewer123'
      })
    });
    
    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      console.log('❌ Login failed:', error);
      return;
    }
    
    const loginResult = await loginResponse.json();
    console.log('   ✅ Login successful');
    console.log('   User:', loginResult.data.user.username, '(' + loginResult.data.user.role + ')');
    
    const token = loginResult.data.token;
    
    // Now test the chat API
    console.log('\n2️⃣ Testing chat API...');
    const question = "based on the documents, how i can create teh student declaration";
    
    const chatResponse = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ question })
    });
    
    console.log('   Response status:', chatResponse.status);
    
    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.log('   ❌ Chat API Error:', errorText);
      return;
    }
    
    const result = await chatResponse.json();
    console.log('\n✅ Chat API Response:');
    console.log('Answer length:', result.answer.length, 'characters');
    console.log('Answer preview:', result.answer.substring(0, 200) + '...');
    console.log('Retrieval count:', result.retrieval?.length || 0);
    
    if (result.retrieval && result.retrieval.length > 0) {
      console.log('\nRetrieved documents:');
      result.retrieval.forEach((doc, i) => {
        console.log(`  ${i+1}. ${doc.document.name} (score: ${doc.score})`);
        console.log(`     Preview: "${doc.chunk.preview.substring(0, 100)}..."`);
      });
    }
    
    // Check if the answer is the generic "not found" message
    if (result.answer.includes("not found in the provided documents")) {
      console.log('\n❌ Still getting "not found" response despite having documents');
    } else {
      console.log('\n🎉 SUCCESS! Chat is working and found relevant information');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testChatWithAuth();