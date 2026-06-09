export const calculateRiskScore = (
  openPorts: number[],
  technologies: string[],
  sslData: any,
  vulnerabilities: any[] = []
): number => {

  let score = 0;

  // =====================
  // PORTS
  // =====================

  const highRiskPorts = [
    21,     // FTP
    23,     // Telnet
    3306,   // MySQL
    5432,   // PostgreSQL
    6379,   // Redis
    27017,  // MongoDB
  ];

  const mediumRiskPorts = [
    22,     // SSH
    3389,   // RDP
  ];

  score +=
    openPorts.filter(
      port => highRiskPorts.includes(port)
    ).length * 10;

  score +=
    openPorts.filter(
      port => mediumRiskPorts.includes(port)
    ).length * 5;

  // =====================
  // TECHNOLOGIES
  // =====================

  const riskyTech = [
    "wordpress",
    "php",
    "jquery",
    "apache"
  ];

  technologies.forEach((tech) => {

    const value =
      tech.toLowerCase();

    if (
      riskyTech.some(
        t => value.includes(t)
      )
    ) {
      score += 5;
    }

  });

  // =====================
  // SSL
  // =====================

  if (!sslData?.valid_to) {

    score += 15;

  } else {

    const expiry =
      new Date(
        sslData.valid_to
      ).getTime();

    const daysLeft =
      (
        expiry - Date.now()
      ) /
      (
        1000 * 60 * 60 * 24
      );

    if (daysLeft < 30) {
      score += 10;
    }

  }

  // =====================
  // VULNERABILITIES
  // =====================

  vulnerabilities.forEach((vuln) => {

    switch (
      vuln?.severity?.toLowerCase()
    ) {

      case "critical":
        score += 25;
        break;

      case "high":
        score += 15;
        break;

      case "medium":
        score += 8;
        break;

      case "low":
        score += 3;
        break;
    }

  });

  // =====================
  // NORMALIZE
  // =====================

  return Math.min(
    Math.round(score),
    100
  );
};