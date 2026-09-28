import { getGitHubConfig, completeDayOnGitHub, saveLocalStreak, getLocalStreak } from '../githubStreak.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const targetDate = body.date || new Date().toISOString().split('T')[0];
  const config = getGitHubConfig();

  if (!config.isConfigured) {
    const localData = getLocalStreak();
    if (localData[targetDate]?.completed) {
      return res.status(200).json({
        success: true,
        updated: false,
        alreadyCompleted: true,
        history: localData,
        sha: 'local',
        message: `${targetDate} is already marked completed in local streak.json`
      });
    }

    const updated = {
      ...localData,
      [targetDate]: { completed: true }
    };
    saveLocalStreak(updated);

    return res.status(200).json({
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
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('[Vercel API] GitHub commit error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
