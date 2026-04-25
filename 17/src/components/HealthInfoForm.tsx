import React from 'react';
import { HealthInfo, ValidationErrors } from '../types';
import { useWizardStore } from '../store/useWizardStore';

interface HealthInfoFormProps {
  errors: ValidationErrors;
}

export const HealthInfoForm: React.FC<HealthInfoFormProps> = ({ errors }) => {
  const data = useWizardStore((state) => state.data);
  const updateHealthInfo = useWizardStore((state) => state.updateHealthInfo);

  const handleCheckboxChange = (field: keyof HealthInfo, checked: boolean) => {
    updateHealthInfo({ [field]: checked });
  };

  const handleTextChange = (field: keyof HealthInfo, value: string) => {
    updateHealthInfo({ [field]: value });
  };

  return (
    <div className="form-container">
      <h2>健康信息</h2>
      
      <div className="form-section">
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={data.healthInfo.hasMedicalInsurance}
              onChange={(e) => handleCheckboxChange('hasMedicalInsurance', e.target.checked)}
            />
            我有医疗保险
          </label>
        </div>

        {data.healthInfo.hasMedicalInsurance && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="insuranceProvider">保险公司名称 *</label>
              <input
                type="text"
                id="insuranceProvider"
                value={data.healthInfo.insuranceProvider}
                onChange={(e) => handleTextChange('insuranceProvider', e.target.value)}
                className={errors.insuranceProvider ? 'error' : ''}
              />
              {errors.insuranceProvider && <span className="error-message">{errors.insuranceProvider}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="insurancePolicyNumber">保险单号 *</label>
              <input
                type="text"
                id="insurancePolicyNumber"
                value={data.healthInfo.insurancePolicyNumber}
                onChange={(e) => handleTextChange('insurancePolicyNumber', e.target.value)}
                className={errors.insurancePolicyNumber ? 'error' : ''}
              />
              {errors.insurancePolicyNumber && <span className="error-message">{errors.insurancePolicyNumber}</span>}
            </div>
          </div>
        )}
      </div>

      <div className="form-section">
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={data.healthInfo.hasPreExistingConditions}
              onChange={(e) => handleCheckboxChange('hasPreExistingConditions', e.target.checked)}
            />
            我有既往病史
          </label>
        </div>

        {data.healthInfo.hasPreExistingConditions && (
          <div className="form-group">
            <label htmlFor="preExistingConditions">请说明既往病史 *</label>
            <textarea
              id="preExistingConditions"
              value={data.healthInfo.preExistingConditions}
              onChange={(e) => handleTextChange('preExistingConditions', e.target.value)}
              rows={3}
              placeholder="请详细描述您的既往病史"
              className={errors.preExistingConditions ? 'error' : ''}
            />
            {errors.preExistingConditions && <span className="error-message">{errors.preExistingConditions}</span>}
          </div>
        )}
      </div>

      <div className="form-section">
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={data.healthInfo.hasRecentTravelToHighRisk}
              onChange={(e) => handleCheckboxChange('hasRecentTravelToHighRisk', e.target.checked)}
            />
            近期曾前往疫情高风险国家/地区
          </label>
        </div>

        {data.healthInfo.hasRecentTravelToHighRisk && (
          <div className="form-group">
            <label htmlFor="highRiskCountries">请输入曾前往的高风险国家/地区 *</label>
            <input
              type="text"
              id="highRiskCountries"
              value={data.healthInfo.highRiskCountries}
              onChange={(e) => handleTextChange('highRiskCountries', e.target.value)}
              placeholder="例如：中国、韩国、日本等"
              className={errors.highRiskCountries ? 'error' : ''}
            />
            {errors.highRiskCountries && <span className="error-message">{errors.highRiskCountries}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
