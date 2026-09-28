import fs from 'node:fs';
import path from 'node:path';

const LOCAL_STREAK_PATH = path.resolve(process.cwd(), 'streak.json');

/**
 * Read local fallback streak.json
 */
export function getLocalStreak() {
  try {
    if (fs.existsSync(LOCAL_STREAK_PATH)) {
      const content = fs.readFileSync(LOCAL_STREAK_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('[Streak] Error reading local streak.json:', err);
  }
  return {};
}

/**
 * Save to local streak.json fallback
 */
export function saveLocalStreak(data) {
  try {
    fs.writeFileSync(LOCAL_STREAK_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[Streak] Error writing local streak.json:', err);
    return false;
  }
}

/**
 * Decode Base64 string safely (handling UTF-8)
 */
function decodeBase64(base64Str) {
  const clean = base64Str.replace(/[\r\n\s]/g, '');
  return Buffer.from(clean, 'base64').toString('utf-8');
}

/**
 * Encode string to Base64 safely
 */
function encodeBase64(str) {
  return Buffer.from(str, 'utf-8').toString('base64');
}

/**
 * Get config from environment variables
 */
export function getGitHubConfig(envOverride = {}) {
  const token = envOverride.GITHUB_TOKEN || process.env.GITHUB_TOKEN || '';
  const owner = envOverride.GITHUB_OWNER || process.env.GITHUB_OWNER || '';
  const repo = envOverride.GITHUB_REPO || process.env.GITHUB_REPO || '';
  const branch = envOverride.GITHUB_BRANCH || process.env.GITHUB_BRANCH || 'main';

  const isConfigured = Boolean(token && owner && repo);
  return { token, owner, repo, branch, isConfigured };
}

/**
 * Fetch streak.json directly from GitHub Contents API
 */
export async function fetchStreakFromGitHub(config) {
  const { token, owner, repo, branch } = config;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/streak.json?ref=${encodeURIComponent(branch)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'DailyStreak-AutomatedSync/1.0'
    }
  });

  if (response.status === 404) {
    // streak.json does not exist in repo yet
    return {
      history: {},
      sha: null,
      exists: false
    };
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawJson = decodeBase64(data.content || '');
  let history = {};
  try {
    history = JSON.parse(rawJson);
  } catch (err) {
    console.error('[Streak] Failed to parse JSON from GitHub contents:', err);
    history = {};
  }

  return {
    history,
    sha: data.sha,
    exists: true,
    htmlUrl: data.html_url
  };
}

/**
 * Complete day and update streak.json on GitHub Contents API
 */
export async function completeDayOnGitHub(config, dateString, retryOnConflict = true) {
  const { token, owner, repo, branch } = config;

  // 1. Fetch current file and SHA
  const current = await fetchStreakFromGitHub(config);

  // 2. Check if today's date already exists as completed
  if (current.history[dateString]?.completed === true) {
    return {
      success: true,
      updated: false,
      alreadyCompleted: true,
      history: current.history,
      sha: current.sha,
      message: `Date ${dateString} is already recorded as completed. No duplicate commit was created.`
    };
  }

  // 3. Prepare updated history
  const updatedHistory = {
    ...current.history,
    [dateString]: {
      completed: true
    }
  };

  const newContentJson = JSON.stringify(updatedHistory, null, 2);
  const base64Content = encodeBase64(newContentJson);
  const commitMessage = `Daily Streak - ${dateString}`;

  const payload = {
    message: commitMessage,
    content: base64Content,
    branch
  };

  // If file already exists, sha is REQUIRED for GitHub Contents API
  if (current.sha) {
    payload.sha = current.sha;
  }

  const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/streak.json`;

  const putResponse = await fetch(putUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'DailyStreak-AutomatedSync/1.0'
    },
    body: JSON.stringify(payload)
  });

  // Handle 409 Conflict (e.g. SHA mismatch if another commit just occurred)
  if (putResponse.status === 409 && retryOnConflict) {
    console.warn('[Streak] 409 Conflict encountered. Refetching latest SHA and retrying once...');
    return await completeDayOnGitHub(config, dateString, false);
  }

  if (!putResponse.ok) {
    const errorBody = await putResponse.text();
    throw new Error(`Failed to commit streak.json to GitHub (${putResponse.status}): ${errorBody}`);
  }

  const putResult = await putResponse.json();

  return {
    success: true,
    updated: true,
    alreadyCompleted: false,
    history: updatedHistory,
    sha: putResult.content?.sha || null,
    commit: {
      sha: putResult.commit?.sha,
      htmlUrl: putResult.commit?.html_url,
      message: commitMessage
    },
    message: `Commit created: ${commitMessage}`
  };
}
