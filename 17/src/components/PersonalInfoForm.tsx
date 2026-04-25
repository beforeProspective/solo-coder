import React from 'react';
import { PersonalInfo, ValidationErrors } from '../types';
import { useWizardStore } from '../store/useWizardStore';

interface PersonalInfoFormProps {
  errors: ValidationErrors;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ errors }) => {
  const data = useWizardStore((state) => state.data);
  const updatePersonalInfo = useWizardStore((state) => state.updatePersonalInfo);

  const handleChange = (field: keyof PersonalInfo, value: string) => {
    updatePersonalInfo({ [field]: value });
  };

  return (
    <div className="form-container">
      <h2>个人信息</h2>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">名字 *</label>
          <input
            type="text"
            id="firstName"
            value={data.personalInfo.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className={errors.firstName ? 'error' : ''}
          />
          {errors.firstName && <span className="error-message">{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="lastName">姓氏 *</label>
          <input
            type="text"
            id="lastName"
            value={data.personalInfo.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className={errors.lastName ? 'error' : ''}
          />
          {errors.lastName && <span className="error-message">{errors.lastName}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="dateOfBirth">出生日期 *</label>
          <input
            type="date"
            id="dateOfBirth"
            value={data.personalInfo.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            className={errors.dateOfBirth ? 'error' : ''}
          />
          {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
        </div>

        <div className="form-group">
          <label>性别 *</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="gender"
                value="male"
                checked={data.personalInfo.gender === 'male'}
                onChange={() => handleChange('gender', 'male')}
              />
              男
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="female"
                checked={data.personalInfo.gender === 'female'}
                onChange={() => handleChange('gender', 'female')}
              />
              女
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="other"
                checked={data.personalInfo.gender === 'other'}
                onChange={() => handleChange('gender', 'other')}
              />
              其他
            </label>
          </div>
          {errors.gender && <span className="error-message">{errors.gender}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="nationality">国籍 *</label>
          <input
            type="text"
            id="nationality"
            value={data.personalInfo.nationality}
            onChange={(e) => handleChange('nationality', e.target.value)}
            className={errors.nationality ? 'error' : ''}
          />
          {errors.nationality && <span className="error-message">{errors.nationality}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="passportNumber">护照号码 *</label>
          <input
            type="text"
            id="passportNumber"
            value={data.personalInfo.passportNumber}
            onChange={(e) => handleChange('passportNumber', e.target.value)}
            className={errors.passportNumber ? 'error' : ''}
          />
          {errors.passportNumber && <span className="error-message">{errors.passportNumber}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="email">电子邮箱 *</label>
          <input
            type="email"
            id="email"
            value={data.personalInfo.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="phone">联系电话 *</label>
          <input
            type="tel"
            id="phone"
            value={data.personalInfo.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={errors.phone ? 'error' : ''}
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>
      </div>
    </div>
  );
};
