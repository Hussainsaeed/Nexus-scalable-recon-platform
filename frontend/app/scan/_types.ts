export type Vulnerability = {

  id?: string;

  name: string;

  severity:
    | 'info'
    | 'low'
    | 'medium'
    | 'high'
    | 'critical';

  description?: string;

  matched?: string;

  template?: string;

  cve?: string[];
};

export type ApiResponse = {

  target: string;

  scanTime?: string;

  riskScore?: number;

  summary?: {

    totalFindings: number;

    critical: number;

    high: number;

    medium: number;

    low: number;
  };

  vulnerabilities: Vulnerability[];

  technologies?: string[];

  openPorts?: number[];

  headers?: Record<string, any>;

  ssl?: any;
};

export type ScanSummary = {

  totalFindings: number;

  critical: number;

  high: number;

  medium: number;

  low: number;
};