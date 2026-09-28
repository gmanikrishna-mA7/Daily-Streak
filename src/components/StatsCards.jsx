import React from 'react';

export default function StatsCards({ stats }) {
  const { currentStreak, longestStreak, totalCompleted, consistencyRate } = stats;

  return (
    <section className="stats-grid">
      <div className="stat-card streak-card">
        <div className="stat-icon-wrapper fire">
          <span>🔥</span>
        </div>
        <div className="stat-content">
          <div className="stat-header">
            <span className="stat-title">Current Streak</span>
            <span className="stat-badge live">Active</span>
          </div>
          <div className="stat-value">
            {currentStreak}
            <span className="stat-unit">{currentStreak === 1 ? 'Day' : 'Days'}</span>
          </div>
          <p className="stat-description">
            {currentStreak > 0
              ? 'GitHub streak maintained!'
              : 'Complete today’s protocol to ignite streak'}
          </p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper trophy">
          <span>🏆</span>
        </div>
        <div className="stat-content">
          <div className="stat-header">
            <span className="stat-title">Longest Streak</span>
            <span className="stat-badge record">Record</span>
          </div>
          <div className="stat-value">
            {longestStreak}
            <span className="stat-unit">{longestStreak === 1 ? 'Day' : 'Days'}</span>
          </div>
          <p className="stat-description">Personal best continuous days</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper checkmark">
          <span>🟩</span>
        </div>
        <div className="stat-content">
          <div className="stat-header">
            <span className="stat-title">Total Completed</span>
            <span className="stat-badge commits">History</span>
          </div>
          <div className="stat-value">
            {totalCompleted}
            <span className="stat-unit">{totalCompleted === 1 ? 'Day' : 'Days'}</span>
          </div>
          <p className="stat-description">Recorded days in streak.json</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper velocity">
          <span>⚡</span>
        </div>
        <div className="stat-content">
          <div className="stat-header">
            <span className="stat-title">30-Day Consistency</span>
            <span className="stat-badge rate">Trailing</span>
          </div>
          <div className="stat-value">
            {consistencyRate}
            <span className="stat-unit">%</span>
          </div>
          <p className="stat-description">Completion rate past month</p>
        </div>
      </div>
    </section>
  );
}
