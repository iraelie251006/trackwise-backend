// src/index.ts
import express from 'express';
import { PORT } from './config/env';


const app = express();

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to TrackWise API' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
