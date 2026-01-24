import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CustomerSegment } from '../types';

interface CustomerSegmentChartProps {
  data: CustomerSegment[];
}

const CustomerSegmentChart: React.FC<CustomerSegmentChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="segment" />
        <YAxis />
        <Tooltip 
          formatter={(value: number, name: string) => {
            if (name.includes('revenue') || name.includes('value')) {
              return `$${value.toFixed(2)}`;
            }
            return value;
          }}
        />
        <Legend />
        <Bar dataKey="customer_count" fill="#667eea" name="Customers" />
        <Bar dataKey="total_revenue" fill="#764ba2" name="Revenue" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CustomerSegmentChart;
