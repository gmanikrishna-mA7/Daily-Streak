import http from 'node:http';
import {
  getLocalStreak,
  saveLocalStreak,
  getGitHubConfig,
  fetchStreakFromGitHub,
  completeDayOnGitHub
} from './api/githubStreak.js';

const PORT = process.env.PORT || 3001;

const server = http.createServer(async (req, res) => {
  // Enable CORS for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  const sendJson = (statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  const readBody = () =>
    new Promise((resolve) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve({});
        }
      });
    });

  const config = getGitHubConfig();

  // GET /api/status
  if (req.method === 'GET' && url.pathname === '/api/status') {
    return sendJson(200, {
      configured: config.isConfigured,
      owner: config.owner || null,
      repo: config.repo || null,
      branch: config.branch || 'main'
    });
  }

  // GET /api/streak
  if (req.method === 'GET' && url.pathname === '/api/streak') {
    if (!config.isConfigured) {
      const localHistory = getLocalStreak();
      return sendJson(200, {
        success: true,
        connected: false,
        mode: 'local',
        history: localHistory,
        sha: 'local',
        notice: 'GitHub token not configured. Set GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO in .env'
      });
    }

    try {
      const ghData = await fetchStreakFromGitHub(config);
      return sendJson(200, {
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
      console.error('[Server API] GitHub fetch error:', err.message);
      const localHistory = getLocalStreak();
      return sendJson(200, {
        success: false,
        connected: false,
        mode: 'fallback',
        error: err.message,
        history: localHistory,
        sha: 'local'
      });
    }
  }

  // POST /api/streak/complete
  if (req.method === 'POST' && url.pathname === '/api/streak/complete') {
    const body = await readBody();
    const targetDate = body.date || new Date().toISOString().split('T')[0];

    if (!config.isConfigured) {
      const localData = getLocalStreak();
      if (localData[targetDate]?.completed) {
        return sendJson(200, {
          success: true,
          updated: false,
          alreadyCompleted: true,
          history: localData,
          sha: 'local',
          message: `${targetDate} is already completed in local streak.json`
        });
      }

      const updated = {
        ...localData,
        [targetDate]: { completed: true }
      };
      saveLocalStreak(updated);

      return sendJson(200, {
        success: true,
        updated: true,
        alreadyCompleted: false,
        mode: 'local',
        history: updated,
        sha: 'local',
        message: `Updated local streak.json for ${targetDate}`
      });
    }

    try {
      const result = await completeDayOnGitHub(config, targetDate);
      saveLocalStreak(result.history);
      return sendJson(200, {
        success: true,
        ...result
      });
    } catch (err) {
      console.error('[Server API] GitHub commit error:', err.message);
      return sendJson(500, {
        success: false,
        error: err.message
      });
    }
  }

  // Default 404
  sendJson(404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`[Streak API Server] Running on http://localhost:${PORT}`);
});
