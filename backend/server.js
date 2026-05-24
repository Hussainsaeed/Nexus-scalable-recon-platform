require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');

const app = express();

const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'nexus-os-backend' });
});

app.use('/api/auth', authRoutes);

// Centralized error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error'
    }
  });
});

async function start() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('Missing required env var: MONGODB_URI');
  }

  await mongoose.connect(MONGODB_URI);

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`NEXUS OS backend listening on port ${PORT}`);
  });
}

start().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', e);
  process.exit(1);
});

