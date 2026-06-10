export interface Habit {
  id: number;
  userId: number;
  title: string;
  colorHex: string;
  createdAt: number;
  targetDaysPerWeek: number;
  isNumerical: boolean;
  numericalGoal: number;
  numericalUnit: string;
  daysOfWeekPattern: string; // "1111111" representing Mon-Sun
}

export interface HabitCompletion {
  id: number;
  habitId: number;
  date: string; // YYYY-MM-DD
  notes: string | null;
  value: number;
}

export interface FocusSession {
  id: number;
  userId: number;
  habitId: number | null;
  durationSeconds: number;
  details: string | null;
  timestamp: number;
}

export interface TodoItem {
  id: number;
  userId: number;
  title: string;
  notes: string | null;
  isCompleted: boolean;
  createdAt: number;
  completedAt: number | null;
  sortOrder: number;
}

export interface FocusState {
  mode: 'TIMER' | 'STOPWATCH';
  isRunning: boolean;
  pausedSeconds: number;
  initialDurationMinutes: number;
  baseTimestamp: number;
  habitId: number | null;
  habitTitle: string;
}

export interface UserPreferences {
  darkModeEnabled: boolean;
  username: string;
}

const STORAGE_KEYS = {
  HABITS: 'loophabit_habits',
  COMPLETIONS: 'loophabit_completions',
  FOCUS_SESSIONS: 'loophabit_focus_sessions',
  TODOS: 'loophabit_todos',
  PREFERENCES: 'loophabit_preferences',
  FOCUS_STATE: 'loophabit_focus_state'
};

// Helper to check if we are in client side
const isClient = typeof window !== 'undefined';

// Generate YYYY-MM-DD string from Date object
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function seedDatabase() {
  if (!isClient) return;

  const habitsExist = localStorage.getItem(STORAGE_KEYS.HABITS);
  if (habitsExist) return; // Database already seeded/initialized

  console.log("Seeding LoopHabit database with mock data...");

  // 1. Seed Habits
  const mockHabits: Habit[] = [
    {
      id: 1,
      userId: 1,
      title: 'Daily Hydration',
      colorHex: '#118AB2', // Teal
      createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
      targetDaysPerWeek: 7,
      isNumerical: true,
      numericalGoal: 8,
      numericalUnit: 'glasses',
      daysOfWeekPattern: '1111111'
    },
    {
      id: 2,
      userId: 1,
      title: 'Gym Workout',
      colorHex: '#EF476F', // Pink
      createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
      targetDaysPerWeek: 3,
      isNumerical: false,
      numericalGoal: 0,
      numericalUnit: '',
      daysOfWeekPattern: '0101010' // Tue, Thu, Sat
    },
    {
      id: 3,
      userId: 1,
      title: 'Read a Book',
      colorHex: '#8338EC', // Purple
      createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
      targetDaysPerWeek: 5,
      isNumerical: false,
      numericalGoal: 0,
      numericalUnit: '',
      daysOfWeekPattern: '1111100' // Mon-Fri
    },
    {
      id: 4,
      userId: 1,
      title: 'Mindfulness Meditation',
      colorHex: '#06D6A0', // Green
      createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
      targetDaysPerWeek: 7,
      isNumerical: false,
      numericalGoal: 0,
      numericalUnit: '',
      daysOfWeekPattern: '1111111'
    }
  ];

  // 2. Seed Completions for past 14 days
  const mockCompletions: HabitCompletion[] = [];
  const mockFocusSessions: FocusSession[] = [];
  let completionId = 1;
  let focusSessionId = 1;

  const today = new Date();

  for (let i = 14; i >= 0; i--) {
    const checkDate = new Date();
    checkDate.setDate(today.getDate() - i);
    const dateStr = formatDateString(checkDate);
    const dayOfWeek = checkDate.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // map Mon=0 ... Sun=6

    // Seeding Daily Hydration (Goal: 8 glasses)
    // Completed almost every day, with random glass count
    if (Math.random() > 0.15) {
      const glasses = Math.floor(Math.random() * 4) + 6; // 6 to 9 glasses
      mockCompletions.push({
        id: completionId++,
        habitId: 1,
        date: dateStr,
        notes: glasses >= 8 ? 'Hit my goal!' : 'A bit under today',
        value: glasses
      });
    }

    // Seeding Gym Workout (Tue, Thu, Sat - index 1, 3, 5)
    if (dayIndex === 1 || dayIndex === 3 || dayIndex === 5) {
      // 80% chance of completing Gym
      if (Math.random() > 0.2) {
        mockCompletions.push({
          id: completionId++,
          habitId: 2,
          date: dateStr,
          notes: 'Leg day!' as string | null,
          value: 1
        });
        // Add gym focus session (e.g. 45 mins = 2700s or 60 mins = 3600s)
        mockFocusSessions.push({
          id: focusSessionId++,
          userId: 1,
          habitId: 2,
          durationSeconds: Math.random() > 0.5 ? 2700 : 3600,
          details: 'Heavy lifting session',
          timestamp: checkDate.getTime() + 18 * 60 * 60 * 1000 // 6:00 PM
        });
      }
    }

    // Seeding Read a Book (Mon-Fri)
    if (dayIndex >= 0 && dayIndex <= 4) {
      // 75% completion
      if (Math.random() > 0.25) {
        mockCompletions.push({
          id: completionId++,
          habitId: 3,
          date: dateStr,
          notes: 'Finished chapter 4',
          value: 1
        });
        // Add book focus session (e.g. 25 mins = 1500s)
        mockFocusSessions.push({
          id: focusSessionId++,
          userId: 1,
          habitId: 3,
          durationSeconds: 1500,
          details: 'Read sci-fi novel',
          timestamp: checkDate.getTime() + 21 * 60 * 60 * 1000 // 9:00 PM
        });
      }
    }

    // Seeding Mindfulness Meditation (Daily)
    // 70% completion
    if (Math.random() > 0.3) {
      mockCompletions.push({
        id: completionId++,
        habitId: 4,
        date: dateStr,
        notes: 'Very calming',
        value: 1
      });
      // Add meditation focus session (e.g. 10 mins = 600s or 15 mins = 900s)
      mockFocusSessions.push({
        id: focusSessionId++,
        userId: 1,
        habitId: 4,
        durationSeconds: Math.random() > 0.5 ? 600 : 900,
        details: 'Breathing exercises',
        timestamp: checkDate.getTime() + 8 * 60 * 60 * 1000 // 8:00 AM
      });
    }

    // Add some general focus sessions occasionally (not tied to habit)
    if (Math.random() > 0.7) {
      mockFocusSessions.push({
        id: focusSessionId++,
        userId: 1,
        habitId: null,
        durationSeconds: 1800, // 30 mins
        details: 'Deep work blocking email distraction',
        timestamp: checkDate.getTime() + 14 * 60 * 60 * 1000 // 2:00 PM
      });
    }
  }

  // 3. Save to localStorage
  localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(mockHabits));
  localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(mockCompletions));
  localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(mockFocusSessions));
  localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify([
    {
      id: 1,
      userId: 1,
      title: 'Review weekly habit goals',
      notes: 'One-off task kept separate from daily habits.',
      isCompleted: false,
      createdAt: Date.now() - 60 * 60 * 1000,
      completedAt: null,
      sortOrder: 0
    },
    {
      id: 2,
      userId: 1,
      title: 'Export a fresh backup',
      notes: 'Try the v1.3 backup flow.',
      isCompleted: true,
      createdAt: Date.now() - 2 * 60 * 60 * 1000,
      completedAt: Date.now() - 30 * 60 * 1000,
      sortOrder: 1
    }
  ]));

  // Initialize focus state
  const defaultFocusState: FocusState = {
    mode: 'TIMER',
    isRunning: false,
    pausedSeconds: 1500, // 25m
    initialDurationMinutes: 25,
    baseTimestamp: 0,
    habitId: 1,
    habitTitle: 'Daily Hydration'
  };
  localStorage.setItem(STORAGE_KEYS.FOCUS_STATE, JSON.stringify(defaultFocusState));

  // Initialize preferences
  const defaultPreferences: UserPreferences = {
    darkModeEnabled: true, // Default to dark mode for rich visual showcase
    username: 'Habit Builder'
  };
  localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(defaultPreferences));
}

