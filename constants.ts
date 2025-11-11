import { Settings, AppState, PomodoroStats } from './types.js'; // Use .js extension

export const DEFAULT_SETTINGS: Settings = {
  pomodoro: 25 * 60,      // 25 minutes
  shortBreak: 5 * 60,     // 5 minutes
  longBreak: 15 * 60,     // 15 minutes
  deepFocus: 45 * 60,     // 45 minutes
  notifications: true,
  sound: true,
  autoStartBreaks: false,
  breakReminder: true,
  backgroundMode: true,
};

export const INITIAL_APP_STATE: AppState = {
  time: DEFAULT_SETTINGS.pomodoro,
  activeTime: DEFAULT_SETTINGS.pomodoro,
  isRunning: false,
  mode: 'pomodoro',
  interval: null,
  tasks: [
    { id: 1, name: 'Diseñar la interfaz de usuario', completed: false, createdAt: new Date().toISOString() },
    { id: 2, name: 'Implementar funcionalidad del temporizador', completed: false, createdAt: new Date().toISOString() },
    { id: 3, name: 'Crear sistema de logros', completed: true, createdAt: new Date().toISOString() },
  ],
  activeTask: { id: 1, name: 'Diseñar la interfaz de usuario', completed: false, createdAt: new Date().toISOString() }, // Default active task
  endTime: null,
};

export const INITIAL_POMODORO_STATS: PomodoroStats = {
  todayPomodoros: 0,
  weekPomodoros: 0,
  completedTasks: 0,
  totalPomodoros: 0,
  dailyPomodoros: {},
  weeklyPomodoros: {},
  consecutivePomodoros: 0,
};

export const POMODORO_COLORS = {
  pomodoro: 'red-500',
  shortBreak: 'blue-500',
  longBreak: 'green-500',
  deepFocus: 'purple-500',
};