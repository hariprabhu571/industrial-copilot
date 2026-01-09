/**
 * Error Code API Test Script
 * Phase 32: Error Code & Troubleshooting System
 */

import fetch from 'node-fetch';
import './src/bootstrap.js';

const API_BASE = 'http://localhost:5000/api';
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

  const data = await response.json();
  return { response, data };
}

// Test functions
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...');
  
  try {
    const { response, data } = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(TEST_CONFIG.testUser)
    });

    if (response.ok && data.token) {
      authToken = data.token;
      console.log('✅ Authentication successful');
      return true;
    } else {
      console.log('❌ Authentication failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Authentication error:', error.message);
    return false;
  }
}

async function testGetAllErrorCodes() {
  console.log('\n📋 Testing Get All Error Codes...');
  
  try {
    const { response, data } = await makeRequest('/error-codes');
    
    if (response.ok) {
      console.log(`✅ Retrieved ${data.count} error codes`);
      console.log('Sample error codes:');
      data.data.slice(0, 3).forEach(code => {
        console.log(`  - ${code.code}: ${code.title} (${code.severityLevel})`);
      });
      return true;
    } else {
      console.log('❌ Failed to get error codes:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error getting error codes:', error.message);
    return false;
  }
}

async function testSearchErrorCodes() {
  console.log('\n🔍 Testing Search Error Codes...');
  
  try {
    const searchTerm = 'CONV';
    const { response, data } = await makeRequest(`/error-codes/search/${searchTerm}`);
    
    if (response.ok) {
      console.log(`✅ Found ${data.count} error codes matching "${searchTerm}"`);
      data.data.forEach(code => {
        console.log(`  - ${code.code}: ${code.title}`);
      });
      return true;
    } else {
      console.log('❌ Failed to search error codes:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error searching error codes:', error.message);
    return false;
  }
}

async function testGetErrorCodeByCode() {
  console.log('\n🎯 Testing Get Error Code by Code...');
  
  try {
    const errorCode = 'CONV001';
    const { response, data } = await makeRequest(`/error-codes/code/${errorCode}`);
    
    if (response.ok) {
      console.log(`✅ Retrieved error code ${errorCode}:`);
      console.log(`  Title: ${data.data.title}`);
      console.log(`  Severity: ${data.data.severityLevel}`);
      console.log(`  Category: ${data.data.category}`);
      console.log(`  Equipment: ${data.data.equipmentName || 'N/A'}`);
      return true;
    } else {
      console.log('❌ Failed to get error code:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error getting error code:', error.message);
    return false;
  }
}

async function testGetTroubleshootingProcedures() {
  console.log('\n🔧 Testing Get Troubleshooting Procedures...');
  
  try {
    const errorCode = 'CONV001';
    const { response, data } = await makeRequest(`/error-codes/code/${errorCode}/procedures`);
    
    if (response.ok) {
      console.log(`✅ Retrieved ${data.count} troubleshooting procedures for ${errorCode}:`);
      data.data.forEach(procedure => {
        console.log(`  Step ${procedure.stepNumber}: ${procedure.title}`);
        console.log(`    Time: ${procedure.estimatedTimeMinutes} min`);
        console.log(`    Tools: ${procedure.requiredTools.join(', ') || 'None'}`);
      });
      return true;
    } else {
      console.log('❌ Failed to get troubleshooting procedures:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error getting troubleshooting procedures:', error.message);
    return false;
  }
}

async function testGetFullErrorCodeDetails() {
  console.log('\n📖 Testing Get Full Error Code Details...');
  
  try {
    const errorCode = 'CONV001';
    const { response, data } = await makeRequest(`/error-codes/code/${errorCode}/full`);
    
    if (response.ok) {
      const details = data.data;
      console.log(`✅ Retrieved full details for ${errorCode}:`);
      console.log(`  Title: ${details.title}`);
      console.log(`  Total Steps: ${details.totalSteps}`);
      console.log(`  Estimated Total Time: ${details.estimatedTotalTime} minutes`);
      console.log(`  Recent Resolutions: ${details.recentResolutions.length}`);
      return true;
    } else {
      console.log('❌ Failed to get full error code details:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error getting full error code details:', error.message);
    return false;
  }
}

async function testQuickLookup() {
  console.log('\n⚡ Testing Quick Lookup...');
  
  try {
    const searchTerm = 'CONV001';
    const { response, data } = await makeRequest(`/error-codes/quick-lookup/${searchTerm}`);
    
    if (response.ok) {
      console.log(`✅ Quick lookup for "${searchTerm}" (${data.type}):`);
      if (data.type === 'exact') {
        console.log(`  Found exact match: ${data.result.title}`);
      } else {
        console.log(`  Found ${data.results.length} search results`);
      }
      return true;
    } else {
      console.log('❌ Failed quick lookup:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error in quick lookup:', error.message);
    return false;
  }
}

async function testGetStatistics() {
  console.log('\n📊 Testing Get Statistics...');
  
  try {
    const { response, data } = await makeRequest('/error-codes/statistics');
    
    if (response.ok) {
      const stats = data.data;
      console.log('✅ Retrieved error code statistics:');
      console.log(`  Total Error Codes: ${stats.totalErrorCodes}`);
      console.log(`  Critical Errors: ${stats.criticalErrors}`);
      console.log(`  High Priority: ${stats.highErrors}`);
      console.log(`  Medium Priority: ${stats.mediumErrors}`);
      console.log(`  Low Priority: ${stats.lowErrors}`);
      console.log(`  Average Frequency: ${stats.avgFrequency.toFixed(2)}`);
      console.log(`  Average Resolution Time: ${stats.avgResolutionTime.toFixed(2)} minutes`);
      return true;
    } else {
      console.log('❌ Failed to get statistics:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error getting statistics:', error.message);
    return false;
  }
}

async function testGetTopErrorCodes() {
  console.log('\n🔝 Testing Get Top Error Codes...');
  
  try {
    const { response, data } = await makeRequest('/error-codes/top?limit=5');
    
    if (response.ok) {
      console.log(`✅ Retrieved top ${data.count} error codes:`);
      data.data.forEach((code, index) => {
        console.log(`  ${index + 1}. ${code.code}: ${code.title} (${code.frequencyCount} occurrences)`);
      });
      return true;
    } else {
      console.log('❌ Failed to get top error codes:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error getting top error codes:', error.message);
    return false;
  }
}

async function testGetMetadata() {
  console.log('\n🏷️ Testing Get Metadata...');
  
  try {
    const { response, data } = await makeRequest('/error-codes/metadata');
    
    if (response.ok) {
      console.log('✅ Retrieved error code metadata:');
      console.log(`  Severity Levels: ${data.data.severityLevels.join(', ')}`);
      console.log(`  Categories: ${data.data.categories.slice(0, 5).join(', ')}...`);
      return true;
    } else {
      console.log('❌ Failed to get metadata:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error getting metadata:', error.message);
    return false;
  }
}

async function testCreateErrorResolution() {
  console.log('\n💾 Testing Create Error Resolution...');
  
  try {
    const errorCodeId = 1; // Assuming CONV001 has ID 1
    const resolutionData = {
      equipmentId: 1,
      resolutionTimeMinutes: 25,
      successful: true,
      procedureStepsFollowed: [1, 2, 3],
      notes: 'Belt alignment issue resolved by adjusting tracking bolts. No further issues observed.'
    };

    const { response, data } = await makeRequest(`/error-codes/${errorCodeId}/resolutions`, {
      method: 'POST',
      body: JSON.stringify(resolutionData)
    });
    
    if (response.ok) {
      console.log('✅ Created error resolution successfully:');
      console.log(`  Resolution ID: ${data.data.id}`);
      console.log(`  Resolution Time: ${data.data.resolutionTimeMinutes} minutes`);
      console.log(`  Successful: ${data.data.successful}`);
      return true;
    } else {
      console.log('❌ Failed to create error resolution:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error creating error resolution:', error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Error Code API Tests...');
  console.log('=====================================');

  const tests = [
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Get All Error Codes', fn: testGetAllErrorCodes },
    { name: 'Search Error Codes', fn: testSearchErrorCodes },
    { name: 'Get Error Code by Code', fn: testGetErrorCodeByCode },
    { name: 'Get Troubleshooting Procedures', fn: testGetTroubleshootingProcedures },
    { name: 'Get Full Error Code Details', fn: testGetFullErrorCodeDetails },
    { name: 'Quick Lookup', fn: testQuickLookup },
    { name: 'Get Statistics', fn: testGetStatistics },
    { name: 'Get Top Error Codes', fn: testGetTopErrorCodes },
    { name: 'Get Metadata', fn: testGetMetadata },
    { name: 'Create Error Resolution', fn: testCreateErrorResolution }
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
    console.log('🎉 All tests passed! Error Code system is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the error messages above.');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests };