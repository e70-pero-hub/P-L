import React, { useContext, useState } from 'react';
import { GlobalContext } from './context/GlobalState';
import { formatMonthDisplay } from './utils/dateUtils';
import { Wallet, ArrowLeft, ArrowRight, Settings } from 'lucide-react';
import { parseISO, subMonths, addMonths, format } from 'date-fns';

import DashboardSummary from './components/DashboardSummary';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import BankReconciliation from './components/BankReconciliation';
import RecurringManager from './components/RecurringManager';

function App() {
  const { currentMonth, setCurrentMonth } = useContext(GlobalContext);
  const [showManager, setShowManager] = useState(false);

  const handlePrevMonth = () => {
    const date = parseISO(`${currentMonth}-01`);
    setCurrentMonth(format(subMonths(date, 1), 'yyyy-MM'));
  };

  const handleNextMonth = () => {
    const date = parseISO(`${currentMonth}-01`);
    setCurrentMonth(format(addMonths(date, 1), 'yyyy-MM'));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="glass-panel" style={{ borderRadius: 0, borderBottom: '1px solid var(--border-light)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="flex items-center gap-2">
          <Wallet size={28} className="text-primary" />
          <h1 style={{ fontSize: '1.25rem', margin: 0 }}>P&L Tracker</h1>
        </div>
        
        {/* Month Selector */}
        <div className="flex items-center gap-4">
          <button className="btn btn-outline" onClick={handlePrevMonth} style={{ padding: '0.25rem 0.5rem' }}>
            <ArrowLeft size={16} />
          </button>
          <span style={{ fontWeight: 600, minWidth: '120px', textAlign: 'center' }}>
            {formatMonthDisplay(currentMonth)}
          </span>
          <button className="btn btn-outline" onClick={handleNextMonth} style={{ padding: '0.25rem 0.5rem' }}>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Manager Toggle */}
        <button className="btn btn-outline" onClick={() => setShowManager(true)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Settings size={18} />
          Pretplate
        </button>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Top Row: Summary & Bank Reconciliation */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <DashboardSummary />
          <BankReconciliation />
        </div>

        {/* Bottom Row: Forms and List */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <TransactionForm />
          <TransactionList />
        </div>

      </main>

      {/* Modals */}
      {showManager && <RecurringManager onClose={() => setShowManager(false)} />}
    </div>
  );
}

export default App;
