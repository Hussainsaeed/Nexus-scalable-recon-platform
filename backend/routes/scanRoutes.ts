import express from 'express';

const router = express.Router();

type Severity = 'low' | 'medium' | 'high' | 'critical';
type VulnerabilityType = 'SQLi' | 'XSS' | 'CSRF' | 'SSRF' | 'RCE' | 'InfoLeak';

type Vulnerability = {
  id: string;
  type: VulnerabilityType;
  severity: Severity;
  title: string;
  evidence: string;
  confidence: number; // 0..100
};

type ScanResponse = {
  target: string;
  scanTime: string;
  riskScore: number; // 0..100
  vulnerabilities: Vulnerability[];
};

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function parseUrl(input: string) {
  const s = (input || '').trim();
  if (!s) return null;
  try {
    const hasProto = /^https?:\/\//i.test(s);
    // NOTE: enforce explicit protocol to keep things deterministic.
    if (!hasProto) return null;
    const u = new URL(s);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.toString();
  } catch {
    return null;
  }
}

router.post('/scan', async (req, res) => {
  try {
    const { url } = (req.body || {}) as { url?: string };
    const normalized = typeof url === 'string' ? parseUrl(url) : null;

    if (!normalized) {
      return res.status(400).json({
        error: { message: 'url must be a valid http(s) URL'
        }
      });
    }

    const start = Date.now();

    // Simulate a 2-second scan.
    await sleep(2000);

    const scanTimeMs = Date.now() - start;

    const vulnerabilities: Vulnerability[] = [
      {
        id: 'VULN-TS-001',
        type: 'SQLi',
        severity: 'high',
        title: 'SQL Injection on /prod/id (simulated)',
        evidence: "GET /prod/id?id=1' OR '1'='1' --",
        confidence: 84
      },
      {
        id: 'VULN-TS-002',
        type: 'XSS',
        severity: 'medium',
        title: 'Reflected XSS on /search (simulated)',
        evidence: 'search=<img src=x onerror=alert(1)>',
        confidence: 71
      },
      {
        id: 'VULN-TS-003',
        type: 'InfoLeak',
        severity: 'low',
        title: 'Outdated OpenSSL version detected (simulated)',
        evidence: 'TLS handshake banner indicates legacy OpenSSL build',
        confidence: 59
      }
    ];

    const riskScore = Math.min(
      100,
      vulnerabilities.reduce((acc, v) => {
        const weight =
          v.severity === 'critical'
            ? 40
            : v.severity === 'high'
              ? 28
              : v.severity === 'medium'
                ? 18
                : 10;
        return acc + weight * (v.confidence / 100);
      }, 0)
    );

    const response: ScanResponse = {
      target: normalized,
      scanTime: `${scanTimeMs}ms`,
      riskScore: Math.round(riskScore),
      vulnerabilities
    };

    res.json(response);
  } catch (e: any) {
    res.status(500).json({ error: { message: e?.message || 'Internal Server Error' } });
  }
});

export default router;

