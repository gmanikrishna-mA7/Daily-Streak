import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import {
  getLocalStreak,
  saveLocalStreak,
  getGitHubConfig,
  fetchStreakFromGitHub,
  completeDayOnGitHub
} from './api/githubStreak.js';

function streakApiPlugin(env) {
  return {
    name: 'streak-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

        // Helper to parse JSON body
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

        const sendJson = (statusCode, data) => {
          res.statusCode = statusCode;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };

        const config = getGitHubConfig(env);

        // 1. GET /api/status
        if (req.method === 'GET' && url.pathname === '/api/status') {
          return sendJson(200, {
            configured: config.isConfigured,
            owner: config.owner || null,
            repo: config.repo || null,
            branch: config.branch || 'main'
          });
        }

        // 2. GET /api/streak
        if (req.method === 'GET' && url.pathname === '/api/streak') {
          if (!config.isConfigured) {
            const localHistory = getLocalStreak();
            return sendJson(200, {
              success: true,
              connected: false,
              mode: 'local',
              history: localHistory,
              sha: 'local',
              notice: 'GitHub token not configured in .env. Operating in local streak.json fallback mode.'
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
            console.error('[Vite API] GitHub fetch error:', err.message);
            // Fallback to local streak if GitHub request fails
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

        // 3. POST /api/streak/complete
        if (req.method === 'POST' && url.pathname === '/api/streak/complete') {
          const body = await readBody();
          const targetDate =
            body.date ||
            new Date().toISOString().split('T')[0];

          if (!config.isConfigured) {
            // Local fallback handling
            const localData = getLocalStreak();
            if (localData[targetDate]?.completed) {
              return sendJson(200, {
                success: true,
                updated: false,
                alreadyCompleted: true,
                history: localData,
                sha: 'local',
                message: `${targetDate} is already marked completed in local streak.json.`
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
              message: `Updated local streak.json for ${targetDate}. (Set GITHUB_TOKEN in .env to enable automatic GitHub commits!)`
            });
          }

          try {
            const result = await completeDayOnGitHub(config, targetDate);
            // Also keep local streak.json in sync
            saveLocalStreak(result.history);

            return sendJson(200, {
              success: true,
              ...result
            });
          } catch (err) {
            console.error('[Vite API] GitHub commit error:', err.message);
            return sendJson(500, {
              success: false,
              error: err.message
            });
          }
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), streakApiPlugin(env)]
  };
});
