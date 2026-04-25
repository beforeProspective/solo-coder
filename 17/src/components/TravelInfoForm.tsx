import React from 'react';
import { TravelInfo, ValidationErrors } from '../types';
import { useWizardStore } from '../store/useWizardStore';

interface TravelInfoFormProps {
  errors: ValidationErrors;
}

export const TravelInfoForm: React.FC<TravelInfoFormProps> = ({ errors }) => {
  const data = useWizardStore((state) => state.data);
  const updateTravelInfo = useWizardStore((state) => state.updateTravelInfo);

  const handleChange = (field: keyof TravelInfo, value: string) => {
    updateTravelInfo({ [field]: value });
  };

  return (
    <div className="form-container">
      <h2>旅行信息</h2>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="visaType">签证类型 *</label>
          <select
            id="visaType"
            value={data.travelInfo.visaType}
            onChange={(e) => handleChange('visaType', e.target.value)}
            className={errors.visaType ? 'error' : ''}
          >
            <option value="">请选择签证类型</option>
            <option value="tourist">旅游签证</option>
            <option value="business">商务签证</option>
            <option value="student">学生签证</option>
          </select>
          {errors.visaType && <span className="error-message">{errors.visaType}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="purposeOfVisit">访问目的 *</label>
          <input
            type="text"
            id="purposeOfVisit"
            value={data.travelInfo.purposeOfVisit}
            onChange={(e) => handleChange('purposeOfVisit', e.target.value)}
            placeholder="例如：旅游、商务洽谈、探亲等"
            className={errors.purposeOfVisit ? 'error' : ''}
          />
          {errors.purposeOfVisit && <span className="error-message">{errors.purposeOfVisit}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="intendedArrivalDate">计划到达日期 *</label>
          <input
            type="date"
            id="intendedArrivalDate"
            value={data.travelInfo.intendedArrivalDate}
            onChange={(e) => handleChange('intendedArrivalDate', e.target.value)}
            className={errors.intendedArrivalDate ? 'error' : ''}
          />
          {errors.intendedArrivalDate && <span className="error-message">{errors.intendedArrivalDate}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="intendedDepartureDate">计划离开日期 *</label>
          <input
            type="date"
            id="intendedDepartureDate"
            value={data.travelInfo.intendedDepartureDate}
            onChange={(e) => handleChange('intendedDepartureDate', e.target.value)}
            className={errors.intendedDepartureDate ? 'error' : ''}
          />
          {errors.intendedDepartureDate && <span className="error-message">{errors.intendedDepartureDate}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="accommodation">住宿类型 *</label>
          <select
            id="accommodation"
            value={data.travelInfo.accommodation}
            onChange={(e) => handleChange('accommodation', e.target.value)}
            className={errors.accommodation ? 'error' : ''}
          >
            <option value="">请选择住宿类型</option>
            <option value="hotel">酒店</option>
            <option value="apartment">公寓</option>
            <option value="friend_family">亲友家</option>
            <option value="other">其他</option>
          </select>
          {errors.accommodation && <span className="error-message">{errors.accommodation}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="accommodationAddress">住宿地址 *</label>
          <input
            type="text"
            id="accommodationAddress"
            value={data.travelInfo.accommodationAddress}
            onChange={(e) => handleChange('accommodationAddress', e.target.value)}
            placeholder="请输入详细地址"
            className={errors.accommodationAddress ? 'error' : ''}
          />
          {errors.accommodationAddress && <span className="error-message">{errors.accommodationAddress}</span>}
        </div>
      </div>
    </div>
  );
};
