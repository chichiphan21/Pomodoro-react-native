import { PomodoroSession, TimerSettings } from '@/types/pomodoro';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSIONS_KEY = '@pomodoro_sessions';
const SETTINGS_KEY = '@pomodoro_settings';

export const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25,
  breakDuration: 5,
};

// Session storage
export const savePomodoroSession = async (session: PomodoroSession): Promise<void> => {
  try {
    const existingSessions = await getPomodoroSessions();
    const updatedSessions = [session, ...existingSessions];
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
  } catch (error) {
    console.error('Error saving session:', error);
  }
};

export const getPomodoroSessions = async (): Promise<PomodoroSession[]> => {
  try {
    const sessions = await AsyncStorage.getItem(SESSIONS_KEY);
    return sessions ? JSON.parse(sessions) : [];
  } catch (error) {
    console.error('Error getting sessions:', error);
    return [];
  }
};

export const clearPomodoroSessions = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SESSIONS_KEY);
  } catch (error) {
    console.error('Error clearing sessions:', error);
  }
};

// Settings storage
export const saveSettings = async (settings: TimerSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export const getSettings = async (): Promise<TimerSettings> => {
  try {
    const settings = await AsyncStorage.getItem(SETTINGS_KEY);
    return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
};
