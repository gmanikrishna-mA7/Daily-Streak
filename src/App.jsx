import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import CommitBanner from './components/CommitBanner';
import DailyTasksList from './components/DailyTasksList';
import CalendarView from './components/CalendarView';
import SetupModal from './components/SetupModal';
import StreakInspectorModal from './components/StreakInspectorModal';
import { CONSTANT_TASKS, REQUIRED_TASK_COUNT } from './constants/tasks';
import { calculateStreaks, getLocalDateKey } from './utils/dateUtils';
import { fireConfetti } from './utils/confetti';
import './App.css';

function App() {
  // Today's date key: YYYY-MM-DD
  const todayKey = useMemo(() => getLocalDateKey(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(todayKey);

  // Persistent historical state fetched from GitHub Contents API (streak.json)
  const [history, setHistory] = useState({});
  const [sha, setSha] = useState(null);
  const [gitStatus, setGitStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Temporary checkbox state in React state for today
  // Rule 5: React stores today's temporary checkbox state only in React state
  const [checkedTasks, setCheckedTasks] = useState({});

  // Commit lifecycle
  const [isCommitting, setIsCommitting] = useState(false);
  const [lastCommit, setLastCommit] = useState(null);
  const commitLockRef = useRef(false);

  // Modals
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Fetch streak.json from backend API on mount
  const fetchStreak = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/streak');
      const data = await res.json();

      if (data.history) {
        setHistory(data.history);
        setSha(data.sha);
      }

      setGitStatus({
        connected: data.connected,
        mode: data.mode,
        owner: data.owner,
        repo: data.repo,
        branch: data.branch,
        notice: data.notice
      });

      // If today is already marked completed in streak.json, initialize all core tasks as checked
      if (data.history?.[todayKey]?.completed) {
        setCheckedTasks((prev) => {
          const autoChecked = { ...prev };
          CONSTANT_TASKS.forEach((t) => {
            if (t.required) {
              autoChecked[t.id] = true;
            }
          });
          return autoChecked;
        });
      }
    } catch (err) {
      console.error('Failed to fetch streak data:', err);
      setError('Could not connect to streak API. Please check your dev server.');
    } finally {
      setIsLoading(false);
    }
  }, [todayKey]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  // Dynamic calculations strictly from history
  const stats = useMemo(() => {
    return calculateStreaks(history, new Date());
  }, [history]);

  // Tasks counts
  const coreTasks = useMemo(() => CONSTANT_TASKS.filter((t) => t.required), []);
  const coreCompletedCount = useMemo(() => {
    return coreTasks.filter((t) => checkedTasks[t.id]).length;
  }, [coreTasks, checkedTasks]);

  // Trigger commit when all required tasks are completed
  const triggerCommit = useCallback(
    async (dateKey) => {
      // Prevent duplicate completion requests
      if (commitLockRef.current || isCommitting) return;

      // Check if already completed in history (Rule 8 & 9)
      if (history[dateKey]?.completed === true) {
        console.log(`[Streak] ${dateKey} is already recorded as completed. Skipping.`);
        return;
      }

      commitLockRef.current = true;
      setIsCommitting(true);
      setError(null);

      try {
        const response = await fetch('/api/streak/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: dateKey })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to complete daily streak on GitHub');
        }

        if (result.history) {
          setHistory(result.history);
          setSha(result.sha);
        }

        if (result.commit) {
          setLastCommit(result.commit);
        }

        // Celebrate!
        fireConfetti();
      } catch (err) {
        console.error('Commit trigger failed:', err);
        setError(`Commit failed: ${err.message}`);
      } finally {
        setIsCommitting(false);
        commitLockRef.current = false;
      }
    },
    [history, isCommitting]
  );

  // Toggle task checkbox
  const handleToggleTask = (taskId) => {
    if (selectedDate !== todayKey) return;

    setCheckedTasks((prev) => {
      const nextChecked = {
        ...prev,
        [taskId]: !prev[taskId]
      };

      // Check if all core tasks are now completed
      const allCoreDone = coreTasks.every((t) => nextChecked[t.id]);

      if (allCoreDone && !history[todayKey]?.completed) {
        // Asynchronously trigger automated GitHub commit
        setTimeout(() => {
          triggerCommit(todayKey);
        }, 150);
      }

      return nextChecked;
    });
  };

  const isSelectedDateToday = selectedDate === todayKey;
  const isSelectedDateCompleted = history[selectedDate]?.completed === true;

  return (
    <div className="daily-streak-app">
      <Header
        status={gitStatus}
        onOpenSetup={() => setIsSetupOpen(true)}
        onOpenInspector={() => setIsInspectorOpen(true)}
        onRefresh={fetchStreak}
        isLoading={isLoading}
      />

      <main className="main-content-layout">
        {/* Top Stats Overview */}
        <StatsCards stats={stats} />

        {/* Live Commit Banner & Status */}
        <CommitBanner
          isTodayCompleted={stats.isTodayCompleted}
          isCommitting={isCommitting}
          todayKey={todayKey}
          lastCommit={lastCommit}
          error={error}
          onRetry={() => triggerCommit(todayKey)}
          requiredCompletedCount={coreCompletedCount}
          requiredTotalCount={REQUIRED_TASK_COUNT}
          status={gitStatus}
        />

        {/* Split Screen Layout: Tasks on Left, Calendar & History on Right */}
        <div className="streak-workspace-grid">
          <div className="protocol-column">
            <DailyTasksList
              todayKey={todayKey}
              selectedDate={selectedDate}
              isToday={isSelectedDateToday}
              isDateCompleted={isSelectedDateCompleted}
              checkedTasks={checkedTasks}
              onToggleTask={handleToggleTask}
              isCommitting={isCommitting}
            />
          </div>

          <div className="activity-column">
            <CalendarView
              history={history}
              todayKey={todayKey}
              selectedDate={selectedDate}
              onSelectDate={(date) => setSelectedDate(date)}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <SetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        status={gitStatus}
      />

      <StreakInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        history={history}
        sha={sha}
        status={gitStatus}
      />
    </div>
  );
}

export default App;