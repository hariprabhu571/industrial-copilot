import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testAuditAPI() {
  console.log('🧪 Testing Audit API...');
  
  try {
    // Step 1: Authenticate as admin
    console.log('\n1. Testing authentication...');
    const authResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    if (!authResponse.ok) {
      console.log('❌ Authentication failed:', authResponse.status);
      return;
    }
    
    const authData = await authResponse.json();
    if (!authData.data || !authData.data.token) {
      console.log('❌ No token received');
      return;
    }
    
    const token = authData.data.token;
    console.log('✅ Authentication successful');
    
    // Step 2: Test audit test endpoint first
    console.log('\n2. Testing audit test endpoint...');
    const testResponse = await fetch(`${API_BASE}/audit/test`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Audit test response status:', testResponse.status);
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ Audit test endpoint working:', testData.message);
    } else {
      const testError = await testResponse.text();
      console.log('❌ Audit test endpoint failed:', testError);
      return;
    }
    
    // Step 3: Test audit endpoint
    console.log('\n3. Testing audit endpoint...');
    const auditResponse = await fetch(`${API_BASE}/audit`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Audit response status:', auditResponse.status);
    console.log('Audit response headers:', Object.fromEntries(auditResponse.headers));
    
    if (auditResponse.ok) {
      const auditData = await auditResponse.json();
      console.log('✅ Audit API working!');
      console.log('Response structure:', {
        success: auditData.success,
        count: auditData.count,
        logsLength: auditData.logs?.length || 0
      });
      
      if (auditData.logs && auditData.logs.length > 0) {
        console.log('Sample log entry:', {
          id: auditData.logs[0].id,
          timestamp: auditData.logs[0].timestamp,
          hasQuestion: !!auditData.logs[0].question,
          hasAnswer: !!auditData.logs[0].answer
        });
      }
    } else {
      const errorText = await auditResponse.text();
      console.log('❌ Audit API failed');
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAuditAPI();