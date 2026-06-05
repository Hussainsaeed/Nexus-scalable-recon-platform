import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';

import './workers/scan.worker';

import authRoutes from './auth/auth.routes';
import path from 'path';

console.log('MONGO_URI EXISTS:', !!process.env.MONGO_URI);

const app = express();

/* MIDDLEWARES */

app.use(cors());

app.use(express.json());

app.use(
  '/uploads',
  express.static(
    path.join(
      __dirname,
      '../uploads'
    )
  )
);

/* DATABASE CONNECTION */

(async () => {
  try {

    await mongoose.connect(
      process.env.MONGO_URI as string
    );
  console.log(`
====================================
✅ MongoDB Connected: ${mongoose.connection.host}
====================================
`);

  } catch (err) {

    console.error(
      '❌ MongoDB Connection Error:',
      err
    );

  }
})();

/* ROUTES */

import scanRoutes from './routes/scanRoutes';

app.use('/api/scan', scanRoutes);

app.use('/api/auth', authRoutes);

/* HEALTH ROUTE */

app.get('/', (_, res) => {

  res.json({

    success: true,

    message:
      'Nexus Recon Backend Online',

    realtime: true,
  });

});

/* HTTP SERVER */

const server = http.createServer(app);

/* SOCKET SERVER */

export const io = new Server(server, {

  cors: {

    origin: '*',

  },

});

/* SOCKET CONNECTION */

io.on('connection', (socket) => {

  console.log(
    '⚡ Client connected:',
    socket.id
  );

  socket.emit(
    'scan-log',
    {
      message:
        '[SYSTEM] Connected to Nexus realtime engine',
    }
  );

  socket.on(
    'join-scan',
    (jobId: string) => {

      socket.join(jobId);

      console.log(
        `📡 ${socket.id} joined ${jobId}`
      );

    }
  );

  socket.on('disconnect', () => {

    console.log(
      '❌ Client disconnected:',
      socket.id
    );
  });
});

/* START SERVER */

const PORT =
  process.env.PORT || 5000;

server.listen(PORT, () => {

  console.log(`
====================================
🚀 Server running on port ${PORT}
====================================
  `);

});