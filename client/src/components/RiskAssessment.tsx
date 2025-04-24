
import React from 'react';
import { Progress, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { Customer } from './Dashboard';

const RiskAssessment = {
  calculateRiskScore(customer: Customer): number {
    const { creditScore, loanRepaymentHistory, outstandingLoans, monthlyIncome } = customer;

    const repaymentRatio = loanRepaymentHistory.length
      ? loanRepaymentHistory.filter(p => p === 1).length / loanRepaymentHistory.length
      : 0;

    const loanToIncomeRatio = monthlyIncome > 0 ? outstandingLoans / monthlyIncome : 1;

    // Risk score out of 100
    let score = (creditScore / 850) * 50 + repaymentRatio * 30 + (1 - loanToIncomeRatio) * 20;

    // Clamp to 0–100
    score = Math.max(0, Math.min(100, score));

    return Math.round(score * 100) / 100;
  },

  getRiskColor(score: number): string {
    if (score > 70) return '#ff4d4f'; // High Risk - Red
    if (score > 40) return '#faad14'; // Medium Risk - Orange
    return '#52c41a'; // Low Risk - Green
  },

  getRiskColumn(): ColumnsType<Customer>[number] {
    return {
      title: 'Risk Score',
      key: 'riskScore',
      render: (_, record) => {
        const score = RiskAssessment.calculateRiskScore(record);
        const color = RiskAssessment.getRiskColor(score);

        return (
          <div>
            <Progress percent={score} showInfo={false} strokeColor={color} />
            <Tag color={color} style={{ marginTop: 4 }}>
              {score > 70 ? 'High Risk' : score > 40 ? 'Medium Risk' : 'Low Risk'}
            </Tag>
          </div>
        );
      },
    };
  },
};

export default RiskAssessment;