// Database Getters & Setters
export function getHabits(): Habit[] {
  if (!isClient) return [];
  const habits = localStorage.getItem(STORAGE_KEYS.HABITS);
  return habits ? JSON.parse(habits) : [];
}

export function saveHabits(habits: Habit[]) {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
}

export function getCompletions(): HabitCompletion[] {
  if (!isClient) return [];
  const completions = localStorage.getItem(STORAGE_KEYS.COMPLETIONS);
  return completions ? JSON.parse(completions) : [];
}

export function saveCompletions(completions: HabitCompletion[]) {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(completions));
}

export function getFocusSessions(): FocusSession[] {
  if (!isClient) return [];
  const sessions = localStorage.getItem(STORAGE_KEYS.FOCUS_SESSIONS);
  return sessions ? JSON.parse(sessions) : [];
}

export function saveFocusSessions(sessions: FocusSession[]) {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(sessions));
}

export function getTodos(): TodoItem[] {
  if (!isClient) return [];
  const todos = localStorage.getItem(STORAGE_KEYS.TODOS);
  return todos ? JSON.parse(todos) : [];
}

export function saveTodos(todos: TodoItem[]) {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
}

export function getPreferences(): UserPreferences {
  if (!isClient) return { darkModeEnabled: true, username: 'Habit Builder' };
  const prefs = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
  return prefs ? JSON.parse(prefs) : { darkModeEnabled: true, username: 'Habit Builder' };
}

export function savePreferences(prefs: UserPreferences) {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
}

export function getFocusState(): FocusState {
  if (!isClient) {
    return {
      mode: 'TIMER',
      isRunning: false,
      pausedSeconds: 1500,
      initialDurationMinutes: 25,
      baseTimestamp: 0,
      habitId: null,
      habitTitle: ''
    };
  }
  const state = localStorage.getItem(STORAGE_KEYS.FOCUS_STATE);
  return state ? JSON.parse(state) : {
    mode: 'TIMER',
    isRunning: false,
    pausedSeconds: 1500,
    initialDurationMinutes: 25,
    baseTimestamp: 0,
    habitId: null,
    habitTitle: ''
  };
}

export function saveFocusState(state: FocusState) {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEYS.FOCUS_STATE, JSON.stringify(state));
}

// Reset Database helper
export function resetDatabase() {
  if (!isClient) return;
  localStorage.removeItem(STORAGE_KEYS.HABITS);
  localStorage.removeItem(STORAGE_KEYS.COMPLETIONS);
  localStorage.removeItem(STORAGE_KEYS.FOCUS_SESSIONS);
  localStorage.removeItem(STORAGE_KEYS.TODOS);
  localStorage.removeItem(STORAGE_KEYS.FOCUS_STATE);
  localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
  seedDatabase();
}
