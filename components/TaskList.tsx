import React from 'react';
import { Task } from '../types.js'; // Use .js extension

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onSetActiveTask: (task: Task | null) => void;
  activeTaskId: number | null;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleComplete,
  onDeleteTask,
  onSetActiveTask,
  activeTaskId,
}) => {
  return (
    <div id="tasks-list" className="space-y-3 max-h-80 overflow-y-auto pr-2">
      {tasks.length === 0 ? (
        <div className="text-center py-6 text-gray-500" id="no-tasks-message">
          <i className="fas fa-clipboard-list text-3xl mb-3"></i>
          <p>No hay tareas pendientes</p>
        </div>
      ) : (
        tasks.map(task => (
          <div
            key={task.id}
            className={`task-item flex items-center justify-between p-3 bg-gray-700 rounded-lg fade-in ${
              task.completed ? 'opacity-60' : ''
            } ${activeTaskId === task.id ? 'border-2 border-blue-500' : ''}`}
          >
            <div className="flex items-center">
              <button
                className={`task-toggle w-5 h-5 rounded-full border mr-3 flex items-center justify-center transition-colors ${
                  task.completed ? 'bg-green-500 border-green-500' : 'border-gray-500 hover:bg-gray-600'
                }`}
                onClick={() => onToggleComplete(task.id)}
                aria-label={task.completed ? `Marcar "${task.name}" como incompleta` : `Marcar "${task.name}" como completa`}
              >
                {task.completed && <i className="fas fa-check text-white text-xs"></i>}
              </button>
              <span className={`${task.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                {task.name}
              </span>
            </div>
            <div className="flex gap-2 items-center">
              {!task.completed && (
                <button
                  className={`task-active p-1 text-blue-400 hover:text-blue-300 transition-colors ${activeTaskId === task.id ? 'bg-blue-800 rounded-full' : ''}`}
                  onClick={() => onSetActiveTask(task)}
                  aria-label={`Establecer "${task.name}" como tarea activa`}
                >
                  <i className="fas fa-play"></i>
                </button>
              )}
              <button
                className="task-delete p-1 text-gray-500 hover:text-red-500 transition-colors"
                onClick={() => onDeleteTask(task.id)}
                aria-label={`Eliminar tarea "${task.name}"`}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TaskList;