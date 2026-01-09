/**
 * Comprehensive API Test - All Endpoints
 * Tests all major API endpoints including Equipment and Error Codes
 */

import fetch from 'node-fetch';
import './src/bootstrap.js';

const API_BASE = 'http://localhost:3001/api';
let authToken = '';

// Test configuration
const TEST_CONFIG = {
  baseUrl: API_BASE,
  testUser: {
    username: 'admin',
    password: 'admin123'
  }
};

// Helper function to make authenticated requests
async function makeRequest(endpoint, options = {}) {
  const url = `${TEST_CONFIG.baseUrl}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  return { response };
}

// Test functions
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...');
  
  try {
    const { response } = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(TEST_CONFIG.testUser)
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.token) {
        authToken = data.data.token;
        console.log('✅ Authentication successful');
        return true;
      }
    }
    console.log('❌ Authentication failed');
    return false;
  } catch (error) {
    console.log('❌ Authentication error:', error.message);
    return false;
  }
}

async function testHealthEndpoint() {
  console.log('\n🏥 Testing Health Endpoint...');
  
  try {
    const { response } = await makeRequest('/health');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Health check passed:', data.status);
      return true;
    } else {
      console.log('❌ Health check failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    return false;
  }
}

async function testEquipmentAPI() {
  console.log('\n🏭 Testing Equipment API...');
  
  try {
    const { response } = await makeRequest('/equipment');
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Equipment API working - ${data.data?.length || 0} equipment items`);
      
      // Test specific equipment
      if (data.data && data.data.length > 0) {
        const equipmentId = data.data[0].id;
        const { response: detailResponse } = await makeRequest(`/equipment/${equipmentId}`);
        
        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          console.log(`✅ Equipment detail API working - ${detailData.data.name}`);
        } else {
          console.log('❌ Equipment detail API failed');
        }
      }
      
      return true;
    } else {
      console.log('❌ Equipment API failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Equipment API error:', error.message);
    return false;
  }
}

async function testErrorCodesAPI() {
  console.log('\n🚨 Testing Error Codes API...');
  
  try {
    const { response } = await makeRequest('/error-codes');
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Error Codes API working - ${data.count || 0} error codes`);
      
      // Test specific error code
      const { response: specificResponse } = await makeRequest('/error-codes/code/CONV001');
      
      if (specificResponse.ok) {
        const specificData = await specificResponse.json();
        console.log(`✅ Specific error code API working - ${specificData.data.title}`);
        
        // Test troubleshooting procedures
        const { response: proceduresResponse } = await makeRequest('/error-codes/code/CONV001/procedures');
        
        if (proceduresResponse.ok) {
          const proceduresData = await proceduresResponse.json();
          console.log(`✅ Troubleshooting procedures API working - ${proceduresData.count} procedures`);
        } else {
          console.log('❌ Troubleshooting procedures API failed');
        }
      } else {
        console.log('❌ Specific error code API failed');
      }
      
      return true;
    } else {
      console.log('❌ Error Codes API failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Error Codes API error:', error.message);
    return false;
  }
}

async function testChatAPI() {
  console.log('\n💬 Testing Chat API...');
  
  try {
    const { response } = await makeRequest('/chat', {
      method: 'POST',
      body: JSON.stringify({
        question: 'What is this system about?',
        conversationId: 'test-conversation'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Chat API working - response received');
      return true;
    } else {
      console.log('❌ Chat API failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Chat API error:', error.message);
    return false;
  }
}

async function testDocumentsAPI() {
  console.log('\n📄 Testing Documents API...');
  
  try {
    const { response } = await makeRequest('/documents');
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Documents API working - ${data.documents?.length || 0} documents`);
      return true;
    } else {
      console.log('❌ Documents API failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Documents API error:', error.message);
    return false;
  }
}

async function testAuditAPI() {
  console.log('\n📊 Testing Audit API...');
  
  try {
    const { response } = await makeRequest('/audit');
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Audit API working - ${data.logs?.length || 0} audit logs`);
      return true;
    } else {
      console.log('❌ Audit API failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Audit API error:', error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive API Tests...');
  console.log('=====================================');

  const tests = [
    { name: 'Health Endpoint', fn: testHealthEndpoint },
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Equipment API', fn: testEquipmentAPI },
    { name: 'Error Codes API', fn: testErrorCodesAPI },
    { name: 'Chat API', fn: testChatAPI },
    { name: 'Documents API', fn: testDocumentsAPI },
    { name: 'Audit API', fn: testAuditAPI }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ Test "${test.name}" threw an error:`, error.message);
      failed++;
    }
  }

  console.log('\n=====================================');
  console.log('🏁 Test Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! System is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the error messages above.');
  }
  
  return { passed, failed };
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests };