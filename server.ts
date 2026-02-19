import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('E-Commerce API by King Dean');
});

app.listen(PORT, () => {
  console.log(`E-Commerce API is running on port ${PORT}`);
});