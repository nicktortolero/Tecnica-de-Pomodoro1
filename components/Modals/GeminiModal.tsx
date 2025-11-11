import React, { useState } from 'react';
import Button from '../Button.js'; // Use .js extension
import { geminiService, GeminiModel } from '../../services/geminiService.js'; // Use .js extension

interface GeminiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GeminiModal: React.FC<GeminiModalProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<GeminiModel>(GeminiModel.FLASH);

  if (!isOpen) return null;

  const handleGenerateContent = async (isThinkingMode = false) => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    setLoading(true);
    setResponse('');
    setError(null);

    try {
      const modelToUse = isThinkingMode ? GeminiModel.PRO : selectedModel;
      const geminiResponse = await geminiService.generateContent({
        model: modelToUse,
        prompt: prompt,
        isThinkingMode: isThinkingMode,
      });
      setResponse(geminiResponse);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full text-white border border-gray-700 slide-in">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-200">
            <i className="fas fa-robot text-blue-500 mr-2"></i>
            Gemini AI Assistant
          </h3>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="mb-4">
            <label htmlFor="gemini-prompt" className="block text-gray-400 mb-2 text-sm">Tu pregunta o tarea para Gemini:</label>
            <textarea
              id="gemini-prompt"
              className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-y"
              placeholder="Ej: 'Resume este párrafo...' o 'Dame ideas para mejorar mi enfoque durante el trabajo.'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            ></textarea>
          </div>

          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-gray-400 text-sm mr-2">Modelo:</span>
            <Button
              variant={selectedModel === GeminiModel.FLASH ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedModel(GeminiModel.FLASH)}
              className={`${selectedModel === GeminiModel.FLASH ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
            >
              Flash (Rápido)
            </Button>
            <Button
              variant={selectedModel === GeminiModel.PRO ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedModel(GeminiModel.PRO)}
              className={`${selectedModel === GeminiModel.PRO ? 'bg-fuchsia-600 hover:bg-fuchsia-700' : ''}`}
            >
              Pro (Complejo)
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Button
              onClick={() => handleGenerateContent(false)}
              variant="primary"
              className="flex-1"
              icon="fas fa-magic"
              disabled={loading}
            >
              {loading && !error ? 'Generando...' : 'Analizar / Editar'}
            </Button>
            <Button
              onClick={() => handleGenerateContent(true)}
              variant="secondary"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              icon="fas fa-brain"
              disabled={loading || selectedModel === GeminiModel.FLASH}
            >
              {loading && !error ? 'Pensando...' : 'Modo Pensamiento (Pro Only)'}
            </Button>
          </div>

          {loading && (
            <div className="text-blue-400 text-center flex items-center justify-center gap-2 mb-4">
              <i className="fas fa-spinner fa-spin"></i>
              Cargando respuesta...
            </div>
          )}

          {error && (
            <div className="bg-red-800 text-red-200 p-3 rounded-lg mb-4 text-sm">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
              {error.includes("API Key issue") && (
                <p className="mt-2 text-xs">Asegúrate de que tu clave de API sea válida y esté seleccionada correctamente. Consulta la documentación de facturación: <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline text-red-100 hover:text-white">ai.google.dev/gemini-api/docs/billing</a></p>
              )}
            </div>
          )}

          {response && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="font-bold mb-2 text-lg">Respuesta de Gemini:</h4>
              <p className="whitespace-pre-wrap text-gray-200">{response}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-700 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GeminiModal;