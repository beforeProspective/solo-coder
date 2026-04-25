import React from 'react';
import { useActor } from '@xstate/react';
import {
  PersonalInfoForm,
  TravelInfoForm,
  HealthInfoForm,
  ReviewPage,
  SuccessPage,
  StepIndicator,
  NavigationButtons,
} from './components';
import { useWizardStore } from './store/useWizardStore';
import { createWizardMachine, getPreviousStep } from './machine/wizardMachine';
import {
  validatePersonalInfo,
  validateTravelInfo,
  validateHealthInfo,
  hasErrors,
} from './utils/validationUtils';
import { StepKey, WizardEvent, STEPS } from './types';

const App: React.FC = () => {
  const storedStep = useWizardStore((state) => state.currentStep);
  const data = useWizardStore((state) => state.data);
  const validationErrors = useWizardStore((state) => state.validationErrors);
  const visitedSteps = useWizardStore((state) => state.visitedSteps);
  const setCurrentStep = useWizardStore((state) => state.setCurrentStep);
  const setValidationErrors = useWizardStore((state) => state.setValidationErrors);
  const clearValidationErrors = useWizardStore((state) => state.clearValidationErrors);
  const markStepVisited = useWizardStore((state) => state.markStepVisited);
  const reset = useWizardStore((state) => state.reset);

  const initialStepRef = React.useRef(storedStep);
  
  const machine = React.useMemo(() => {
    return createWizardMachine(initialStepRef.current);
  }, []);

  const [snapshot, send] = useActor(machine);
  const currentStep = snapshot.value as StepKey;

  const prevStepRef = React.useRef<StepKey>(initialStepRef.current);

  React.useEffect(() => {
    if (currentStep !== prevStepRef.current) {
      prevStepRef.current = currentStep;
      setCurrentStep(currentStep);
    }
  }, [currentStep, setCurrentStep]);

  const validateCurrentStep = (): boolean => {
    let errors: Record<string, string> = {};

    switch (currentStep) {
      case 'personal':
        errors = validatePersonalInfo(data.personalInfo);
        break;
      case 'travel':
        errors = validateTravelInfo(data.travelInfo);
        break;
      case 'health':
        errors = validateHealthInfo(data.healthInfo);
        break;
      case 'review':
      case 'submitted':
        return true;
    }

    if (hasErrors(errors)) {
      send({ type: 'VALIDATION_ERROR', errors } as WizardEvent);
      setValidationErrors(errors);
      return false;
    }

    send({ type: 'VALIDATION_SUCCESS' } as WizardEvent);
    clearValidationErrors();
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      markStepVisited(currentStep);
      send({ type: 'NEXT' } as WizardEvent);
    }
  };

  const handlePrevious = () => {
    const prevStep = getPreviousStep(currentStep);
    if (prevStep) {
      send({ type: 'PREVIOUS' } as WizardEvent);
    }
  };

  const handleGoTo = (step: StepKey) => {
    if (step === currentStep) return;
    
    if (step === 'submitted' || step === 'review') {
      return;
    }

    const currentIndex = STEPS.indexOf(currentStep);
    const targetIndex = STEPS.indexOf(step);

    if (targetIndex > currentIndex) {
      if (validateCurrentStep()) {
        markStepVisited(currentStep);
        send({ type: 'GO_TO', step } as WizardEvent);
      }
    } else {
      send({ type: 'GO_TO', step } as WizardEvent);
    }
  };

  const handleSubmit = () => {
    send({ type: 'SUBMIT' } as WizardEvent);
  };

  const handleReset = () => {
    reset();
    send({ type: 'RESET' } as WizardEvent);
  };

  const handleEdit = (step: 'personal' | 'travel' | 'health') => {
    send({ type: 'GO_TO', step } as WizardEvent);
  };

  const canGoBack = currentStep !== 'personal' && currentStep !== 'submitted';
  const canGoForward = currentStep !== 'review' && currentStep !== 'submitted';

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'personal':
        return <PersonalInfoForm errors={validationErrors} />;
      case 'travel':
        return <TravelInfoForm errors={validationErrors} />;
      case 'health':
        return <HealthInfoForm errors={validationErrors} />;
      case 'review':
        return <ReviewPage onEdit={handleEdit} />;
      case 'submitted':
        return <SuccessPage onReset={handleReset} />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>签证申请向导</h1>
        <p>请按步骤填写您的签证申请信息</p>
      </header>

      {currentStep !== 'submitted' && (
        <StepIndicator
          currentStep={currentStep}
          visitedSteps={visitedSteps}
          onStepClick={handleGoTo}
        />
      )}

      <main className="app-main">
        {renderCurrentStep()}
      </main>

      {currentStep !== 'submitted' && (
        <footer className="app-footer">
          <NavigationButtons
            currentStep={currentStep}
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            onBack={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSubmit}
          />
        </footer>
      )}
    </div>
  );
};

export default App;
