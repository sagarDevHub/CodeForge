export const deploymentScore = (issues: string[]) => {
  let score = 100;
  score -= issues.length * 10;
  return Math.max(score, 0);
};
