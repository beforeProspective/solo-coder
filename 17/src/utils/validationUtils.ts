import { PersonalInfo, TravelInfo, HealthInfo, ValidationErrors } from '../types';

const isEmpty = (value: string | undefined | null): boolean => {
  return value === undefined || value === null || value.trim() === '';
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

export const validatePersonalInfo = (info: PersonalInfo): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (isEmpty(info.firstName)) {
    errors.firstName = '请输入名字';
  }

  if (isEmpty(info.lastName)) {
    errors.lastName = '请输入姓氏';
  }

  if (isEmpty(info.dateOfBirth)) {
    errors.dateOfBirth = '请选择出生日期';
  } else if (!isValidDate(info.dateOfBirth)) {
    errors.dateOfBirth = '请输入有效的日期';
  }

  if (isEmpty(info.gender)) {
    errors.gender = '请选择性别';
  }

  if (isEmpty(info.nationality)) {
    errors.nationality = '请输入国籍';
  }

  if (isEmpty(info.passportNumber)) {
    errors.passportNumber = '请输入护照号码';
  }

  if (isEmpty(info.email)) {
    errors.email = '请输入邮箱地址';
  } else if (!isValidEmail(info.email)) {
    errors.email = '请输入有效的邮箱地址';
  }

  if (isEmpty(info.phone)) {
    errors.phone = '请输入电话号码';
  }

  return errors;
};

export const validateTravelInfo = (info: TravelInfo): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (isEmpty(info.visaType)) {
    errors.visaType = '请选择签证类型';
  }

  if (isEmpty(info.intendedArrivalDate)) {
    errors.intendedArrivalDate = '请选择计划到达日期';
  }

  if (isEmpty(info.intendedDepartureDate)) {
    errors.intendedDepartureDate = '请选择计划离开日期';
  }

  if (info.intendedArrivalDate && info.intendedDepartureDate) {
    const arrival = new Date(info.intendedArrivalDate);
    const departure = new Date(info.intendedDepartureDate);
    if (departure <= arrival) {
      errors.intendedDepartureDate = '离开日期必须晚于到达日期';
    }
  }

  if (isEmpty(info.purposeOfVisit)) {
    errors.purposeOfVisit = '请输入访问目的';
  }

  if (isEmpty(info.accommodation)) {
    errors.accommodation = '请选择住宿类型';
  }

  if (isEmpty(info.accommodationAddress)) {
    errors.accommodationAddress = '请输入住宿地址';
  }

  return errors;
};

export const validateHealthInfo = (info: HealthInfo): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (info.hasMedicalInsurance) {
    if (isEmpty(info.insuranceProvider)) {
      errors.insuranceProvider = '请输入保险公司名称';
    }
    if (isEmpty(info.insurancePolicyNumber)) {
      errors.insurancePolicyNumber = '请输入保险单号';
    }
  }

  if (info.hasPreExistingConditions && isEmpty(info.preExistingConditions)) {
    errors.preExistingConditions = '请说明既往病史';
  }

  if (info.hasRecentTravelToHighRisk && isEmpty(info.highRiskCountries)) {
    errors.highRiskCountries = '请输入曾前往的高风险国家/地区';
  }

  return errors;
};

export const hasErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};
