import { getGitHubConfig, fetchStreakFromGitHub, getLocalStreak } from '../githubStreak.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const config = getGitHubConfig();

  if (!config.isConfigured) {
    return res.status(200).json({
      success: true,
      connected: false,
      mode: 'local',
      history: getLocalStreak(),
      sha: 'local',
      notice: 'GitHub token not configured in Vercel environment variables.'
    });
  }

  try {
    const ghData = await fetchStreakFromGitHub(config);
    return res.status(200).json({
      success: true,
      connected: true,
      mode: 'github',
      owner: config.owner,
      repo: config.repo,
      branch: config.branch,
      history: ghData.history,
      sha: ghData.sha,
      exists: ghData.exists,
      htmlUrl: ghData.htmlUrl
    });
  } catch (err) {
    console.error('[Vercel API] GitHub fetch error:', err.message);
    return res.status(200).json({
      success: false,
      connected: false,
      mode: 'fallback',
      error: err.message,
      history: getLocalStreak(),
      sha: 'local'
    });
  }
}
