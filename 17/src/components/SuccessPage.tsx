import React from 'react';

interface SuccessPageProps {
  onReset: () => void;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({ onReset }) => {
  return (
    <div className="success-container">
      <div className="success-icon">✓</div>
      <h2>申请提交成功！</h2>
      <p className="success-message">
        您的签证申请已成功提交。我们将尽快处理您的申请，并通过电子邮件通知您审批结果。
      </p>
      <div className="success-info">
        <p><strong>申请编号：</strong>{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
        <p><strong>提交时间：</strong>{new Date().toLocaleString('zh-CN')}</p>
      </div>
      <button type="button" className="reset-btn" onClick={onReset}>
        开始新申请
      </button>
    </div>
  );
};
