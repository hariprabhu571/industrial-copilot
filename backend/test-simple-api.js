import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 Testing Error Code API...');
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('Health:', healthData);
    
    // Test authentication
    console.log('\n2. Testing authentication...');
    const authResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const authData = await authResponse.json();
    console.log('Auth response:', authData);
    
    if (!authData.data || !authData.data.token) {
      console.log('❌ Authentication failed');
      return;
    }
    
    const token = authData.data.token;
    
    // Test direct test route
    console.log('\n3a. Testing direct test route...');
    const directResponse = await fetch(`${API_BASE}/direct-test`);
    console.log('Direct test route status:', directResponse.status);
    
    if (directResponse.ok) {
      const directData = await directResponse.json();
      console.log('Direct test route data:', directData);
    } else {
      const directError = await directResponse.text();
      console.log('Direct test route error:', directError);
    }
    
    // Test simple test route first
    console.log('\n3b. Testing simple test route...');
    const testResponse = await fetch(`${API_BASE}/test-error-codes`);
    console.log('Test route status:', testResponse.status);
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('Test route data:', testData);
    } else {
      const testError = await testResponse.text();
      console.log('Test route error:', testError);
    }
    
    // Test error codes endpoint
    console.log('\n3b. Testing error codes endpoint...');
    const errorCodesResponse = await fetch(`${API_BASE}/error-codes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Error codes response status:', errorCodesResponse.status);
    console.log('Error codes response headers:', Object.fromEntries(errorCodesResponse.headers));
    
    if (errorCodesResponse.ok) {
      const errorCodesData = await errorCodesResponse.json();
      console.log('Error codes data:', errorCodesData);
    } else {
      const errorText = await errorCodesResponse.text();
      console.log('Error codes error:', errorText);
    }
    
    // Test equipment endpoint (for comparison)
    console.log('\n4. Testing equipment endpoint (for comparison)...');
    const equipmentResponse = await fetch(`${API_BASE}/equipment`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Equipment response status:', equipmentResponse.status);
    
    if (equipmentResponse.ok) {
      const equipmentData = await equipmentResponse.json();
      console.log('Equipment data count:', equipmentData.data?.length || 0);
    } else {
      const equipmentError = await equipmentResponse.text();
      console.log('Equipment error:', equipmentError);
    }
    
    // Test specific error code endpoint
    console.log('\n5. Testing specific error code endpoint...');
    const specificResponse = await fetch(`${API_BASE}/error-codes/code/CONV001`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Specific error code response status:', specificResponse.status);
    
    if (specificResponse.ok) {
      const specificData = await specificResponse.json();
      console.log('Specific error code data:', specificData.data.title);
    } else {
      const specificError = await specificResponse.text();
      console.log('Specific error code error:', specificError);
    }
    
    // Test troubleshooting procedures endpoint
    console.log('\n6. Testing troubleshooting procedures endpoint...');
    const proceduresResponse = await fetch(`${API_BASE}/error-codes/code/CONV001/procedures`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Procedures response status:', proceduresResponse.status);
    
    if (proceduresResponse.ok) {
      const proceduresData = await proceduresResponse.json();
      console.log('Procedures count:', proceduresData.count);
    } else {
      const proceduresError = await proceduresResponse.text();
      console.log('Procedures error:', proceduresError);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testAPI();