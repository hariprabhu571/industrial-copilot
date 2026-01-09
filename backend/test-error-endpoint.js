import fetch from 'node-fetch';

async function testErrorEndpoint() {
  try {
    // First login
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Login successful');
    
    // Test error codes endpoint
    console.log('Testing error codes endpoint...');
    const response = await fetch('http://localhost:3001/api/error-codes', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const text = await response.text();
    console.log('Response body (first 200 chars):', text.substring(0, 200));
    
    if (response.headers.get('content-type')?.includes('application/json')) {
      const data = JSON.parse(text);
      console.log('JSON data:', data);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testErrorEndpoint();