import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SalesDataPoint } from '../types';

interface SalesChartProps {
  data: SalesDataPoint[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis />
        <Tooltip 
          formatter={(value: number) => `$${value.toFixed(2)}`}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="total_sales" 
          stroke="#667eea" 
          strokeWidth={2}
          name="Total Sales"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SalesChart;
