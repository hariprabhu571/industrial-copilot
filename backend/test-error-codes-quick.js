import fetch from 'node-fetch';
import './src/bootstrap.js';

const API_BASE = 'http://localhost:3001/api';

async function testErrorCodesAPI() {
  console.log('🔐 Authenticating...');
  
  // Login first
  const loginResponse = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  
  const loginData = await loginResponse.json();
  
  if (!loginData.success) {
    console.log('❌ Login failed:', loginData);
    return;
  }
  
  const token = loginData.data.token;
  console.log('✅ Login successful');
  
  // Test error codes endpoint
  console.log('\n📋 Testing error codes endpoint...');
  const errorCodesResponse = await fetch(`${API_BASE}/error-codes`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const errorCodesData = await errorCodesResponse.json();
  console.log('Error codes response:', errorCodesData);
  
  // Test statistics endpoint
  console.log('\n📊 Testing statistics endpoint...');
  const statsResponse = await fetch(`${API_BASE}/error-codes/statistics`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const statsData = await statsResponse.json();
  console.log('Statistics response:', statsData);
}

testErrorCodesAPI().catch(console.error);