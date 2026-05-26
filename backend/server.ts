import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

let dynamicServers = [
  {
    id: '1',
    name: 'Local Host Node',
    status: 'online' as const,
    ip: '127.0.0.1',
    cpu: '20%',
    ram: '81%',
  }
];

function getRandomUsage(min: number, max: number): string {
  const value = Math.floor(Math.random() * (max - min + 1)) + min;
  return `${value}%`;
}

setInterval(() => {
  dynamicServers = dynamicServers.map(server => {
    if (server.status === 'online') {
      return {
        ...server,
        cpu: getRandomUsage(10, 45),
        ram: getRandomUsage(75, 90),
      };
    }
    return server;
  });
}, 4000);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/scan', (req: Request, res: Response) => {
  const { target, intensity } = req.body;
  
  if (!target) {
    return res.status(400).json({ error: 'Target URL is required' });
  }

  console.log(`[SCAN TRIGGERED] Target: ${target} | Intensity: ${intensity || 'default'}`);

  return res.status(200).json({
    message: 'Scan completed successfully',
    target,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/servers', (req: Request, res: Response) => {
  res.status(200).json(dynamicServers);
});

app.post('/api/servers', (req: Request, res: Response) => {
  const { name, ip } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Server name is required' });
  }

  const newServer = {
    id: String(dynamicServers.length + 1),
    name,
    status: 'online' as const,
    ip: ip || '127.0.0.1',
    cpu: '15%',
    ram: '40%',
  };

  dynamicServers.push(newServer);
  console.log(`[PROVISIONED] New Server Node Created: ${name}`);
  
  return res.status(201).json(newServer);
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 NEXUS CLUSTER BACKEND ACTIVE ON PORT: ${PORT}`);
  console.log(`=========================================`);
});