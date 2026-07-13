export const STEPS = [
  { id: 1, label: 'Ingressos', icon: '🎫' },
  { id: 2, label: 'Adicionais', icon: '✨' },
  { id: 3, label: 'Seus Dados', icon: '👤' },
  { id: 4, label: 'Pagamento', icon: '💳' },
  { id: 5, label: 'Confirmação', icon: '✅' },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div id="step-indicator" data-cy="step-indicator" className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress bar background */}
        <div className="absolute top-4 sm:top-5 left-0 right-0 h-0.5 bg-purple-900/50 z-0" />
        {/* Progress bar fill */}
        <div
          id="step-progress-bar"
          data-cy="step-progress-bar"
          className="absolute top-4 sm:top-5 left-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step) => {
          const isDone = step.id < currentStep;
          const isActive = step.id === currentStep;

          return (
            <div
              key={step.id}
              id={`step-${step.id}`}
              data-cy={`step-${step.id}`}
              data-step-active={isActive}
              data-step-done={isDone}
              className="flex flex-col items-center gap-2 relative z-10"
            >
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg transition-all duration-300 border-2 ${
                  isDone
                    ? 'bg-purple-600 border-purple-600 shadow-lg shadow-purple-900/50'
                    : isActive
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-pink-500 shadow-lg shadow-purple-900/50 scale-110'
                    : 'bg-[#1a1a2e] border-purple-900/50 opacity-50'
                }`}
              >
                {isDone ? '✓' : step.icon}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block transition-colors ${
                  isActive ? 'text-purple-300' : isDone ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
