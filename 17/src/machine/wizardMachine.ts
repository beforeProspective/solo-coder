import { createMachine, assign } from 'xstate';
import { StepKey, STEPS, ValidationErrors } from '../types';

const getNextStep = (current: StepKey): StepKey | undefined => {
  const index = STEPS.indexOf(current);
  if (index < STEPS.length - 1) {
    return STEPS[index + 1];
  }
  return undefined;
};

const getPreviousStep = (current: StepKey): StepKey | undefined => {
  const index = STEPS.indexOf(current);
  if (index > 0) {
    return STEPS[index - 1];
  }
  return undefined;
};

const isStepAccessible = (target: StepKey, current: StepKey, visitedSteps: Set<StepKey>): boolean => {
  if (target === current) return true;
  
  const currentIndex = STEPS.indexOf(current);
  const targetIndex = STEPS.indexOf(target);
  
  if (targetIndex < currentIndex) {
    return visitedSteps.has(target);
  }
  
  return targetIndex === currentIndex + 1;
};

interface WizardContext {
  currentStep: StepKey;
  validationErrors: ValidationErrors;
}

export const createWizardMachine = (initialStep: StepKey) => {
  return createMachine({
    id: 'visaWizard',
    initial: initialStep as any,
    context: {
      currentStep: initialStep,
      validationErrors: {},
    } as WizardContext,
    states: {
      personal: {
        on: {
          NEXT: {
            actions: assign({ currentStep: () => 'travel' as StepKey }),
            target: 'travel',
          },
          GO_TO: [
            {
              target: 'personal',
              actions: assign({
                currentStep: ({ event }: any) => event.type === 'GO_TO' ? event.step : 'personal',
              }),
              guard: ({ event }: any) => event.type === 'GO_TO' && event.step === 'personal',
            },
            {
              target: 'travel',
              actions: assign({
                currentStep: ({ event }: any) => event.type === 'GO_TO' ? event.step : 'travel',
              }),
              guard: ({ event }: any) => event.type === 'GO_TO' && event.step === 'travel',
            },
            {
              target: 'health',
              actions: assign({
                currentStep: ({ event }: any) => event.type === 'GO_TO' ? event.step : 'health',
              }),
              guard: ({ event }: any) => event.type === 'GO_TO' && event.step === 'health',
            },
            {
              target: 'review',
              actions: assign({
                currentStep: ({ event }: any) => event.type === 'GO_TO' ? event.step : 'review',
              }),
              guard: ({ event }: any) => event.type === 'GO_TO' && event.step === 'review',
            },
          ],
          VALIDATION_ERROR: {
            actions: assign({
              validationErrors: ({ event }: any) =>
                event.type === 'VALIDATION_ERROR' ? event.errors : {},
            }),
          },
          VALIDATION_SUCCESS: {
            actions: assign({ validationErrors: () => ({}) }),
          },
        },
      },
      travel: {
        on: {
          NEXT: {
            actions: assign({ currentStep: () => 'health' as StepKey }),
            target: 'health',
          },
          PREVIOUS: {
            actions: assign({ currentStep: () => 'personal' as StepKey }),
            target: 'personal',
          },
          GO_TO: [
            {
              target: 'personal',
              actions: assign({
                currentStep: ({ event }: any) => event.type === 'GO_TO' ? event.step : 'personal',
              }),
              guard: ({ event }: any) => event.type === 'GO_TO' && event.step === 'personal',
            },
            {
              target: 'travel',
              actions: assign({
                currentStep: ({ event }: any) => event.type === 'GO_TO' ? event.step : 'travel',
              }),
              guard: ({ event }: any) => event.type === 'GO_TO' && event.step === 'travel',
            },
            {
              target: 'health',
              actions: assign({
                currentStep: ({ event }: any) => event.type === 'GO_TO' ? event.step : 'health',
              }),
              guard: ({ event }: any) => event.type === 'GO_TO' && event.step === 'health',
            },
            {
              target: 'review',
              actions: assign({
                currentStep: ({ event }: any) => event.type === 'GO_TO' ? event.step : 'review',
              }),
              guard: ({ event }: any) => event.type === 'GO_TO' && event.step === 'review',
            },
          ],
          VALIDATION_ERROR: {
            actions: assign({
              validationErrors: ({ event }: any) =>
                event.type === 'VALIDATION_ERROR' ? event.errors : {},
            }),
          },
          VALIDATION_SUCCESS: {
            actions: assign({ validationErrors: () => ({}) }),
          },
        },
      },
      health: {
        on: {
          NEXT: {
            actions: assign({ currentStep: () => 'review' as StepKey }),
            target: 'review',
          },
          PREVIOUS: {
            actions: assign({ currentStep: () => 'travel' as StepKey }),
            target: 'travel',
          },
          GO_TO: [
            {
              target: 'personal',
              actions: assign({
                currentStep: ({ event }: any) => event.type === 'GO_TO' ? event.step : 'personal',
              }),
              guard: ({ event }: any) => event.type === 'GO_TO' && event.step === 'personal',
            },
            {
              target: 'travel',
              actions: assign({
                currentStep: ({ event }: any) => event.type === 'GO_TO' ? event.step : 'travel',
              }),
              guard: ({ event }: any) => event.type === 'GO_TO' && event.step === 'travel',
            },
            {
              target: 'health',
              actions: assign({
                currentStep: ({ event }: any) => event.type === 'GO_TO' ? event.step : 'health',
              }),
              guard: ({ event }: any) => event.type === 'GO_TO' && event.step === 'health',
            },
            {
              target: 'review',
              actions: assign({
                currentStep: ({ event }: any) => event.type === 'GO_TO' ? event.step : 'review',
              }),
              guard: ({ event }: any) => event.type === 'GO_TO' && event.step === 'review',
            },
          ],
          VALIDATION_ERROR: {
            actions: assign({
              validationErrors: ({ event }: any) =>
                event.type === 'VALIDATION_ERROR' ? event.errors : {},
            }),
          },
          VALIDATION_SUCCESS: {
            actions: assign({ validationErrors: () => ({}) }),
          },
        },
      },
      review: {
        on: {
          PREVIOUS: {
            actions: assign({ currentStep: () => 'health' as StepKey }),
            target: 'health',
          },
          SUBMIT: {
            target: 'submitted',
            actions: assign({ currentStep: () => 'submitted' as StepKey }),
          },
          GO_TO: [
            {
              target: 'personal',
              actions: assign({
                currentStep: ({ event }: any) => event.type === 'GO_TO' ? event.step : 'personal',
              }),
              guard: ({ event }: any) => event.type === 'GO_TO' && event.step === 'personal',
            },
            {
              target: 'travel',
              actions: assign({
                currentStep: ({ event }: any) => event.type === 'GO_TO' ? event.step : 'travel',
              }),
              guard: ({ event }: any) => event.type === 'GO_TO' && event.step === 'travel',
            },
            {
              target: 'health',
              actions: assign({
                currentStep: ({ event }: any) => event.type === 'GO_TO' ? event.step : 'health',
              }),
              guard: ({ event }: any) => event.type === 'GO_TO' && event.step === 'health',
            },
            {
              target: 'review',
              actions: assign({
                currentStep: ({ event }: any) => event.type === 'GO_TO' ? event.step : 'review',
              }),
              guard: ({ event }: any) => event.type === 'GO_TO' && event.step === 'review',
            },
          ],
        },
      },
      submitted: {
        on: {
          RESET: {
            target: 'personal',
            actions: assign({
              currentStep: () => 'personal' as StepKey,
              validationErrors: () => ({}),
            }),
          },
        },
      },
    },
  });
};

export { getNextStep, getPreviousStep, isStepAccessible };
