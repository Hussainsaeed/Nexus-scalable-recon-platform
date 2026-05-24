const express = require('express');

const router = express.Router();

function createHttpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function isLikelyUrl(s) {
  if (!s || typeof s !== 'string') return false;
  try {
    // Accept URLs with http/https
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function buildDummyVulnerabilities() {
  // Deterministic-ish dummy set
  const vulnerabilities = [
    {
      id: 'VULN-001',
      type: 'SQLi',
      severity: 'high',
      title: 'Potential SQL Injection in login parameter',
      evidence: "' OR '1'='1' -- (simulated)",
      confidence: 82
    },
    {
      id: 'VULN-002',
      type: 'XSS',
      severity: 'medium',
      title: 'Reflected XSS via search parameter',
      evidence: '<script>alert(1)</script> (simulated)',
      confidence: 71
    },
    {
      id: 'VULN-003',
      type: 'CSRF',
      severity: 'low',
      title: 'Missing CSRF protection on state-changing request',
      evidence: 'No anti-CSRF token observed (simulated)',
      confidence: 59
    }
  ];

  return vulnerabilities;
}

router.post('/scan', (req, res, next) => {
  try {
    const { url } = req.body || {};

    if (!url) return next(createHttpError(400, 'url is required'));
    if (!isLikelyUrl(url)) return next(createHttpError(400, 'url must be a valid http(s) URL'));

    const vulnerabilities = buildDummyVulnerabilities();

    const summary = vulnerabilities.reduce(
      (acc, v) => {
        acc.totalFindings += 1;
        if (v.severity === 'critical') acc.critical += 1;
        if (v.severity === 'high') acc.high += 1;
        if (v.severity === 'medium') acc.medium += 1;
        if (v.severity === 'low') acc.low += 1;
        return acc;
      },
      { totalFindings: 0, critical: 0, high: 0, medium: 0, low: 0 }
    );

    const nowIso = new Date().toISOString();

    return res.json({
      target: url,
      scanId: `NX-${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
      startedAt: nowIso,
      finishedAt: nowIso,
      summary,
      vulnerabilities
    });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;

