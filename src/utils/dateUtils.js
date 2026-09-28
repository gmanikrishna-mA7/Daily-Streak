/**
 * Format a Date object to YYYY-MM-DD in local time
 */
export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD to a local Date object
 */
export function parseDateKey(key) {
  if (!key) return new Date();
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format date for friendly display
 */
export function formatFriendlyDate(dateKey) {
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Get all dates in a specified month
 */
export function getDaysInMonth(year, month) {
  const totalDays = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let day = 1; day <= totalDays; day++) {
    days.push(new Date(year, month, day));
  }
  return days;
}

/**
 * Calculate current streak, longest streak, and stats strictly from history
 */
export function calculateStreaks(history = {}, referenceDate = new Date()) {
  const completedDateKeys = new Set(
    Object.keys(history).filter((key) => history[key]?.completed === true)
  );

  const todayKey = getLocalDateKey(referenceDate);
  const yesterday = new Date(referenceDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getLocalDateKey(yesterday);

  // Current Streak Calculation
  let currentStreak = 0;
  let checkDate = new Date(referenceDate);

  if (completedDateKeys.has(todayKey)) {
    // Today is already completed: count today and backwards
    while (completedDateKeys.has(getLocalDateKey(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else if (completedDateKeys.has(yesterdayKey)) {
    // Today is not yet completed, but yesterday was completed: active streak is preserved
    checkDate = new Date(yesterday);
    while (completedDateKeys.has(getLocalDateKey(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // Longest Streak Calculation
  const sortedDates = Array.from(completedDateKeys).sort();
  let longestStreak = 0;
  let currentRun = 0;
  let prevTimestamp = null;

  for (const dateStr of sortedDates) {
    const d = parseDateKey(dateStr);
    const ts = d.getTime();

    if (prevTimestamp === null) {
      currentRun = 1;
    } else {
      const diffDays = Math.round((ts - prevTimestamp) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentRun++;
      } else if (diffDays > 1) {
        currentRun = 1;
      }
    }
    prevTimestamp = ts;
    if (currentRun > longestStreak) {
      longestStreak = currentRun;
    }
  }

  // Calculate 30-day consistency rate
  let last30Completed = 0;
  const tempDate = new Date(referenceDate);
  for (let i = 0; i < 30; i++) {
    const k = getLocalDateKey(tempDate);
    if (completedDateKeys.has(k)) {
      last30Completed++;
    }
    tempDate.setDate(tempDate.getDate() - 1);
  }
  const consistencyRate = Math.round((last30Completed / 30) * 100);

  return {
    currentStreak,
    longestStreak,
    totalCompleted: completedDateKeys.size,
    consistencyRate,
    isTodayCompleted: completedDateKeys.has(todayKey)
  };
}
