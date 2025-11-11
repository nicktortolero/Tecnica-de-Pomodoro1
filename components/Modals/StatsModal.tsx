import React, { useState } from 'react';
import { PomodoroStats, Achievement, Settings } from '../../types.js'; // Use .js extension
import Button from '../Button.js'; // Use .js extension
import AchievementBadge from '../AchievementBadge.js'; // Use .js extension
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pomodoroStats: PomodoroStats;
  achievements: Achievement[];
  getAchievementStatus: (achievement: Achievement) => boolean;
  settings: Settings;
}

type StatTab = 'daily' | 'weekly' | 'achievements';

const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  pomodoroStats,
  achievements,
  getAchievementStatus,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<StatTab>('daily');

  if (!isOpen) return null;

  const calculateTotalFocusedTime = () => {
    // For simplicity, let's assume each pomodoro is 25 minutes, deep focus is 45 minutes
    const pomodoroMinutes = (pomodoroStats.dailyPomodoros[getTodayDate()] || 0) * (settings.pomodoro / 60);
    // This doesn't distinguish between pomodoro and deep focus in current stats,
    // so we'll just use totalPomodoros for now.
    return pomodoroStats.todayPomodoros * (settings.pomodoro / 60);
  };

  const calculateTotalBreakTime = () => {
    // This is a rough estimation as break duration isn't tracked per day
    return (pomodoroStats.todayPomodoros * (settings.shortBreak / 60)) +
           (Math.floor(pomodoroStats.todayPomodoros / 4) * (settings.longBreak / 60));
  };

  const getTodayDate = () => new Date().toISOString().slice(0, 10);

  const dailyData = Object.keys(pomodoroStats.dailyPomodoros)
    .sort()
    .map(date => ({
      date: new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      pomodoros: pomodoroStats.dailyPomodoros[date],
    }));

  const weeklyData = Object.keys(pomodoroStats.weeklyPomodoros)
    .sort()
    .map(week => ({
      week: week, // Can format this better if needed, e.g., 'Semana X'
      pomodoros: pomodoroStats.weeklyPomodoros[week],
    }));

  const pieChartData = [
    { name: 'Enfocado', value: calculateTotalFocusedTime() },
    { name: 'Descanso', value: calculateTotalBreakTime() },
  ];
  const COLORS = ['#ef4444', '#3b82f6']; // Red for focused, blue for break

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full text-white border border-gray-700 slide-in">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-200">
            <i className="fas fa-chart-line text-blue-500 mr-2"></i>
            Estadísticas de Productividad
          </h3>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-6">
          <div className="flex border-b border-gray-700 mb-4">
            <button
              className={`tab-button px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'daily' ? 'active bg-gray-700' : 'hover:bg-gray-700/50'}`}
              onClick={() => setActiveTab('daily')}
            >
              Diario
            </button>
            <button
              className={`tab-button px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'weekly' ? 'active bg-gray-700' : 'hover:bg-gray-700/50'}`}
              onClick={() => setActiveTab('weekly')}
            >
              Semanal
            </button>
            <button
              className={`tab-button px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'achievements' ? 'active bg-gray-700' : 'hover:bg-gray-700/50'}`}
              onClick={() => setActiveTab('achievements')}
            >
              Logros
            </button>
          </div>

          <div className={`tab-content ${activeTab === 'daily' ? 'active' : 'hidden'}`} id="daily-tab">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold mb-3">Resumen de Hoy</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <div className="text-gray-400">Pomodoros completados:</div>
                    <div className="font-bold">{pomodoroStats.dailyPomodoros[getTodayDate()] || 0}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-gray-400">Tareas completadas:</div>
                    <div className="font-bold">{pomodoroStats.completedTasks}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-gray-400">Tiempo enfocado:</div>
                    <div className="font-bold">{Math.round(calculateTotalFocusedTime())}m</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-gray-400">Tiempo en descansos:</div>
                    <div className="font-bold">{Math.round(calculateTotalBreakTime())}m</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-3">Distribución de Tiempo</h4>
                <div className="bg-gray-700 h-40 rounded-lg flex items-center justify-center">
                  {pieChartData[0].value > 0 || pieChartData[1].value > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${Math.round(value)}min`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-gray-500 text-sm">No hay datos de tiempo hoy</div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="font-bold mb-3">Progreso Diario de Pomodoros</h4>
              <div className="bg-gray-700 h-40 rounded-lg flex items-center justify-center p-2">
                {dailyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                      <XAxis dataKey="date" stroke="#e2e8f0" tickFormatter={(tick) => tick.split(' ')[0]} />
                      <YAxis stroke="#e2e8f0" allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="pomodoros" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-gray-500 text-sm">No hay datos diarios aún</div>
                )}
              </div>
            </div>
          </div>

          <div className={`tab-content ${activeTab === 'weekly' ? 'active' : 'hidden'}`} id="weekly-tab">
            <div>
              <h4 className="font-bold mb-3">Resumen Semanal</h4>
              <div className="bg-gray-700 h-60 rounded-lg flex items-center justify-center p-2">
                {weeklyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                      <XAxis dataKey="week" stroke="#e2e8f0" />
                      <YAxis stroke="#e2e8f0" allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="pomodoros" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-gray-500 text-sm">No hay datos semanales aún</div>
                )}
              </div>
            </div>
          </div>

          <div className={`tab-content ${activeTab === 'achievements' ? 'active' : 'hidden'}`} id="achievements-tab">
            <div>
              <h4 className="font-bold mb-3">Tus Logros</h4>
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

        <div className="p-6 border-t border-gray-700 flex justify-end">
          <Button variant="primary">
            Exportar Datos
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;