import { NextResponse } from 'next/server';

export type ServerStatus = 'online' | 'offline';

export type ServerType =
  | 'Ubuntu 22.04'
  | 'Ubuntu 24.04'
  | 'Debian 12'
  | 'AlmaLinux 9'
  | 'Rocky Linux 9';

export type Region = 'us-east' | 'us-west' | 'eu-central' | 'ap-south' | 'sa-east';

export type PlanSize = 'starter' | 'pro' | 'enterprise';

export interface Server {
  id: string;
  name: string;
  status: ServerStatus;
  cpu: number; // percent 0..100
  ram: number; // percent 0..100
  ip: string;
  region: Region;
  type: ServerType;
}

export interface CreateInstanceBody {
  name: string;
  region: Region;
  type: ServerType;
  plan: PlanSize;
}

function clampPercent(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function buildMockServers(): Server[] {
  const servers: Server[] = [
    {
      id: 'srv-0x7a31',
      name: 'gateway-prod-01',
      status: 'online' as ServerStatus,
      cpu: 23,
      ram: 41,
      ip: '185.44.102.12',
      region: 'us-east',
      type: 'Ubuntu 22.04'
    },
    {
      id: 'srv-0x7a32',
      name: 'edge-auth-02',
      status: 'online' as ServerStatus,
      cpu: 57,
      ram: 68,
      ip: '64.21.98.77',
      region: 'us-west',
      type: 'Ubuntu 24.04'
    },
    {
      id: 'srv-0x7a33',
      name: 'worker-queue-03',
      status: 'offline' as ServerStatus,
      cpu: 0,
      ram: 0,
      ip: '172.16.9.44',
      region: 'eu-central',
      type: 'Debian 12'
    },
    {
      id: 'srv-0x7a34',
      name: 'db-replica-04',
      status: 'online' as ServerStatus,
      cpu: 31,
      ram: 52,
      ip: '34.98.12.201',
      region: 'ap-south',
      type: 'AlmaLinux 9'
    },
    {
      id: 'srv-0x7a35',
      name: 'monitoring-05',
      status: 'offline' as ServerStatus,
      cpu: 0,
      ram: 0,
      ip: '10.10.3.88',
      region: 'sa-east',
      type: 'Rocky Linux 9'
    }
  ];
  return servers.map((s) => ({ ...s, cpu: clampPercent(s.cpu), ram: clampPercent(s.ram) }));
}

export async function GET() {
  const servers = buildMockServers();
  return NextResponse.json({ servers });
}

export async function POST(req: Request) {
  // Enterprise-grade mock: validate shape and return created object.
  const body = (await req.json().catch(() => null)) as Partial<CreateInstanceBody> | null;

  if (!body?.name || typeof body.name !== 'string') {
    return NextResponse.json({ error: { message: 'name is required' } }, { status: 400 });
  }
  if (!body.region || typeof body.region !== 'string') {
    return NextResponse.json({ error: { message: 'region is required' } }, { status: 400 });
  }
  if (!body.type || typeof body.type !== 'string') {
    return NextResponse.json({ error: { message: 'type is required' } }, { status: 400 });
  }
  if (!body.plan || typeof body.plan !== 'string') {
    return NextResponse.json({ error: { message: 'plan is required' } }, { status: 400 });
  }

  const region = body.region as Region;
  const type = body.type as ServerType;
  const plan = body.plan as PlanSize;

  const newServer: Server = {
    id: `srv-${Math.random().toString(16).slice(2, 8)}`,
    name: body.name.trim(),
    status: 'online' as ServerStatus,
    cpu: clampPercent(plan === 'starter' ? 12 : plan === 'pro' ? 26 : 34),
    ram: clampPercent(plan === 'starter' ? 28 : plan === 'pro' ? 46 : 58),
    ip: '203.0.113.42',
    region,
    type
  };

  return NextResponse.json({ server: newServer, ok: true });
}

