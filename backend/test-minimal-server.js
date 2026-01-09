import express from 'express';

const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ message: 'Health OK' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Test OK' });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
});