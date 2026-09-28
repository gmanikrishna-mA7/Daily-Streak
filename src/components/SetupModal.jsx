import React from 'react';

export default function SetupModal({ isOpen, onClose, status }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="modal-icon">🔐</span>
            <div>
              <h2 className="modal-title">GitHub Integration & Setup Guide</h2>
              <span className="modal-subtitle">
                Automated commit engine via GitHub Contents REST API
              </span>
            </div>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="setup-status-card">
            <div className="status-indicator-row">
              <span
                className={`pulse-dot ${status?.connected ? 'green' : 'amber'}`}
              />
              <span className="status-text">
                Current Status:{' '}
                <strong>
                  {status?.connected
                    ? `Connected to ${status.owner}/${status.repo}`
                    : 'Local Mode (streak.json)'}
                </strong>
              </span>
            </div>
            {status?.connected && (
              <p className="status-sub">
                Target Branch: <code>{status.branch || 'main'}</code> · File:{' '}
                <code>streak.json</code>
              </p>
            )}
          </div>

          <div className="setup-step">
            <div className="step-badge">Step 1</div>
            <div className="step-content">
              <h4>Generate a Fine-Grained GitHub Personal Access Token</h4>
              <p>
                In your GitHub account, go to{' '}
                <strong>Settings → Developer settings → Personal access tokens → Fine-grained tokens</strong>:
              </p>
              <ul className="step-list">
                <li>
                  <strong>Token Name:</strong> <code>Daily-Streak-Automator</code>
                </li>
                <li>
                  <strong>Repository access:</strong> Only select your{' '}
                  <code>daily-streak</code> repository.
                </li>
                <li>
                  <strong>Repository permissions:</strong> Set{' '}
                  <code>Contents</code> to <strong>Read and write</strong>.
                </li>
              </ul>
            </div>
          </div>

          <div className="setup-step">
            <div className="step-badge">Step 2</div>
            <div className="step-content">
              <h4>Configure Environment Variables (.env)</h4>
              <p>
                Create a <code>.env</code> file in your project root (it is already in <code>.gitignore</code> to protect your secret):
              </p>
              <pre className="code-block">
                <code>{`GITHUB_TOKEN=github_pat_11A...YOUR_TOKEN...
GITHUB_OWNER=your_github_username
GITHUB_REPO=daily-streak
GITHUB_BRANCH=main`}</code>
              </pre>
            </div>
          </div>

          <div className="setup-step">
            <div className="step-badge">Step 3</div>
            <div className="step-content">
              <h4>Restart the Dev Server</h4>
              <p>Run the development command in your terminal:</p>
              <pre className="code-block">
                <code>npm run dev</code>
              </pre>
              <p>
                Vite will automatically load your variables into the secure server
                proxy without exposing the token to the browser!
              </p>
            </div>
          </div>

          <div className="security-notice">
            <span className="notice-icon">🛡️</span>
            <div>
              <strong>Security Guarantee:</strong>
              <p>
                Your GitHub PAT is never bundled into React client code. All API
                requests are routed through the backend proxy middleware, ensuring
                zero token leakage.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="primary-modal-btn" onClick={onClose}>
            Got it, Let&apos;s Build Consistency
          </button>
        </div>
      </div>
    </div>
  );
}
