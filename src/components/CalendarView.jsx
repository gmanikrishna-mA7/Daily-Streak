import React, { useState } from 'react';
import { getDaysInMonth, getLocalDateKey, parseDateKey } from '../utils/dateUtils';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarView({
  history,
  todayKey,
  selectedDate,
  onSelectDate
}) {
  const [viewMode, setViewMode] = useState('month'); // 'month' | '30days' | 'year'

  const today = parseDateKey(todayKey);
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());

  // Month days
  const monthDays = getDaysInMonth(calendarYear, calendarMonth);
  const firstDay = monthDays[0].getDay();
  // Monday as index 0: Sun(0)->6, Mon(1)->0, Tue(2)->1...
  const startPadding = firstDay === 0 ? 6 : firstDay - 1;
  const emptyDays = Array.from({ length: startPadding });

  // Navigation
  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setCalendarYear(today.getFullYear());
    setCalendarMonth(today.getMonth());
    onSelectDate(todayKey);
  };

  // Helper to determine day status strictly from history
  const getDayStatus = (dateKey) => {
    if (history[dateKey]?.completed === true) {
      return 'completed';
    }
    if (dateKey < todayKey) {
      return 'missed';
    }
    if (dateKey === todayKey) {
      return 'today-pending';
    }
    return 'future';
  };

  // Last 30 days
  const last30Days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    last30Days.push(d);
  }

  // Last 180 days (half year heatmap)
  const last180Days = [];
  for (let i = 179; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    last180Days.push(d);
  }

  return (
    <section className="calendar-panel">
      <div className="calendar-top-bar">
        <div className="view-mode-tabs">
          <button
            type="button"
            className={`tab-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            Month View
          </button>
          <button
            type="button"
            className={`tab-btn ${viewMode === '30days' ? 'active' : ''}`}
            onClick={() => setViewMode('30days')}
          >
            30 Days
          </button>
          <button
            type="button"
            className={`tab-btn ${viewMode === 'year' ? 'active' : ''}`}
            onClick={() => setViewMode('year')}
          >
            Contribution Graph
          </button>
        </div>

        <button type="button" className="today-btn" onClick={goToToday}>
          Jump to Today
        </button>
      </div>

      {viewMode === 'month' && (
        <div className="month-calendar-wrapper">
          <div className="month-nav-header">
            <button
              type="button"
              className="nav-arrow-btn"
              onClick={prevMonth}
              aria-label="Previous month"
            >
              ←
            </button>

            <div className="month-year-selects">
              <select
                value={calendarMonth}
                onChange={(e) => setCalendarMonth(Number(e.target.value))}
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={name} value={i}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={calendarYear}
                onChange={(e) => setCalendarYear(Number(e.target.value))}
              >
                {Array.from({ length: 9 }, (_, i) => today.getFullYear() - 4 + i).map(
                  (year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                )}
              </select>
            </div>

            <button
              type="button"
              className="nav-arrow-btn"
              onClick={nextMonth}
              aria-label="Next month"
            >
              →
            </button>
          </div>

          <div className="calendar-weekdays">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          <div className="calendar-grid">
            {emptyDays.map((_, idx) => (
              <div key={`empty-${idx}`} className="calendar-cell empty" />
            ))}

            {monthDays.map((dateObj) => {
              const dateKey = getLocalDateKey(dateObj);
              const status = getDayStatus(dateKey);
              const isSelected = dateKey === selectedDate;
              const isToday = dateKey === todayKey;

              return (
                <button
                  type="button"
                  key={dateKey}
                  className={`calendar-cell day-cell ${status} ${
                    isSelected ? 'selected' : ''
                  } ${isToday ? 'today' : ''}`}
                  onClick={() => onSelectDate(dateKey)}
                  title={`${dateKey} — ${status}`}
                >
                  <span className="day-number">{dateObj.getDate()}</span>
                  {status === 'completed' && <span className="cell-indicator">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === '30days' && (
        <div className="heatmap-container">
          <h3 className="subheading">Trailing 30-Day Activity</h3>
          <div className="thirty-days-grid">
            {last30Days.map((d) => {
              const k = getLocalDateKey(d);
              const st = getDayStatus(k);
              const isSelected = k === selectedDate;
              return (
                <button
                  type="button"
                  key={k}
                  className={`heatmap-box ${st} ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectDate(k)}
                  title={`${k}: ${st}`}
                >
                  <span className="box-date">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'year' && (
        <div className="contribution-graph-wrapper">
          <h3 className="subheading">GitHub Contribution Matrix (180 Days)</h3>
          <p className="subheading-desc">
            Historical commits synced with <code>streak.json</code>
          </p>
          <div className="contribution-matrix">
            {last180Days.map((d) => {
              const k = getLocalDateKey(d);
              const st = getDayStatus(k);
              const isSelected = k === selectedDate;
              return (
                <div
                  key={k}
                  className={`contrib-square ${st} ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectDate(k)}
                  title={`${k} (${st})`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-swatch completed" />
          <span>Committed in GitHub</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch today-pending" />
          <span>Today (In Progress)</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch missed" />
          <span>Missed</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch future" />
          <span>Upcoming</span>
        </div>
      </div>
    </section>
  );
}
