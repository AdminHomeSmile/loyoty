import { useState } from 'react';
import Dashboard from './components/Dashboard';
import TechnicianRewards from './components/TechnicianRewards';
import { format, subDays } from 'date-fns';
import { Filters } from './types';
import './App.css';

type AppView = 'analytics' | 'technicianRewards';

function App() {
  const [activeView, setActiveView] = useState<AppView>('analytics');
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
        <h1>Loyalty Rewards Hub</h1>
        <p>ระบบวิเคราะห์ยอดขาย + ระบบช่างสะสมคะแนน</p>
      </header>

      <div className="app-tabs">
        <button
          className={activeView === 'analytics' ? 'active' : ''}
          onClick={() => setActiveView('analytics')}
        >
          Analytics Dashboard
        </button>
        <button
          className={activeView === 'technicianRewards' ? 'active' : ''}
          onClick={() => setActiveView('technicianRewards')}
        >
          Technician Rewards
        </button>
      </div>

      {activeView === 'analytics' ? (
        <Dashboard filters={filters} setFilters={setFilters} />
      ) : (
        <TechnicianRewards />
      )}
    </div>
  );
}

export default App;
