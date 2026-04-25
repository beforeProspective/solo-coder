import React from 'react';
import { StepKey, STEPS, STEP_LABELS } from '../types';

interface StepIndicatorProps {
  currentStep: StepKey;
  visitedSteps: Set<StepKey>;
  onStepClick: (step: StepKey) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  visitedSteps,
  onStepClick,
}) => {
  const isClickable = (step: StepKey, index: number): boolean => {
    const currentIndex = STEPS.indexOf(currentStep);
    
    if (step === currentStep) return false;
    
    if (index < currentIndex && visitedSteps.has(step)) {
      return true;
    }
    
    return index === currentIndex + 1;
  };

  return (
    <div className="step-indicator">
      {STEPS.map((step, index) => {
        const isActive = step === currentStep;
        const isVisited = visitedSteps.has(step);
        const isCompleted = isVisited && index < STEPS.indexOf(currentStep);
        const clickable = isClickable(step, index);

        return (
          <React.Fragment key={step}>
            <div
              className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${clickable ? 'clickable' : ''}`}
              onClick={() => clickable && onStepClick(step)}
            >
              <div className="step-number">
                {isCompleted ? '✓' : index + 1}
              </div>
              <span className="step-label">{STEP_LABELS[step]}</span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`step-line ${index < STEPS.indexOf(currentStep) ? 'completed' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
