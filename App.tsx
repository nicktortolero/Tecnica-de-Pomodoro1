import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimerMode, Task, Settings, AppState, PomodoroStats } from './types.js'; // Use .js extension
import { DEFAULT_SETTINGS, INITIAL_APP_STATE } from './constants.js'; // Use .js extension
import TimerDisplay from './components/TimerDisplay.js'; // Use .js extension
import TimerControls from './components/TimerControls.js'; // Use .js extension
import ModeButton from './components/ModeButton.js'; // Use .js extension
import TaskInput from './components/TaskInput.js'; // Use .js extension
import TaskList from './components/TaskList.js'; // Use .js extension
import AchievementBadge from './components/AchievementBadge.js'; // Use .js extension
import StatsModal from './components/Modals/StatsModal.js'; // Use .js extension
import SettingsModal from './components/Modals/SettingsModal.js'; // Use .js extension
import ThemeModal from './components/Modals/ThemeModal.js'; // Use .js extension
import GeminiModal from './components/Modals/GeminiModal.js'; // Use .js extension
import BackgroundModeIndicator from './components/BackgroundModeIndicator.js'; // Use .js extension

const App: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
  });

  const [appState, setAppState] = useState<AppState>(() => {
    const savedState = localStorage.getItem('pomodoroAppState');
    const initial = savedState ? JSON.parse(savedState) : INITIAL_APP_STATE;
    // Ensure activeTime is correctly set based on the saved mode
    if (initial.mode) {
      initial.activeTime = settings[initial.mode as keyof Settings];
    }
    return initial;
  });

  const [pomodoroStats, setPomodoroStats] = useState<PomodoroStats>(() => {
    const savedStats = localStorage.getItem('pomodoroStats');
    return savedStats ? JSON.parse(savedStats) : {
      todayPomodoros: 0,
      weekPomodoros: 0,
      completedTasks: 0,
      totalPomodoros: 0,
      dailyPomodoros: {}, // { 'YYYY-MM-DD': count }
      weeklyPomodoros: {}, // { 'YYYY-WW': count }
      consecutivePomodoros: 0,
    };
  });

  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);

  const timerIntervalRef = useRef<number | null>(null);
  // Fix: Cast window to any to access webkitAudioContext for broader browser compatibility
  const audioContextRef = useRef<AudioContext | null>(null);

  // Persist settings and app state
  useEffect(() => {
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('pomodoroAppState', JSON.stringify(appState));
  }, [appState]);

  useEffect(() => {
    localStorage.setItem('pomodoroStats', JSON.stringify(pomodoroStats));
  }, [pomodoroStats]);

  // Handle service worker messages for background timer updates
  useEffect(() => {
    const handleSWMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'TIMER_UPDATE') {
        setAppState(prevState => ({ ...prevState, time: message.time }));
      } else if (message.type === 'TIMER_END') {
        handleTimerEnd();
      }
    };

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', handleSWMessage);
    }

    return () => {
      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener('message', handleSWMessage);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update document title with timer
  useEffect(() => {
    const minutes = Math.floor(appState.time / 60).toString().padStart(2, '0');
    const seconds = (appState.time % 60).toString().padStart(2, '0');
    document.title = `${minutes}:${seconds} | Pomodoro Pro`;
  }, [appState.time]);

  // Visibility change for background mode indicator
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'hidden' && appState.isRunning && settings.backgroundMode) {
      document.getElementById('background-mode-indicator')?.classList.remove('hidden');
    } else {
      document.getElementById('background-mode-indicator')?.classList.add('hidden');
    }
  }, [appState.isRunning, settings.backgroundMode]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  const playSound = useCallback(() => {
    if (!settings.sound) return;
    try {
      // Fix: Cast window to any to allow access to webkitAudioContext for compatibility
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.type = 'sine';
      oscillator.frequency.value = 880;
      gainNode.gain.value = 0.3;

      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
      }, 300);
    } catch (e) {
      console.log("Web Audio API not supported or error playing sound:", e);
    }
  }, [settings.sound]);

  const showNotification = useCallback((title: string, body: string) => {
    if (!settings.notifications || !('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: 'https://picsum.photos/64/64', // Placeholder icon
        // Fix: 'vibrate' is not a standard NotificationOption for direct browser notifications.
        // It's typically used with ServiceWorkerRegistration.showNotification().
        // vibrate: [200, 100, 200]
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, {
            body: body,
            icon: 'https://picsum.photos/64/64', // Placeholder icon
            // Fix: 'vibrate' is not a standard NotificationOption for direct browser notifications.
            // It's typically used with ServiceWorkerRegistration.showNotification().
            // vibrate: [200, 100, 200]
          });
        }
      });
    }
  }, [settings.notifications]);

  const handleTimerEnd = useCallback(() => {
    playSound();
    let notificationTitle = '';
    let notificationBody = '';

    setAppState(prevState => {
      const newState = { ...prevState, isRunning: false };
      let newMode: TimerMode = prevState.mode;

      if (prevState.mode === 'pomodoro' || prevState.mode === 'deepFocus') {
        // Increment pomodoro stats
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const week = startOfWeek.toISOString().slice(0, 10); // Simple week key

        setPomodoroStats(prevStats => {
          const newDailyPomodoros = { ...prevStats.dailyPomodoros };
          newDailyPomodoros[today] = (newDailyPomodoros[today] || 0) + 1;

          const newWeeklyPomodoros = { ...prevStats.weeklyPomodoros };
          newWeeklyPomodoros[week] = (newWeeklyPomodoros[week] || 0) + 1;

          const newConsecutivePomodoros = prevState.mode === 'pomodoro' ? prevStats.consecutivePomodoros + 1 : 0;

          return {
            ...prevStats,
            todayPomodoros: (prevStats.todayPomodoros || 0) + 1,
            weekPomodoros: (prevStats.weekPomodoros || 0) + 1,
            totalPomodoros: (prevStats.totalPomodoros || 0) + 1,
            dailyPomodoros: newDailyPomodoros,
            weeklyPomodoros: newWeeklyPomodoros,
            consecutivePomodoros: newConsecutivePomodoros,
          };
        });

        if (prevState.mode === 'pomodoro') {
          notificationTitle = '¡Pomodoro completado!';
          notificationBody = 'Toma un descanso.';
          if (pomodoroStats.consecutivePomodoros + 1 >= 4) { // Next will be the 4th pomodoro in a cycle
            newMode = 'longBreak';
          } else {
            newMode = 'shortBreak';
          }
        } else { // deepFocus
          notificationTitle = '¡Sesión de enfoque profundo completada!';
          notificationBody = 'Excelente trabajo.';
          newMode = 'longBreak'; // After deep focus, always suggest a long break
        }
      } else { // Breaks
        notificationTitle = '¡Descanso terminado!';
        notificationBody = 'Hora de volver a trabajar.';
        newMode = 'pomodoro';
      }

      showNotification(notificationTitle, notificationBody);

      if (settings.autoStartBreaks || newMode === 'pomodoro') {
        switchMode(newMode);
        // Delay starting the timer slightly if it's an auto-start
        setTimeout(() => startTimer(), 1000);
      } else {
        resetTimer();
        switchMode(newMode);
      }
      return newState;
    });
  }, [settings.autoStartBreaks, settings.sound, settings.notifications, pomodoroStats.consecutivePomodoros, playSound, showNotification]); // eslint-disable-line react-hooks/exhaustive-deps

  const startTimer = useCallback(() => {
    setAppState(prevState => {
      if (prevState.isRunning) return prevState;

      const newEndTime = Date.now() + (prevState.time * 1000);

      // Inform Service Worker
      if (settings.backgroundMode && navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'TIMER_START',
          time: prevState.time,
          mode: prevState.mode,
          endTime: newEndTime,
        });
      } else {
        // Start local timer
        timerIntervalRef.current = window.setInterval(() => {
          setAppState(currentAppState => {
            if (currentAppState.time <= 1) {
              clearInterval(timerIntervalRef.current as number);
              timerIntervalRef.current = null;
              handleTimerEnd(); // Call handleTimerEnd directly
              return { ...currentAppState, time: 0, isRunning: false };
            }
            return { ...currentAppState, time: currentAppState.time - 1 };
          });
        }, 1000);
      }

      return {
        ...prevState,
        isRunning: true,
        endTime: newEndTime,
      };
    });
  }, [settings.backgroundMode, handleTimerEnd]);

  const pauseTimer = useCallback(() => {
    setAppState(prevState => {
      if (!prevState.isRunning) return prevState;

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Inform Service Worker
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'TIMER_PAUSE',
          time: prevState.time,
        });
      }
      return { ...prevState, isRunning: false };
    });
  }, []);

  const resetTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Inform Service Worker
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'TIMER_RESET' });
    }

    setAppState(prevState => ({
      ...prevState,
      isRunning: false,
      time: prevState.activeTime,
      endTime: null,
    }));
  }, []);

  const switchMode = useCallback((mode: TimerMode) => {
    // Reset consecutive pomodoros if switching from break to pomodoro directly, or to deepFocus
    if ((appState.mode === 'shortBreak' || appState.mode === 'longBreak') && mode === 'pomodoro') {
      setPomodoroStats(prevStats => ({ ...prevStats, consecutivePomodoros: 0 }));
    }

    setAppState(prevState => {
      const newActiveTime = settings[mode as keyof Settings] as number; // Type assertion as settings values are numbers
      resetTimer(); // Reset timer first to clear interval
      const newState = {
        ...prevState,
        mode,
        activeTime: newActiveTime,
        time: newActiveTime,
        isRunning: false,
      };

      // Inform Service Worker
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'MODE_CHANGE', mode });
      }

      return newState;
    });
  }, [settings, resetTimer, appState.mode]); // Only include appState.mode to reset consecutive pomos on specific mode switches

  useEffect(() => {
    // Initialize timer with correct activeTime when settings change or on first load
    setAppState(prevState => {
      const newActiveTime = settings[prevState.mode as keyof Settings] as number;
      return {
        ...prevState,
        activeTime: newActiveTime,
        time: prevState.isRunning ? prevState.time : newActiveTime, // Only update time if not running
      };
    });
  }, [settings, appState.mode, appState.isRunning]); // Re-run if settings or active mode changes

  const addTask = useCallback((taskName: string) => {
    if (!taskName) return;
    setAppState(prevState => {
      const newTask: Task = {
        id: Date.now(),
        name: taskName,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      const newTasks = [...prevState.tasks, newTask];
      if (!prevState.activeTask) {
        return { ...prevState, tasks: newTasks, activeTask: newTask };
      }
      return { ...prevState, tasks: newTasks };
    });
  }, []);

  const toggleTaskComplete = useCallback((id: number) => {
    setAppState(prevState => {
      const newTasks = prevState.tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      const completedCount = newTasks.filter(t => t.completed).length;

      setPomodoroStats(prevStats => ({
        ...prevStats,
        completedTasks: completedCount,
      }));

      // If the active task is completed, clear it
      if (prevState.activeTask?.id === id && !newTasks.find(t => t.id === id)?.completed) {
        // If it's being marked incomplete, keep it active
        return { ...prevState, tasks: newTasks };
      } else if (prevState.activeTask?.id === id && newTasks.find(t => t.id === id)?.completed) {
        // If it's marked complete, set the next uncompleted task as active
        const nextUncompletedTask = newTasks.find(t => !t.completed);
        return { ...prevState, tasks: newTasks, activeTask: nextUncompletedTask || null };
      }

      return { ...prevState, tasks: newTasks };
    });
  }, []);

  const deleteTask = useCallback((id: number) => {
    setAppState(prevState => {
      const newTasks = prevState.tasks.filter(task => task.id !== id);
      const completedCount = newTasks.filter(t => t.completed).length;

      setPomodoroStats(prevStats => ({
        ...prevStats,
        completedTasks: completedCount,
      }));

      // If the deleted task was active, find the next uncompleted task
      if (prevState.activeTask?.id === id) {
        const nextUncompletedTask = newTasks.find(t => !t.completed);
        return { ...prevState, tasks: newTasks, activeTask: nextUncompletedTask || null };
      }
      return { ...prevState, tasks: newTasks };
    });
  }, []);

  const setActiveTask = useCallback((task: Task | null) => {
    setAppState(prevState => ({ ...prevState, activeTask: task }));
  }, []);

  const handleSettingsSave = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
    // When backgroundMode changes, restart SW communication if necessary
    if (newSettings.backgroundMode !== settings.backgroundMode) {
      if (newSettings.backgroundMode && navigator.serviceWorker && navigator.serviceWorker.controller) {
        // If background mode enabled and timer running, restart SW timer
        if (appState.isRunning) {
          navigator.serviceWorker.controller.postMessage({
            type: 'TIMER_START',
            time: appState.time,
            mode: appState.mode,
            endTime: appState.endTime,
          });
        }
      } else if (!newSettings.backgroundMode && appState.isRunning && timerIntervalRef.current === null) {
        // If background mode disabled and timer was running via SW, start local timer
        // and pause SW if it was controlling it
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'TIMER_PAUSE' });
        }
        startTimer(); // This will start the local timer
      }
    }
    setIsSettingsModalOpen(false);
  }, [settings, appState.isRunning, appState.time, appState.mode, appState.endTime, startTimer]);


  // Placeholder for achievements (can be moved to a dedicated hook/context)
  const achievements = [
    { name: 'Primeros Pasos', description: 'Completa 5 pomodoros', icon: 'fas fa-star', threshold: 5 },
    { name: 'Maestro Productivo', description: 'Completa 50 pomodoros', icon: 'fas fa-medal', threshold: 50 },
    { name: 'Sin Descanso', description: 'Completa 4 pomodoros seguidos', icon: 'fas fa-infinity', threshold: 4, type: 'consecutive' },
    { name: 'Tarea Maestra', description: 'Completa 10 tareas', icon: 'fas fa-check-double', threshold: 10, type: 'tasks' },
  ];

  const getAchievementStatus = (achievement: typeof achievements[0]) => {
    if (achievement.type === 'consecutive') {
      return pomodoroStats.consecutivePomodoros >= achievement.threshold;
    } else if (achievement.type === 'tasks') {
      return pomodoroStats.completedTasks >= achievement.threshold;
    }
    return pomodoroStats.totalPomodoros >= achievement.threshold;
  };

  const getProgressPercentage = (totalTime: number, currentTime: number) => {
    if (totalTime === 0) return 0;
    return Math.max(0, ((totalTime - currentTime) / totalTime) * 100);
  };

  const timerColorClass = `
    ${appState.mode === 'pomodoro' ? 'stroke-red-500' : ''}
    ${appState.mode === 'shortBreak' ? 'stroke-blue-500' : ''}
    ${appState.mode === 'longBreak' ? 'stroke-green-500' : ''}
    ${appState.mode === 'deepFocus' ? 'stroke-purple-500' : ''}
  `;

  const containerBgClass = `
    ${appState.mode === 'pomodoro' ? 'pomodoro-mode' : ''}
    ${appState.mode === 'shortBreak' ? 'short-break-mode' : ''}
    ${appState.mode === 'longBreak' ? 'long-break-mode' : ''}
    ${appState.mode === 'deepFocus' ? 'deep-focus-mode' : ''}
  `;

  const pomodoroButtonClass = appState.mode === 'pomodoro' ? 'bg-red-500 text-white' : 'bg-gray-700 hover:bg-gray-600';
  const shortBreakButtonClass = appState.mode === 'shortBreak' ? 'bg-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600';
  const longBreakButtonClass = appState.mode === 'longBreak' ? 'bg-green-500 text-white' : 'bg-gray-700 hover:bg-gray-600';
  const deepFocusButtonClass = appState.mode === 'deepFocus' ? 'bg-purple-500 text-white' : 'bg-gray-700 hover:bg-gray-600';

  const timerStateText = appState.isRunning
    ? (appState.mode === 'pomodoro' || appState.mode === 'deepFocus' ? '¡Enfocado! 💪' : 'Descanso... ☕')
    : (appState.time === appState.activeTime ? 'Preparado' : 'Pausado');

  return (
    <div className="w-full max-w-7xl">
      <BackgroundModeIndicator isVisible={appState.isRunning && settings.backgroundMode && document.visibilityState === 'hidden'} />

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 fade-in">
        <div className="flex items-center mb-4 sm:mb-0">
          <i className="fas fa-clock text-red-500 text-3xl mr-3"></i>
          <h1 className="text-3xl font-bold">Pomodoro Pro</h1>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => setIsStatsModalOpen(true)} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <i className="fas fa-chart-line"></i>
          </button>
          <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <i className="fas fa-cog"></i>
          </button>
          <button onClick={() => setIsThemeModalOpen(true)} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <i className="fas fa-palette"></i>
          </button>
          <button onClick={() => setIsGeminiModalOpen(true)} className="p-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
            <i className="fas fa-robot"></i> Gemini AI
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer Section */}
        <div className="lg:col-span-2">
          <div className={`timer-container bg-gray-800 rounded-2xl p-6 shadow-xl fade-in ${containerBgClass}`}>
            {/* Mode Buttons */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <ModeButton
                label="Trabajo"
                icon="fas fa-business-time"
                isActive={appState.mode === 'pomodoro'}
                onClick={() => switchMode('pomodoro')}
                activeClass={pomodoroButtonClass}
              />
              <ModeButton
                label="Descanso Corto"
                icon="fas fa-coffee"
                isActive={appState.mode === 'shortBreak'}
                onClick={() => switchMode('shortBreak')}
                activeClass={shortBreakButtonClass}
              />
              <ModeButton
                label="Descanso Largo"
                icon="fas fa-couch"
                isActive={appState.mode === 'longBreak'}
                onClick={() => switchMode('longBreak')}
                activeClass={longBreakButtonClass}
              />
              <ModeButton
                label="Enfoque Profundo"
                icon="fas fa-brain"
                isActive={appState.mode === 'deepFocus'}
                onClick={() => switchMode('deepFocus')}
                activeClass={deepFocusButtonClass}
              />
            </div>

            {/* Timer Display */}
            <TimerDisplay
              time={appState.time}
              activeTime={appState.activeTime}
              progressColorClass={timerColorClass}
              activeTaskName={appState.activeTask?.name || 'Sin tarea activa'}
              timerStateText={timerStateText}
            />

            {/* Controls */}
            <TimerControls
              isRunning={appState.isRunning}
              onStartPause={appState.isRunning ? pauseTimer : startTimer}
              onReset={resetTimer}
            />

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 mt-8 text-center">
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <div className="text-2xl font-bold" id="today-pomodoros">{pomodoroStats.todayPomodoros}</div>
                <div className="text-gray-400 text-sm">Hoy</div>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <div className="text-2xl font-bold" id="week-pomodoros">{pomodoroStats.weekPomodoros}</div>
                <div className="text-gray-400 text-sm">Esta semana</div>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <div className="text-2xl font-bold" id="completed-tasks">{pomodoroStats.completedTasks}</div>
                <div className="text-gray-400 text-sm">Tareas completadas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Task Management */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-xl fade-in">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <i className="fas fa-tasks text-red-500 mr-2"></i>
              Tus Tareas
            </h2>
            <TaskInput onAddTask={addTask} />
            <TaskList
              tasks={appState.tasks}
              onToggleComplete={toggleTaskComplete}
              onDeleteTask={deleteTask}
              onSetActiveTask={setActiveTask}
              activeTaskId={appState.activeTask?.id || null}
            />
          </div>

          {/* Achievements */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-xl fade-in">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <i className="fas fa-trophy text-yellow-400 mr-2"></i>
              Tus Logros
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map((achievement, index) => (
                <AchievementBadge
                  key={index}
                  name={achievement.name}
                  description={achievement.description}
                  icon={achievement.icon}
                  isUnlocked={getAchievementStatus(achievement)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        pomodoroStats={pomodoroStats}
        achievements={achievements}
        getAchievementStatus={getAchievementStatus}
        settings={settings}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={handleSettingsSave}
      />
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
      <GeminiModal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
      />
    </div>
  );
};

export default App;