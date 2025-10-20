export type TimerMode = 'work' | 'break';

export interface PomodoroSession {
  id: string;
  mode: TimerMode;
  duration: number; // in seconds
  completedAt: string;
  date: string; // YYYY-MM-DD format
}

export interface TimerSettings {
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
}

export interface DayStats {
  date: string;
  workSessions: number;
  breakSessions: number;
  totalWorkTime: number; // in minutes
}
