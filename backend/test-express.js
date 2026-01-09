import express from 'express';

const app = express();

app.get('/test', (req, res) => {
  res.json({ message: 'Express is working' });
});

app.listen(3002, () => {
  console.log('Test server running on port 3002');
});

// Test the route
setTimeout(async () => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:3002/test');
    const data = await response.json();
    console.log('Test result:', data);
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}, 1000);