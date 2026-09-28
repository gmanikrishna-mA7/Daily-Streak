import { getGitHubConfig } from './githubStreak.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const config = getGitHubConfig();
  return res.status(200).json({
    configured: config.isConfigured,
    owner: config.owner || null,
    repo: config.repo || null,
    branch: config.branch || 'main'
  });
}
