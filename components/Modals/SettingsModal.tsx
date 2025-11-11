import React, { useState, useEffect } from 'react';
import { Settings } from '../../types.js'; // Use .js extension
import Button from '../Button.js'; // Use .js extension

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (newSettings: Settings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings); // Reset local settings when modal opens
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLocalSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseInt(value) * 60, // Convert minutes to seconds
    }));
  };

  const handleSave = () => {
    // Convert back to minutes for display, but internally store in seconds
    onSave({
      ...localSettings,
      pomodoro: Math.max(1, localSettings.pomodoro),
      shortBreak: Math.max(1, localSettings.shortBreak),
      longBreak: Math.max(1, localSettings.longBreak),
      deepFocus: Math.max(1, localSettings.deepFocus),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full text-white border border-gray-700 slide-in">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-200">
            <i className="fas fa-cog text-blue-500 mr-2"></i>
            Configuración
          </h3>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold mb-3 text-lg">Tiempos</h4>
              <div className="space-y-4">
                <div>
                  <label htmlFor="pomodoro-setting" className="block text-gray-400 mb-1 text-sm">Tiempo de trabajo (min)</label>
                  <input
                    id="pomodoro-setting"
                    type="number"
                    min="1"
                    max="120"
                    name="pomodoro"
                    value={localSettings.pomodoro / 60}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="shortBreak-setting" className="block text-gray-400 mb-1 text-sm">Descanso corto (min)</label>
                  <input
                    id="shortBreak-setting"
                    type="number"
                    min="1"
                    max="30"
                    name="shortBreak"
                    value={localSettings.shortBreak / 60}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="longBreak-setting" className="block text-gray-400 mb-1 text-sm">Descanso largo (min)</label>
                  <input
                    id="longBreak-setting"
                    type="number"
                    min="1"
                    max="60"
                    name="longBreak"
                    value={localSettings.longBreak / 60}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="deepFocus-setting" className="block text-gray-400 mb-1 text-sm">Enfoque profundo (min)</label>
                  <input
                    id="deepFocus-setting"
                    type="number"
                    min="1"
                    max="180"
                    name="deepFocus"
                    value={localSettings.deepFocus / 60}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-3 text-lg">Preferencias</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <span>Notificaciones</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="notifications"
                      checked={localSettings.notifications}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <span>Sonido al completar</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="sound"
                      checked={localSettings.sound}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <span>Auto-iniciar descansos</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="autoStartBreaks"
                      checked={localSettings.autoStartBreaks}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <span>Recordatorio de descanso</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="breakReminder"
                      checked={localSettings.breakReminder}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <span>Ejecutar en segundo plano</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="background-mode-toggle"
                      type="checkbox"
                      name="backgroundMode"
                      checked={localSettings.backgroundMode}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 flex justify-end">
          <Button variant="secondary" onClick={onClose} className="mr-3">
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;