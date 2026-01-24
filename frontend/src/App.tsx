import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import { format, subDays } from 'date-fns';
import { Filters } from './types';
import './App.css';

function App() {
  const [filters, setFilters] = useState<Filters>({
    dateRange: {
      startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
    },
    groupBy: 'day',
  });

  return (
    <div className="App">
      <header className="app-header">
        <h1>Loyalty Rewards Hub - Analytics Dashboard</h1>
        <p>Business Performance Tracking</p>
      </header>
      <Dashboard filters={filters} setFilters={setFilters} />
    </div>
  );
}

export default App;
