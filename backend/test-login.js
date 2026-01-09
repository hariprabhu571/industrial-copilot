import fetch from 'node-fetch';

async function testLogin() {
  try {
    console.log('Testing login...');
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    if (data.token) {
      console.log('✅ Login successful, token received');
    } else {
      console.log('❌ Login failed:', data.message);
    }
  } catch (error) {
    console.error('Login test failed:', error.message);
  }
}

testLogin();