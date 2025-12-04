import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

export default function GuidedTour({ tourId, steps, onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(true); // Sempre visível quando renderizado

  useEffect(() => {
    // O controle de visibilidade agora é feito pelo OnboardingManager
    // Este componente só é renderizado quando deve ser mostrado
    setVisible(true);
  }, [tourId]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setVisible(false);
    // O OnboardingManager salva o progresso na entidade UserOnboarding
    if (onComplete) onComplete();
  };

  const handleSkip = () => {
    setVisible(false);
    // O OnboardingManager salva o progresso na entidade UserOnboarding
    if (onSkip) onSkip();
  };

  if (!visible || !steps || steps.length === 0) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      {/* Overlay escuro */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[60]" onClick={handleSkip} />
      
      {/* Modal do tour */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-2xl px-4">
        <div className="neuro-card p-8 bg-white">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="neuro-button p-3">
                {step.icon || <CheckCircle className="w-6 h-6 text-blue-600" />}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{step.title}</h2>
                <p className="text-sm text-gray-500">
                  Passo {currentStep + 1} de {steps.length}
                </p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="neuro-button p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="mb-6">
            {step.image && (
              <img 
                src={step.image} 
                alt={step.title}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
            )}
            <p className="text-gray-700 leading-relaxed">{step.description}</p>
            
            {step.tips && step.tips.length > 0 && (
              <div className="mt-4 neuro-card p-4 bg-blue-50">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Dicas:</h4>
                <ul className="space-y-1">
                  {step.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Botões de navegação */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Pular tour
            </button>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="neuro-button px-4 py-2 text-gray-700 font-medium flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>
              )}
              
              <button
                onClick={handleNext}
                className="neuro-button pressed px-6 py-2 text-gray-800 font-medium flex items-center gap-2"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Finalizar
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}