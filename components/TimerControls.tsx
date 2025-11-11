import React from 'react';
import Button from './Button.js'; // Use .js extension

interface TimerControlsProps {
  isRunning: boolean;
  onStartPause: () => void;
  onReset: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({ isRunning, onStartPause, onReset }) => {
  return (
    <div className="flex justify-center gap-4 mt-6">
      <Button
        onClick={onStartPause}
        variant="primary"
        size="lg"
        className={`${isRunning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'} ${isRunning ? 'pulse' : ''}`}
        icon={isRunning ? 'fas fa-pause' : 'fas fa-play'}
      >
        {isRunning ? 'Pausar' : 'Iniciar'}
      </Button>
      <Button
        onClick={onReset}
        variant="secondary"
        size="lg"
        icon="fas fa-redo"
      >
        Reiniciar
      </Button>
    </div>
  );
};

export default TimerControls;