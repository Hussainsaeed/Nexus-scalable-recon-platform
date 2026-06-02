export const calculateRiskScore = (
    vulnerabilities: any[]
  ): number => {
  
    let score = 0;
  
    vulnerabilities.forEach((vuln) => {
  
      const severity =
        vuln?.severity?.toLowerCase();
  
      switch (severity) {
  
        case "critical":
          score += 10;
          break;
  
        case "high":
          score += 7;
          break;
  
        case "medium":
          score += 4;
          break;
  
        case "low":
          score += 1;
          break;
  
        default:
          score += 0;
          break;
      }
  
    });
  
    return score;
  };