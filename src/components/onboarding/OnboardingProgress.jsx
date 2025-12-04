import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, Circle, TrendingUp, X, ArrowRight, Sparkles, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import TutorialInterativo from './TutorialInterativo';

export default function OnboardingProgress({ userId }) {
  const [onboarding, setOnboarding] = useState(null);
  const [minimized, setMinimized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadOnboarding();
  }, [userId]);

  const loadOnboarding = async () => {
    try {
      const data = await base44.entities.UserOnboarding.filter({ user_id: userId });
      if (data && data.length > 0) {
        setOnboarding(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTutorial = () => {
    setShowTutorial(true);
    setMinimized(true); // Minimizar o card de progresso enquanto tutorial está aberto
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    setMinimized(false);
  };

  const handleCompleteTutorial = async () => {
    setShowTutorial(false);
    setMinimized(false);
    await loadOnboarding(); // Recarregar progresso
  };

  if (loading || !onboarding || onboarding.progresso_percentual >= 100) {
    return null;
  }

  const checklist = onboarding.checklist || {};
  const tasks = [
    { 
      key: 'loja_criada', 
      label: 'Criar sua loja', 
      completed: checklist.loja_criada,
      action: null // Já foi criada
    },
    { 
      key: 'primeiro_cupom_criado', 
      label: 'Criar primeiro cupom', 
      completed: checklist.primeiro_cupom_criado,
      action: () => navigate(createPageUrl('Cupons')),
      tutorialStep: 1
    },
    { 
      key: 'primeira_pesquisa_criada', 
      label: 'Criar primeira pesquisa', 
      completed: checklist.primeira_pesquisa_criada,
      action: () => navigate(createPageUrl('Pesquisas')),
      tutorialStep: 2
    },
    { 
      key: 'qr_code_baixado', 
      label: 'Baixar QR Code', 
      completed: checklist.qr_code_baixado,
      action: () => navigate(createPageUrl('Pesquisas')),
      tutorialStep: 3
    },
    { 
      key: 'primeiro_lead_capturado', 
      label: 'Capturar primeiro lead', 
      completed: checklist.primeiro_lead_capturado,
      action: null // Acontece automaticamente quando cliente responde
    },
  ];

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const progress = Math.round((completedTasks / totalTasks) * 100);

  if (minimized) {
    return (
      <>
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setMinimized(false)}
            className="neuro-button px-4 py-3 flex items-center gap-2 text-gray-700 font-medium shadow-lg hover:shadow-xl transition-all"
          >
            <TrendingUp className="w-5 h-5 text-blue-600" />
            {progress}% Completo
          </button>
        </div>
        {showTutorial && (
          <TutorialInterativo 
            currentStep={0}
            onClose={handleCloseTutorial}
            onComplete={handleCompleteTutorial}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 w-96">
        <div className="neuro-card p-6 border-2 border-blue-200 bg-white shadow-2xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Começando no Cupom.Moda</h3>
              <p className="text-sm text-gray-600">Complete os passos iniciais</p>
            </div>
            <button
              onClick={() => setMinimized(true)}
              className="neuro-button p-1 text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progresso</span>
              <span className="text-sm font-bold text-blue-600">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Tutorial Button - Destaque */}
          {progress < 100 && (
            <button
              onClick={handleStartTutorial}
              className="neuro-button pressed w-full p-4 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="neuro-button p-2 group-hover:animate-pulse">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-blue-900">Tutorial Interativo</p>
                    <p className="text-xs text-blue-700">Guia passo a passo completo</p>
                  </div>
                </div>
                <PlayCircle className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
            </button>
          )}

          {/* Checklist */}
          <div className="space-y-2">
            {tasks.map((task) => (
              <button
                key={task.key}
                onClick={task.action && !task.completed ? task.action : undefined}
                disabled={task.completed || !task.action}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  task.completed 
                    ? 'bg-green-50 border border-green-200' 
                    : task.action 
                      ? 'bg-gray-50 hover:bg-blue-50 hover:shadow-md cursor-pointer group border border-transparent hover:border-blue-200' 
                      : 'bg-gray-50 border border-gray-200'
                }`}
              >
                {task.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 group-hover:text-blue-500 transition-colors" />
                )}
                <span className={`text-sm flex-1 text-left ${
                  task.completed 
                    ? 'text-green-800 line-through' 
                    : 'text-gray-700 group-hover:text-blue-700 font-medium'
                }`}>
                  {task.label}
                </span>
                {!task.completed && task.action && (
                  <ArrowRight className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            ))}
          </div>

          {progress === 100 && (
            <div className="mt-4 p-3 bg-green-100 rounded-lg text-center border-2 border-green-200">
              <p className="text-green-800 font-semibold flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                🎉 Parabéns! Você completou o onboarding!
              </p>
            </div>
          )}

          {progress < 100 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 text-center">
                💡 <strong>Dica:</strong> Clique em "Tutorial Interativo" para uma experiência guiada completa!
              </p>
            </div>
          )}
        </div>
      </div>

      {showTutorial && (
        <TutorialInterativo 
          currentStep={0}
          onClose={handleCloseTutorial}
          onComplete={handleCompleteTutorial}
        />
      )}
    </>
  );
}