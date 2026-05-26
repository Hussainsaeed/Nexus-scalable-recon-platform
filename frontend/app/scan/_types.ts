export type Vulnerability = {
  id: string;
  type: 'SQLi' | 'XSS' | 'CSRF' | 'SSRF' | 'RCE' | 'InfoLeak';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  evidence: string;
  confidence: number; // 0..100
};

export type ApiResponse = {
  target: string;
  scanTime: string;
  riskScore: number;
  summary?: {
    totalFindings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  vulnerabilities: Vulnerability[];
};

export type ScanSummary = {
  totalFindings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
};

