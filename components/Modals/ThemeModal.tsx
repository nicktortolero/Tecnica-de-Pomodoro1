import React from 'react';
import Button from '../Button.js'; // Use .js extension

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Placeholder for theme logic
  const handleApplyTheme = () => {
    // In a real application, this would update a theme context or global state
    alert('Theme applied! (Functionality to change actual theme is not implemented)');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full text-white border border-gray-700 slide-in">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-200">
            <i className="fas fa-palette text-purple-500 mr-2"></i>
            Personalizar Tema
          </h3>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-6">
          <h4 className="font-bold mb-3 text-lg">Colores Primarios</h4>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="theme-option bg-gradient-to-br from-red-500 to-red-700 h-20 rounded-lg cursor-pointer border-2 border-red-500 transform hover:scale-105 transition-transform duration-200"></div>
            <div className="theme-option bg-gradient-to-br from-blue-500 to-blue-700 h-20 rounded-lg cursor-pointer transform hover:scale-105 transition-transform duration-200 border-2 border-transparent"></div>
            <div className="theme-option bg-gradient-to-br from-green-500 to-green-700 h-20 rounded-lg cursor-pointer transform hover:scale-105 transition-transform duration-200 border-2 border-transparent"></div>
            <div className="theme-option bg-gradient-to-br from-purple-500 to-purple-700 h-20 rounded-lg cursor-pointer transform hover:scale-105 transition-transform duration-200 border-2 border-transparent"></div>
            <div className="theme-option bg-gradient-to-br from-amber-500 to-amber-700 h-20 rounded-lg cursor-pointer transform hover:scale-105 transition-transform duration-200 border-2 border-transparent"></div>
            <div className="theme-option bg-gradient-to-br from-pink-500 to-pink-700 h-20 rounded-lg cursor-pointer transform hover:scale-105 transition-transform duration-200 border-2 border-transparent"></div>
            <div className="theme-option bg-gradient-to-br from-cyan-500 to-cyan-700 h-20 rounded-lg cursor-pointer transform hover:scale-105 transition-transform duration-200 border-2 border-transparent"></div>
            <div className="theme-option bg-gradient-to-br from-indigo-500 to-indigo-700 h-20 rounded-lg cursor-pointer transform hover:scale-105 transition-transform duration-200 border-2 border-transparent"></div>
          </div>

          <h4 className="font-bold mb-3 text-lg">Modo Oscuro/Claro</h4>
          <div className="flex gap-4">
            <div className="bg-gray-700 p-4 rounded-lg text-center cursor-pointer border-2 border-gray-600">
              <i className="fas fa-moon text-2xl mb-2"></i>
              <div>Oscuro</div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center cursor-pointer opacity-50 border-2 border-transparent">
              <i className="fas fa-sun text-2xl mb-2"></i>
              <div>Claro</div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 flex justify-end">
          <Button variant="secondary" onClick={onClose} className="mr-3">
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleApplyTheme}>
            Aplicar Tema
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThemeModal;