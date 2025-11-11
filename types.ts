export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'deepFocus';

export interface Task {
  id: number;
  name: string;
  completed: boolean;
  createdAt: string;
}

export interface Settings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
  deepFocus: number;
  notifications: boolean;
  sound: boolean;
  autoStartBreaks: boolean;
  breakReminder: boolean;
  backgroundMode: boolean;
}

export interface AppState {
  time: number;
  activeTime: number; // The total time for the current mode
  isRunning: boolean;
  mode: TimerMode;
  interval: number | null; // This will likely be managed by useRef in React
  tasks: Task[];
  activeTask: Task | null;
  endTime: number | null; // Timestamp when the timer should end
}

export interface DailyPomodoros {
  [date: string]: number; // 'YYYY-MM-DD': count
}

export interface WeeklyPomodoros {
  [week: string]: number; // 'YYYY-WW': count
}

export interface PomodoroStats {
  todayPomodoros: number;
  weekPomodoros: number;
  completedTasks: number;
  totalPomodoros: number; // Overall total
  dailyPomodoros: DailyPomodoros;
  weeklyPomodoros: WeeklyPomodoros;
  consecutivePomodoros: number; // For achievements
}

export interface Achievement {
  name: string;
  description: string;
  icon: string;
  threshold: number;
  type?: 'consecutive' | 'tasks'; // Optional: for specific achievement types
}