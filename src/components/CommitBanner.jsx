import React from 'react';

export default function CommitBanner({
  isTodayCompleted,
  isCommitting,
  todayKey,
  lastCommit,
  error,
  onRetry,
  requiredCompletedCount,
  requiredTotalCount,
  status
}) {
  const isReadyToCommit = requiredCompletedCount === requiredTotalCount;

  return (
    <div className="commit-banner-container">
      {error && (
        <div className="banner error-banner">
          <div className="banner-icon">⚠️</div>
          <div className="banner-info">
            <span className="banner-title">GitHub Sync Error</span>
            <span className="banner-desc">{error}</span>
          </div>
          {onRetry && (
            <button type="button" className="retry-btn" onClick={onRetry}>
              Retry Sync
            </button>
          )}
        </div>
      )}

      {isCommitting && (
        <div className="banner committing-banner">
          <div className="banner-icon">
            <span className="spinner" />
          </div>
          <div className="banner-info">
            <span className="banner-title">Committing to GitHub...</span>
            <span className="banner-desc">
              Updating <code>streak.json</code> via GitHub Contents API: &quot;Daily Streak - {todayKey}&quot;
            </span>
          </div>
        </div>
      )}

      {!isCommitting && isTodayCompleted && (
        <div className="banner success-banner">
          <div className="banner-icon">🎉</div>
          <div className="banner-info">
            <div className="banner-title-row">
              <span className="banner-title">Daily Streak Committed!</span>
              <span className="commit-tag">
                Commit: Daily Streak - {todayKey}
              </span>
            </div>
            <div className="banner-meta">
              <span>Recorded in <code>streak.json</code></span>
              {lastCommit?.sha && (
                <span className="sha-pill" title="Git Commit SHA">
                  SHA: {lastCommit.sha.slice(0, 7)}
                </span>
              )}
              {status?.connected && status?.owner && status?.repo && (
                <a
                  href={`https://github.com/${status.owner}/${status.repo}`}
                  target="_blank"
                  rel="noreferrer"
                  className="repo-link"
                >
                  View on GitHub ↗
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {!isCommitting && !isTodayCompleted && (
        <div className="banner pending-banner">
          <div className="banner-icon">⏳</div>
          <div className="banner-info">
            <div className="banner-title-row">
              <span className="banner-title">
                {isReadyToCommit
                  ? 'All 5 Core Tasks Done — Syncing...'
                  : `${requiredCompletedCount} of ${requiredTotalCount} Required Tasks Completed`}
              </span>
            </div>
            <span className="banner-desc">
              Automatic GitHub commit triggers instantly once all 5 core tasks are ticked.
            </span>
          </div>
          <div className="progress-counter">
            <span className="num">{requiredCompletedCount}</span>
            <span className="divider">/</span>
            <span className="total">{requiredTotalCount}</span>
          </div>
        </div>
      )}
    </div>
  );
}
