export const CONSTANT_TASKS = [
  {
    id: 'lc_streak',
    title: 'LC Streak',
    subtitle: 'LeetCode Daily Challenge & Problem Solving',
    icon: '💻',
    required: true,
    tag: 'Core Requirement'
  },
  {
    id: 'physical_mental_exercise',
    title: 'Physical and Mental Exercise',
    subtitle: 'Workout, Cardio, Yoga, Meditation & Mindfulness',
    icon: '🧘',
    required: true,
    tag: 'Core Requirement'
  },
  {
    id: 'family_healthcare',
    title: 'Spending Time with Family and Health Care',
    subtitle: 'Family bonding, hydration, healthy meals & rest',
    icon: '👨‍👩‍👧',
    required: true,
    tag: 'Core Requirement'
  },
  {
    id: 'study_session_1',
    title: 'Study Session-1',
    subtitle: 'Deep focus primary study block (DSA / Engineering concepts)',
    icon: '📚',
    required: true,
    tag: 'Core Requirement'
  },
  {
    id: 'study_revision_arv',
    title: 'Study / Revision or ARV Session',
    subtitle: 'Active Recall, Spaced Repetition & Daily Synthesis',
    icon: '🔄',
    required: true,
    tag: 'Core Requirement'
  },
  {
    id: 'communication',
    title: 'Communication [optional]',
    subtitle: 'English fluency, speaking, discussions or networking',
    icon: '🗣️',
    required: false,
    tag: 'Optional Bonus'
  },
  {
    id: 'study_session_2',
    title: 'Study Session-2 [optional]',
    subtitle: 'Secondary deep focus or project building block',
    icon: '📖',
    required: false,
    tag: 'Optional Bonus'
  }
];

export const REQUIRED_TASK_COUNT = CONSTANT_TASKS.filter(t => t.required).length;
