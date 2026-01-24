import React from 'react';
import { format, subDays } from 'date-fns';
import { Filters } from '../types';
import './FilterPanel.css';

interface FilterPanelProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, setFilters }) => {
  const handleDateRangeChange = (range: string) => {
    const endDate = format(new Date(), 'yyyy-MM-dd');
    let startDate: string;

    switch (range) {
      case '7days':
        startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
        break;
      case '30days':
        startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
        break;
      case '90days':
        startDate = format(subDays(new Date(), 90), 'yyyy-MM-dd');
        break;
      default:
        startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    }

    setFilters({
      ...filters,
      dateRange: { startDate, endDate },
    });
  };

  const handleGroupByChange = (groupBy: 'day' | 'week' | 'month') => {
    setFilters({
      ...filters,
      groupBy,
    });
  };

  return (
    <div className="filter-panel">
      <div className="filter-group">
        <label>Time Period:</label>
        <div className="button-group">
          <button 
            onClick={() => handleDateRangeChange('7days')}
            className="filter-button"
          >
            Last 7 Days
          </button>
          <button 
            onClick={() => handleDateRangeChange('30days')}
            className="filter-button active"
          >
            Last 30 Days
          </button>
          <button 
            onClick={() => handleDateRangeChange('90days')}
            className="filter-button"
          >
            Last 90 Days
          </button>
        </div>
      </div>

      <div className="filter-group">
        <label>Group By:</label>
        <div className="button-group">
          <button 
            onClick={() => handleGroupByChange('day')}
            className={`filter-button ${filters.groupBy === 'day' ? 'active' : ''}`}
          >
            Day
          </button>
          <button 
            onClick={() => handleGroupByChange('week')}
            className={`filter-button ${filters.groupBy === 'week' ? 'active' : ''}`}
          >
            Week
          </button>
          <button 
            onClick={() => handleGroupByChange('month')}
            className={`filter-button ${filters.groupBy === 'month' ? 'active' : ''}`}
          >
            Month
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
