import React from 'react';
import { useWizardStore } from '../store/useWizardStore';

interface ReviewPageProps {
  onEdit: (step: 'personal' | 'travel' | 'health') => void;
}

export const ReviewPage: React.FC<ReviewPageProps> = ({ onEdit }) => {
  const data = useWizardStore((state) => state.data);

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male': return '男';
      case 'female': return '女';
      case 'other': return '其他';
      default: return gender;
    }
  };

  const getVisaTypeLabel = (type: string) => {
    switch (type) {
      case 'tourist': return '旅游签证';
      case 'business': return '商务签证';
      case 'student': return '学生签证';
      default: return type;
    }
  };

  const getAccommodationLabel = (type: string) => {
    switch (type) {
      case 'hotel': return '酒店';
      case 'apartment': return '公寓';
      case 'friend_family': return '亲友家';
      case 'other': return '其他';
      default: return type;
    }
  };

  return (
    <div className="review-container">
      <h2>确认信息</h2>
      <p className="review-description">请仔细检查以下信息，确认无误后提交申请。</p>

      <div className="review-section">
        <div className="section-header">
          <h3>个人信息</h3>
          <button type="button" className="edit-btn" onClick={() => onEdit('personal')}>
            编辑
          </button>
        </div>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">姓名：</span>
            <span className="info-value">{data.personalInfo.lastName} {data.personalInfo.firstName}</span>
          </div>
          <div className="info-item">
            <span className="info-label">出生日期：</span>
            <span className="info-value">{data.personalInfo.dateOfBirth}</span>
          </div>
          <div className="info-item">
            <span className="info-label">性别：</span>
            <span className="info-value">{getGenderLabel(data.personalInfo.gender)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">国籍：</span>
            <span className="info-value">{data.personalInfo.nationality}</span>
          </div>
          <div className="info-item">
            <span className="info-label">护照号码：</span>
            <span className="info-value">{data.personalInfo.passportNumber}</span>
          </div>
          <div className="info-item">
            <span className="info-label">电子邮箱：</span>
            <span className="info-value">{data.personalInfo.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">联系电话：</span>
            <span className="info-value">{data.personalInfo.phone}</span>
          </div>
        </div>
      </div>

      <div className="review-section">
        <div className="section-header">
          <h3>旅行信息</h3>
          <button type="button" className="edit-btn" onClick={() => onEdit('travel')}>
            编辑
          </button>
        </div>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">签证类型：</span>
            <span className="info-value">{getVisaTypeLabel(data.travelInfo.visaType)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">访问目的：</span>
            <span className="info-value">{data.travelInfo.purposeOfVisit}</span>
          </div>
          <div className="info-item">
            <span className="info-label">计划到达日期：</span>
            <span className="info-value">{data.travelInfo.intendedArrivalDate}</span>
          </div>
          <div className="info-item">
            <span className="info-label">计划离开日期：</span>
            <span className="info-value">{data.travelInfo.intendedDepartureDate}</span>
          </div>
          <div className="info-item">
            <span className="info-label">住宿类型：</span>
            <span className="info-value">{getAccommodationLabel(data.travelInfo.accommodation)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">住宿地址：</span>
            <span className="info-value">{data.travelInfo.accommodationAddress}</span>
          </div>
        </div>
      </div>

      <div className="review-section">
        <div className="section-header">
          <h3>健康信息</h3>
          <button type="button" className="edit-btn" onClick={() => onEdit('health')}>
            编辑
          </button>
        </div>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">有医疗保险：</span>
            <span className="info-value">{data.healthInfo.hasMedicalInsurance ? '是' : '否'}</span>
          </div>
          {data.healthInfo.hasMedicalInsurance && (
            <>
              <div className="info-item">
                <span className="info-label">保险公司：</span>
                <span className="info-value">{data.healthInfo.insuranceProvider}</span>
              </div>
              <div className="info-item">
                <span className="info-label">保险单号：</span>
                <span className="info-value">{data.healthInfo.insurancePolicyNumber}</span>
              </div>
            </>
          )}
          <div className="info-item">
            <span className="info-label">有既往病史：</span>
            <span className="info-value">{data.healthInfo.hasPreExistingConditions ? '是' : '否'}</span>
          </div>
          {data.healthInfo.hasPreExistingConditions && (
            <div className="info-item full-width">
              <span className="info-label">既往病史说明：</span>
              <span className="info-value">{data.healthInfo.preExistingConditions}</span>
            </div>
          )}
          <div className="info-item">
            <span className="info-label">近期前往高风险地区：</span>
            <span className="info-value">{data.healthInfo.hasRecentTravelToHighRisk ? '是' : '否'}</span>
          </div>
          {data.healthInfo.hasRecentTravelToHighRisk && (
            <div className="info-item full-width">
              <span className="info-label">高风险国家/地区：</span>
              <span className="info-value">{data.healthInfo.highRiskCountries}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
