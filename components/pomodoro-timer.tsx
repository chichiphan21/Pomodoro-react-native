import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { PomodoroSession, TimerMode, TimerSettings } from '@/types/pomodoro';
import {
  cancelAllNotifications,
  scheduleNotification,
  setupNotifications,
} from '@/utils/notifications';
import {
  formatDate,
  formatTime,
  getCurrentDate,
  getLast7DaysStats,
} from '@/utils/stats';
import {
  getPomodoroSessions,
  getSettings,
  savePomodoroSession,
  saveSettings,
} from '@/utils/storage';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [settings, setSettings] = useState<TimerSettings>({
    workDuration: 25,
    breakDuration: 5,
  });
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationIdRef = useRef<string | null>(null);

  // Load settings and sessions on mount
  useEffect(() => {
    const loadData = async () => {
      await setupNotifications();
      const savedSettings = await getSettings();
      const savedSessions = await getPomodoroSessions();
      
      setSettings(savedSettings);
      setSessions(savedSessions);
      setTimeLeft(savedSettings.workDuration * 60);
    };

    loadData();
  }, []);

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    const duration = newMode === 'work' ? settings.workDuration : settings.breakDuration;
    setTimeLeft(duration * 60);
  }, [settings.workDuration, settings.breakDuration]);

  // Timer logic
  const handleTimerComplete = useCallback(async () => {
    setIsRunning(false);
    
    // Haptic feedback
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Save session
    const session: PomodoroSession = {
      id: Date.now().toString(),
      mode,
      duration: mode === 'work' ? settings.workDuration * 60 : settings.breakDuration * 60,
      completedAt: new Date().toISOString(),
      date: getCurrentDate(),
    };
    
    await savePomodoroSession(session);
    const updatedSessions = await getPomodoroSessions();
    setSessions(updatedSessions);

    // Send notification
    const nextMode = mode === 'work' ? 'break' : 'work';
    await scheduleNotification(
      'Pomodoro Timer',
      mode === 'work' 
        ? '🎉 Work session complete! Time for a break.' 
        : '💪 Break is over! Ready to work?',
      0
    );

    // Switch mode
    switchMode(nextMode);
  }, [mode, settings.workDuration, settings.breakDuration, switchMode]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Keep screen awake
      activateKeepAwakeAsync();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      deactivateKeepAwake();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, handleTimerComplete]);

  const handleStartPause = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (isRunning) {
      // Cancel scheduled notification
      if (notificationIdRef.current) {
        await cancelAllNotifications();
      }
    } else {
      // Schedule notification for when timer completes
      const notificationId = await scheduleNotification(
        'Pomodoro Timer',
        mode === 'work' 
          ? 'Work session complete!' 
          : 'Break is over!',
        timeLeft
      );
      notificationIdRef.current = notificationId;
    }
    
    setIsRunning(!isRunning);
  };

  const handleReset = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setIsRunning(false);
    await cancelAllNotifications();
    const duration = mode === 'work' ? settings.workDuration : settings.breakDuration;
    setTimeLeft(duration * 60);
  };

  const handleSaveSettings = async (newSettings: TimerSettings) => {
    await saveSettings(newSettings);
    setSettings(newSettings);
    
    // Update current timer if not running
    if (!isRunning) {
      const duration = mode === 'work' ? newSettings.workDuration : newSettings.breakDuration;
      setTimeLeft(duration * 60);
    }
    
    setShowSettings(false);
  };

  const progress = mode === 'work' 
    ? 1 - (timeLeft / (settings.workDuration * 60))
    : 1 - (timeLeft / (settings.breakDuration * 60));

  const stats = getLast7DaysStats(sessions);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <LinearGradient
        colors={mode === 'work' ? ['#667eea', '#764ba2'] : ['#f093fb', '#f5576c']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Pomodoro Timer</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowStats(!showStats)}
            >
              <Text style={styles.headerButtonText}>📊</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowSettings(true)}
            >
              <Text style={styles.headerButtonText}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'work' && styles.modeButtonActive]}
            onPress={() => !isRunning && switchMode('work')}
            disabled={isRunning}
          >
            <Text style={[styles.modeButtonText, mode === 'work' && styles.modeButtonTextActive]}>
              Work
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'break' && styles.modeButtonActive]}
            onPress={() => !isRunning && switchMode('break')}
            disabled={isRunning}
          >
            <Text style={[styles.modeButtonText, mode === 'break' && styles.modeButtonTextActive]}>
              Break
            </Text>
          </TouchableOpacity>
        </View>

        {/* Timer Display */}
        <View style={styles.timerContainer}>
          <View style={styles.progressCircle}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          <Text style={styles.modeText}>
            {mode === 'work' ? '💼 Focus Time' : '☕ Break Time'}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, styles.resetButton]}
            onPress={handleReset}
          >
            <Text style={styles.controlButtonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, styles.startButton]}
            onPress={handleStartPause}
          >
            <Text style={styles.controlButtonText}>
              {isRunning ? 'Pause' : 'Start'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        {showStats && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Last 7 Days</Text>
            <LineChart
              data={{
                labels: stats.map(s => new Date(s.date).getDate().toString()),
                datasets: [{
                  data: stats.map(s => s.workSessions),
                }],
              }}
              width={SCREEN_WIDTH - 80}
              height={220}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: 'transparent',
                backgroundGradientTo: 'transparent',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#fff',
                },
              }}
              bezier
              style={styles.chart}
              withVerticalLabels={true}
              withHorizontalLabels={true}
            />
            
            <View style={styles.statsList}>
              <Text style={styles.statsSubtitle}>Recent Sessions</Text>
              {sessions.slice(0, 5).map((session) => (
                <View key={session.id} style={styles.sessionItem}>
                  <Text style={styles.sessionIcon}>
                    {session.mode === 'work' ? '💼' : '☕'}
                  </Text>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionMode}>
                      {session.mode === 'work' ? 'Work' : 'Break'}
                    </Text>
                    <Text style={styles.sessionDate}>
                      {formatDate(session.date)}
                    </Text>
                  </View>
                  <Text style={styles.sessionDuration}>
                    {Math.round(session.duration / 60)} min
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </LinearGradient>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Settings</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Work Duration (minutes)</Text>
              <TextInput
                style={styles.settingInput}
                keyboardType="number-pad"
                value={settings.workDuration.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text) || 1;
                  setSettings({ ...settings, workDuration: value });
                }}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Break Duration (minutes)</Text>
              <TextInput
                style={styles.settingInput}
                keyboardType="number-pad"
                value={settings.breakDuration.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text) || 1;
                  setSettings({ ...settings, breakDuration: value });
                }}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowSettings(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => handleSaveSettings(settings)}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  gradient: {
    flex: 1,
    minHeight: '100%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 20,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 4,
    marginBottom: 40,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#fff',
  },
  modeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#667eea',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  progressCircle: {
    width: 250,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 30,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  modeText: {
    fontSize: 20,
    color: '#fff',
    marginTop: 10,
    opacity: 0.9,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  controlButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#fff',
  },
  resetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
  },
  statsContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsList: {
    marginTop: 20,
  },
  statsSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  sessionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionMode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  sessionDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  sessionDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  settingItem: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  settingInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#667eea',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
