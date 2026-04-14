import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sitesRouter from './routes/sites.js';

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());
app.use('/api/sites', sitesRouter);

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
