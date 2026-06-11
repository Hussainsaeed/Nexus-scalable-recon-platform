export const analyzeSecurityHeaders = (
  headers: Record<string, any>
) => {

  const findings = [];

  if (
    !headers["content-security-policy"]
  ) {
    findings.push({
      title:
        "Missing Content Security Policy",
      severity: "medium",
    });
  }

  if (
    !headers["strict-transport-security"]
  ) {
    findings.push({
      title:
        "Missing HSTS Header",
      severity: "low",
    });
  }

  if (
    !headers["x-frame-options"]
  ) {
    findings.push({
      title:
        "Missing X-Frame-Options",
      severity: "medium",
    });
  }

  if (
  !headers["x-content-type-options"]
) {
  findings.push({
    title:
      "Missing X-Content-Type-Options",
    severity: "low",
  });
}

if (
  !headers["referrer-policy"]
) {
  findings.push({
    title:
      "Missing Referrer-Policy",
    severity: "low",
  });
}

if (
  !headers["permissions-policy"]
) {
  findings.push({
    title:
      "Missing Permissions-Policy",
    severity: "low",
  });
}

if (
  !headers["cross-origin-opener-policy"]
) {
  findings.push({
    title:
      "Missing Cross-Origin-Opener-Policy",
    severity: "low",
  });
}

if (
  !headers["cross-origin-resource-policy"]
) {
  findings.push({
    title:
      "Missing Cross-Origin-Resource-Policy",
    severity: "low",
  });
}

if (
  !headers["cross-origin-embedder-policy"]
) {
  findings.push({
    title:
      "Missing Cross-Origin-Embedder-Policy",
    severity: "low",
  });
}

  return findings;
};