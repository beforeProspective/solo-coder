export interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | '';
  nationality: string;
  passportNumber: string;
  email: string;
  phone: string;
}

export interface TravelInfo {
  visaType: 'tourist' | 'business' | 'student' | '';
  intendedArrivalDate: string;
  intendedDepartureDate: string;
  purposeOfVisit: string;
  accommodation: string;
  accommodationAddress: string;
}

export interface HealthInfo {
  hasMedicalInsurance: boolean;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  hasPreExistingConditions: boolean;
  preExistingConditions: string;
  hasRecentTravelToHighRisk: boolean;
  highRiskCountries: string;
}

export interface VisaApplicationData {
  personalInfo: PersonalInfo;
  travelInfo: TravelInfo;
  healthInfo: HealthInfo;
}

export interface ValidationErrors {
  [key: string]: string;
}

export type StepKey = 'personal' | 'travel' | 'health' | 'review' | 'submitted';

export const STEPS: StepKey[] = ['personal', 'travel', 'health', 'review'];

export const STEP_LABELS: Record<StepKey, string> = {
  personal: '个人信息',
  travel: '旅行信息',
  health: '健康信息',
  review: '确认提交',
  submitted: '提交成功',
};

export type WizardEvent =
  | { type: 'NEXT' }
  | { type: 'PREVIOUS' }
  | { type: 'GO_TO'; step: StepKey }
  | { type: 'SUBMIT' }
  | { type: 'VALIDATION_ERROR'; errors: ValidationErrors }
  | { type: 'VALIDATION_SUCCESS' }
  | { type: 'RESET' };
