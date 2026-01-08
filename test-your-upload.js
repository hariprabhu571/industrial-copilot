// Quick test script for your upload issue
// Run this from the backend folder: node ../test-your-upload.js

import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

const API_BASE = 'http://localhost:3001/api';

async function testYourUpload() {
  console.log("🧪 Testing Your Upload Issue\n");

  try {
    // Authenticate as admin
    const authResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });

    if (!authResponse.ok) {
      console.log("❌ Admin authentication failed");
      console.log("🔍 Make sure you're using username: 'admin', password: 'admin123'");
      return;
    }

    const authData = await authResponse.json();
    console.log("✅ Admin authenticated successfully");
    console.log("👤 User:", authData.data.user.username, "- Role:", authData.data.user.role);

    // Test upload with your PDF file (adjust path as needed)
    const pdfPath = './ciranta.pdf'; // Adjust this path to your PDF file
    
    if (!fs.existsSync(pdfPath)) {
      console.log("❌ PDF file not found at:", pdfPath);
      console.log("🔍 Please adjust the pdfPath variable to point to your PDF file");
      return;
    }

    console.log("📄 Found PDF file, attempting upload...");

    const form = new FormData();
    form.append('file', fs.createReadStream(pdfPath), {
      filename: 'ciranta.pdf',
      contentType: 'application/pdf'
    });
    form.append('department', 'Quality');
    form.append('doc_type', 'Report');

    const uploadResponse = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.data.token}`,
        ...form.getHeaders()
      },
      body: form
    });

    console.log("📊 Upload status:", uploadResponse.status);

    if (uploadResponse.ok) {
      const result = await uploadResponse.json();
      console.log("✅ Upload successful!");
      console.log("📄 Result:", JSON.stringify(result, null, 2));
    } else {
      const errorText = await uploadResponse.text();
      console.log("❌ Upload failed!");
      console.log("📄 Error:", errorText);
    }

  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

testYourUpload().catch(console.error);