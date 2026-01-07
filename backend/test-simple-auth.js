// Simple Authentication Test
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const API_BASE = 'http://localhost:3001/api';

async function testAuth() {
  try {
    console.log("🔐 Testing Authentication...\n");
    
    const users = [
      { username: 'admin', password: 'admin123' },
      { username: 'plant.manager', password: 'manager123' },
      { username: 'tech.senior', password: 'tech123' },
      { username: 'operator.line1', password: 'operator123' }
    ];
    
    for (const user of users) {
      console.log(`Testing ${user.username}...`);
      
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      
      const data = await response.json();
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, data);
      console.log("");
    }
    
  } catch (error) {
    console.error("Auth test error:", error.message);
  }
}

testAuth();