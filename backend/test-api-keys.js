// Test API keys individually
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

dotenv.config();

async function testApiKeys() {
  console.log('🔑 Testing API Keys...\n');
  
  // Test Gemini API
  console.log('1️⃣ Testing Gemini API:');
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent("Hello, this is a test.");
    console.log('   ✅ Gemini API working');
    console.log('   Response:', result.response.text().substring(0, 50) + '...');
  } catch (error) {
    console.log('   ❌ Gemini API failed:', error.message);
    console.log('   Check your GEMINI_API_KEY in .env file');
  }
  
  // Test Groq API
  console.log('\n2️⃣ Testing Groq API:');
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
    
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Hello, this is a test." }],
      model: "llama-3.1-8b-instant",
      max_tokens: 50,
    });
    
    console.log('   ✅ Groq API working');
    console.log('   Response:', completion.choices[0].message.content);
  } catch (error) {
    console.log('   ❌ Groq API failed:', error.message);
    console.log('   Check your GROQ_API_KEY in .env file');
  }
  
  // Test Gemini Embeddings specifically
  console.log('\n3️⃣ Testing Gemini Embeddings:');
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    
    const result = await model.embedContent("test text");
    console.log('   ✅ Gemini Embeddings working');
    console.log('   Embedding size:', result.embedding.values.length);
  } catch (error) {
    console.log('   ❌ Gemini Embeddings failed:', error.message);
  }
  
  console.log('\n📋 API Key Status Summary:');
  console.log('   - If APIs are working: You can proceed to start the backend');
  console.log('   - If APIs are failing: Check your API keys and quotas');
  console.log('   - Gemini API: https://makersuite.google.com/app/apikey');
  console.log('   - Groq API: https://console.groq.com/keys');
  
  process.exit(0);
}

testApiKeys();