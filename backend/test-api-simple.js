import fetch from 'node-fetch';
import './src/bootstrap.js';

const API_BASE = 'http://localhost:3001/api';

async function testErrorCodeAPI() {
  try {
    console.log('🚀 Testing Error Code API...');
    
    // 1. Login to get token
    console.log('🔐 Logging in...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.data || !loginData.data.token) {
      throw new Error('Login failed: ' + (loginData.message || 'No token received'));
    }
    
    const token = loginData.data.token;
    console.log('✅ Login successful');
    
    // 2. Test get all error codes
    console.log('📋 Testing get all error codes...');
    const errorCodesResponse = await fetch(`${API_BASE}/error-codes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const errorCodesData = await errorCodesResponse.json();
    if (errorCodesData.success) {
      console.log(`✅ Found ${errorCodesData.count} error codes`);
      console.log('Sample codes:');
      errorCodesData.data.slice(0, 3).forEach(code => {
        console.log(`  - ${code.code}: ${code.title} (${code.severity_level})`);
      });
    } else {
      console.log('❌ Failed to get error codes:', errorCodesData.message);
    }
    
    // 3. Test get specific error code
    console.log('🎯 Testing get specific error code...');
    const specificCodeResponse = await fetch(`${API_BASE}/error-codes/code/CONV001`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const specificCodeData = await specificCodeResponse.json();
    if (specificCodeData.success) {
      console.log(`✅ Found error code: ${specificCodeData.data.code} - ${specificCodeData.data.title}`);
    } else {
      console.log('❌ Failed to get specific error code:', specificCodeData.message);
    }
    
    // 4. Test get procedures
    console.log('🔧 Testing get troubleshooting procedures...');
    const proceduresResponse = await fetch(`${API_BASE}/error-codes/code/CONV001/procedures`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const proceduresData = await proceduresResponse.json();
    if (proceduresData.success) {
      console.log(`✅ Found ${proceduresData.count} procedures for CONV001`);
      proceduresData.data.forEach(proc => {
        console.log(`  Step ${proc.step_number}: ${proc.title} (${proc.estimated_time_minutes} min)`);
      });
    } else {
      console.log('❌ Failed to get procedures:', proceduresData.message);
    }
    
    // 5. Test search
    console.log('🔍 Testing search error codes...');
    const searchResponse = await fetch(`${API_BASE}/error-codes/search/CONV`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const searchData = await searchResponse.json();
    if (searchData.success) {
      console.log(`✅ Found ${searchData.count} error codes matching "CONV"`);
      searchData.data.forEach(code => {
        console.log(`  - ${code.code}: ${code.title}`);
      });
    } else {
      console.log('❌ Failed to search error codes:', searchData.message);
    }
    
    // 6. Test statistics
    console.log('📊 Testing get statistics...');
    const statsResponse = await fetch(`${API_BASE}/error-codes/statistics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const statsData = await statsResponse.json();
    if (statsData.success) {
      console.log('✅ Retrieved error code statistics:');
      console.log(`  Total: ${statsData.data.totalErrorCodes}`);
      console.log(`  Critical: ${statsData.data.criticalErrors}`);
      console.log(`  High: ${statsData.data.highErrors}`);
      console.log(`  Medium: ${statsData.data.mediumErrors}`);
      console.log(`  Low: ${statsData.data.lowErrors}`);
    } else {
      console.log('❌ Failed to get statistics:', statsData.message);
    }
    
    console.log('\n🎉 Error Code API testing complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testErrorCodeAPI();