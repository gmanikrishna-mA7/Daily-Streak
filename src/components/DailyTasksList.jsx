import React from 'react';
import { CONSTANT_TASKS, REQUIRED_TASK_COUNT } from '../constants/tasks';
import { formatFriendlyDate } from '../utils/dateUtils';

export default function DailyTasksList({
  selectedDate,
  isToday,
  isDateCompleted,
  checkedTasks,
  onToggleTask,
  isCommitting
}) {
  const coreTasks = CONSTANT_TASKS.filter((t) => t.required);
  const optionalTasks = CONSTANT_TASKS.filter((t) => !t.required);

  const coreCompletedCount = coreTasks.filter((t) => checkedTasks[t.id]).length;
  const optionalCompletedCount = optionalTasks.filter((t) => checkedTasks[t.id]).length;

  const coreProgressPercent = Math.round((coreCompletedCount / REQUIRED_TASK_COUNT) * 100);

  return (
    <section className="protocol-card">
      <div className="protocol-header">
        <div>
          <div className="date-badge-row">
            <span className="badge-calendar-icon">📅</span>
            <span className="date-badge">
              {formatFriendlyDate(selectedDate)}
            </span>
            {isToday ? (
              <span className="badge today-badge">Today</span>
            ) : (
              <span className="badge historical-badge">Historical Record</span>
            )}
            {isDateCompleted && (
              <span className="badge streak-saved-badge">
                🟩 Day Committed
              </span>
            )}
          </div>
          <h2 className="protocol-title">
            {isToday ? "Today's Daily Protocol" : `Log for ${selectedDate}`}
          </h2>
          <p className="protocol-subtitle">
            {isToday
              ? 'Complete the 5 core tasks to trigger an automated GitHub streak commit.'
              : isDateCompleted
              ? 'This date is verified and completed in streak.json.'
              : 'No completed record logged in streak.json for this date.'}
          </p>
        </div>

        <div className="progress-radial-box">
          <div className="progress-number">
            <span className="current">{coreCompletedCount}</span>
            <span className="slash">/</span>
            <span className="target">{REQUIRED_TASK_COUNT}</span>
          </div>
          <span className="progress-label">Core Tasks</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-tracker">
        <div className="progress-bar-bg">
          <div
            className={`progress-bar-fill ${
              coreCompletedCount === REQUIRED_TASK_COUNT ? 'complete' : ''
            }`}
            style={{ width: `${coreProgressPercent}%` }}
          />
        </div>
        <div className="progress-footer">
          <span className="progress-status-text">
            {coreCompletedCount === REQUIRED_TASK_COUNT
              ? '✨ All 5 Core Requirements Fulfilled!'
              : `${REQUIRED_TASK_COUNT - coreCompletedCount} more core task${
                  REQUIRED_TASK_COUNT - coreCompletedCount > 1 ? 's' : ''
                } needed for GitHub commit`}
          </span>
          <span className="progress-percent">{coreProgressPercent}%</span>
        </div>
      </div>

      {/* SECTION 1: CORE TASKS (5 REQUIRED) */}
      <div className="tasks-group">
        <div className="group-heading">
          <span className="group-title">Core Requirements (Required for GitHub Commit)</span>
          <span className="group-count">
            {coreCompletedCount} / {REQUIRED_TASK_COUNT}
          </span>
        </div>

        <div className="task-items-list">
          {coreTasks.map((task, index) => {
            const isChecked = Boolean(checkedTasks[task.id]);
            return (
              <div
                key={task.id}
                className={`task-row ${isChecked ? 'completed' : ''} ${
                  isCommitting ? 'disabled' : ''
                }`}
                onClick={() => {
                  if (isToday && !isCommitting) {
                    onToggleTask(task.id);
                  }
                }}
              >
                <div className="task-checkbox-wrapper">
                  <input
                    type="checkbox"
                    id={`task-${task.id}`}
                    checked={isChecked}
                    disabled={!isToday || isCommitting}
                    onChange={() => onToggleTask(task.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="custom-check">
                    {isChecked && <span>✓</span>}
                  </span>
                </div>

                <div className="task-number">#{index + 1}</div>

                <div className="task-icon">{task.icon}</div>

                <div className="task-text-content">
                  <div className="task-title-row">
                    <span className="task-title">{task.title}</span>
                    <span className="task-tag required">Required</span>
                  </div>
                  <span className="task-subtitle">{task.subtitle}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: OPTIONAL TASKS (2 OPTIONAL) */}
      <div className="tasks-group optional-group">
        <div className="group-heading">
          <span className="group-title">Bonus Accelerators (Optional - Does not block commit)</span>
          <span className="group-count">
            {optionalCompletedCount} / {optionalTasks.length}
          </span>
        </div>

        <div className="task-items-list">
          {optionalTasks.map((task, index) => {
            const isChecked = Boolean(checkedTasks[task.id]);
            return (
              <div
                key={task.id}
                className={`task-row optional-row ${isChecked ? 'completed' : ''} ${
                  isCommitting ? 'disabled' : ''
                }`}
                onClick={() => {
                  if (isToday && !isCommitting) {
                    onToggleTask(task.id);
                  }
                }}
              >
                <div className="task-checkbox-wrapper">
                  <input
                    type="checkbox"
                    id={`task-${task.id}`}
                    checked={isChecked}
                    disabled={!isToday || isCommitting}
                    onChange={() => onToggleTask(task.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="custom-check optional">
                    {isChecked && <span>✓</span>}
                  </span>
                </div>

                <div className="task-number">#{index + 6}</div>

                <div className="task-icon">{task.icon}</div>

                <div className="task-text-content">
                  <div className="task-title-row">
                    <span className="task-title">{task.title}</span>
                    <span className="task-tag optional">Optional</span>
                  </div>
                  <span className="task-subtitle">{task.subtitle}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!isToday && (
        <div className="historical-notice">
          <span>ℹ️ Viewing historical record for {selectedDate}. To update today&apos;s streak, switch to Today.</span>
        </div>
      )}
    </section>
  );
}
