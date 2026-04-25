import React from 'react';
import { StepKey } from '../types';

interface NavigationButtonsProps {
  currentStep: StepKey;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  canGoBack,
  canGoForward,
  onBack,
  onNext,
  onSubmit,
}) => {
  const isReviewStep = currentStep === 'review';

  return (
    <div className="navigation-buttons">
      {canGoBack && (
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onBack}
        >
          上一步
        </button>
      )}
      <div style={{ flex: 1 }} />
      {!isReviewStep && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={onNext}
          disabled={!canGoForward}
        >
          下一步
        </button>
      )}
      {isReviewStep && (
        <button
          type="button"
          className="btn btn-primary btn-submit"
          onClick={onSubmit}
        >
          提交申请
        </button>
      )}
    </div>
  );
};
