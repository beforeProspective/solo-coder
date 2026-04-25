import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  VisaApplicationData,
  PersonalInfo,
  TravelInfo,
  HealthInfo,
  StepKey,
  ValidationErrors,
} from '../types';

interface WizardState {
  currentStep: StepKey;
  data: VisaApplicationData;
  validationErrors: ValidationErrors;
  visitedSteps: Set<StepKey>;
  setCurrentStep: (step: StepKey) => void;
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  updateTravelInfo: (info: Partial<TravelInfo>) => void;
  updateHealthInfo: (info: Partial<HealthInfo>) => void;
  setValidationErrors: (errors: ValidationErrors) => void;
  clearValidationErrors: () => void;
  markStepVisited: (step: StepKey) => void;
  reset: () => void;
}

const initialData: VisaApplicationData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    passportNumber: '',
    email: '',
    phone: '',
  },
  travelInfo: {
    visaType: '',
    intendedArrivalDate: '',
    intendedDepartureDate: '',
    purposeOfVisit: '',
    accommodation: '',
    accommodationAddress: '',
  },
  healthInfo: {
    hasMedicalInsurance: false,
    insuranceProvider: '',
    insurancePolicyNumber: '',
    hasPreExistingConditions: false,
    preExistingConditions: '',
    hasRecentTravelToHighRisk: false,
    highRiskCountries: '',
  },
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      currentStep: 'personal',
      data: initialData,
      validationErrors: {},
      visitedSteps: new Set<StepKey>(),
      
      setCurrentStep: (step) => set({ currentStep: step }),
      
      updatePersonalInfo: (info) =>
        set((state) => ({
          data: {
            ...state.data,
            personalInfo: { ...state.data.personalInfo, ...info },
          },
        })),
      
      updateTravelInfo: (info) =>
        set((state) => ({
          data: {
            ...state.data,
            travelInfo: { ...state.data.travelInfo, ...info },
          },
        })),
      
      updateHealthInfo: (info) =>
        set((state) => ({
          data: {
            ...state.data,
            healthInfo: { ...state.data.healthInfo, ...info },
          },
        })),
      
      setValidationErrors: (errors) => set({ validationErrors: errors }),
      
      clearValidationErrors: () => set({ validationErrors: {} }),
      
      markStepVisited: (step) =>
        set((state) => ({
          visitedSteps: new Set([...state.visitedSteps, step]),
        })),
      
      reset: () =>
        set({
          currentStep: 'personal',
          data: initialData,
          validationErrors: {},
          visitedSteps: new Set<StepKey>(),
        }),
    }),
    {
      name: 'visa-application-draft',
      partialize: (state) => ({
        currentStep: state.currentStep,
        data: state.data,
        visitedSteps: Array.from(state.visitedSteps),
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<WizardState> & { visitedSteps?: unknown };
        let visitedSteps = currentState.visitedSteps;
        
        if (persisted.visitedSteps !== undefined) {
          if (Array.isArray(persisted.visitedSteps)) {
            visitedSteps = new Set(persisted.visitedSteps as StepKey[]);
          } else if (persisted.visitedSteps instanceof Set) {
            visitedSteps = persisted.visitedSteps;
          }
        }
        
        return {
          ...currentState,
          ...persisted,
          visitedSteps,
        };
      },
    }
  )
);
