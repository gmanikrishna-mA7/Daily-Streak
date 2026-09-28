import React, { useState } from 'react';

export default function StreakInspectorModal({
  isOpen,
  onClose,
  history,
  sha,
  status
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(history, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="modal-icon">📄</span>
            <div>
              <h2 className="modal-title">Live streak.json Inspector</h2>
              <span className="modal-subtitle">
                Persistent storage source of truth from GitHub
              </span>
            </div>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="inspector-meta-row">
            <div className="meta-item">
              <span className="meta-label">Storage Backend</span>
              <span className="meta-val">
                {status?.connected ? 'GitHub REST Contents API' : 'Local streak.json Fallback'}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Current SHA</span>
              <span className="meta-val code">
                {sha ? sha.slice(0, 10) : 'N/A'}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Recorded Days</span>
              <span className="meta-val">
                {Object.keys(history).length}
              </span>
            </div>
          </div>

          <div className="code-viewer-container">
            <div className="viewer-header">
              <span>streak.json</span>
              <button
                type="button"
                className="copy-btn"
                onClick={handleCopy}
              >
                {copied ? '✓ Copied!' : '📋 Copy JSON'}
              </button>
            </div>
            <pre className="raw-json-box">
              <code>{jsonString}</code>
            </pre>
          </div>

          <p className="inspector-tip">
            💡 When you complete all 5 core tasks today, the secure API updates this
            file directly via GitHub&apos;s Contents API and creates a commit
            automatically.
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" className="secondary-modal-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
