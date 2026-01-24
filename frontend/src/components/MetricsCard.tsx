import React from 'react';
import './MetricsCard.css';

interface MetricsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ title, value, subtitle, icon }) => {
  return (
    <div className="metrics-card">
      <div className="metrics-icon">{icon}</div>
      <div className="metrics-content">
        <h3>{title}</h3>
        <div className="metrics-value">{value}</div>
        <div className="metrics-subtitle">{subtitle}</div>
      </div>
    </div>
  );
};

export default MetricsCard;
