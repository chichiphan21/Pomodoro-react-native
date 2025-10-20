import { DayStats, PomodoroSession } from '@/types/pomodoro';

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const getCurrentDate = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit',
    year: 'numeric'
  });
};

export const calculateDayStats = (sessions: PomodoroSession[]): DayStats[] => {
  const statsMap = new Map<string, DayStats>();

  sessions.forEach(session => {
    const existing = statsMap.get(session.date);
    
    if (existing) {
      if (session.mode === 'work') {
        existing.workSessions += 1;
        existing.totalWorkTime += session.duration / 60;
      } else {
        existing.breakSessions += 1;
      }
    } else {
      statsMap.set(session.date, {
        date: session.date,
        workSessions: session.mode === 'work' ? 1 : 0,
        breakSessions: session.mode === 'break' ? 1 : 0,
        totalWorkTime: session.mode === 'work' ? session.duration / 60 : 0,
      });
    }
  });

  return Array.from(statsMap.values()).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const getLast7DaysStats = (sessions: PomodoroSession[]): DayStats[] => {
  const stats = calculateDayStats(sessions);
  const last7Days: DayStats[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    const existing = stats.find(s => s.date === dateString);
    last7Days.push(existing || {
      date: dateString,
      workSessions: 0,
      breakSessions: 0,
      totalWorkTime: 0,
    });
  }
  
  return last7Days;
};
