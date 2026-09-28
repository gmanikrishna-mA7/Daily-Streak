import React from 'react';

export default function Header({
  status,
  onOpenSetup,
  onOpenInspector,
  onRefresh,
  isLoading
}) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand-section">
          <div className="brand-logo">
            <span className="commit-box" />
            <span className="logo-text">GitDailyStreak</span>
          </div>
          <span className="brand-subtitle">
            Automated GitHub Streak Engine & Daily Protocol
          </span>
        </div>

        <div className="header-actions">
          {/* Connection status badge */}
          <div
            className={`status-badge ${status?.connected ? 'connected' : 'local'}`}
            title={
              status?.connected
                ? `Syncing with GitHub repository: ${status.owner}/${status.repo}`
                : 'Running in local fallback mode. Configure .env to commit directly to GitHub.'
            }
          >
            <span className="status-dot" />
            <span className="status-label">
              {status?.connected
                ? `${status.owner}/${status.repo} (${status.branch})`
                : 'Local Mode (streak.json)'}
            </span>
          </div>

          <button
            type="button"
            className="action-btn"
            onClick={onOpenSetup}
            title="GitHub Setup & Integration Guide"
          >
            <span>⚙️</span>
            <span>GitHub Sync</span>
          </button>

          <button
            type="button"
            className="action-btn"
            onClick={onOpenInspector}
            title="Inspect streak.json and GitHub SHA"
          >
            <span>📄</span>
            <span>streak.json</span>
          </button>

          <button
            type="button"
            className="action-btn refresh-btn"
            onClick={onRefresh}
            disabled={isLoading}
            title="Sync latest data"
          >
            <span className={isLoading ? 'spinning' : ''}>🔄</span>
            <span>{isLoading ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
