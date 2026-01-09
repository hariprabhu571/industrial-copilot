import fetch from 'node-fetch';

async function testHealth() {
  try {
    const response = await fetch('http://localhost:3001/api/health');
    const data = await response.json();
    console.log('Health check:', data);
  } catch (error) {
    console.error('Health check failed:', error.message);
  }
}

testHealth();