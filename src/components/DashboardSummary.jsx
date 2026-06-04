import React, { useContext, useMemo } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { filterTransactionsByMonth } from '../utils/dateUtils';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

const DashboardSummary = () => {
  const { transactions, currentMonth } = useContext(GlobalContext);

  const monthTransactions = useMemo(() => {
    return filterTransactionsByMonth(transactions, currentMonth);
  }, [transactions, currentMonth]);

  const { totalIncome, totalExpense } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    monthTransactions.forEach(t => {
      if (t.type === 'INCOME') inc += t.amount;
      if (t.type === 'EXPENSE') exp += t.amount;
    });
    return { totalIncome: inc, totalExpense: exp };
  }, [monthTransactions]);

  const balance = totalIncome - totalExpense;

  // Yearly Summary
  const currentYear = useMemo(() => currentMonth.split('-')[0], [currentMonth]);
  
  const { yearlyIncome, yearlyExpense } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    transactions.forEach(t => {
      if (t.date.startsWith(currentYear)) {
        if (t.type === 'INCOME') inc += t.amount;
        if (t.type === 'EXPENSE') exp += t.amount;
      }
    });
    return { yearlyIncome: inc, yearlyExpense: exp };
  }, [transactions, currentYear]);

  const yearlyBalance = yearlyIncome - yearlyExpense;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(amount);
  };

  const formatEUR = (amountRSD) => {
    const exchangeRate = 117.2; // Okvirni kurs
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amountRSD / exchangeRate);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Monthly Panel */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <DollarSign size={20} className="text-primary" /> 
          Pregled Meseca
        </h2>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
          <div className="flex items-center gap-2">
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-income-bg)', borderRadius: 'var(--radius-md)' }}>
              <TrendingUp size={24} className="text-income" />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Ukupni Prihodi</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }} className="text-income">
                {formatCurrency(totalIncome)}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
          <div className="flex items-center gap-2">
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-expense-bg)', borderRadius: 'var(--radius-md)' }}>
              <TrendingDown size={24} className="text-expense" />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Ukupni Rashodi</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }} className="text-expense">
                {formatCurrency(totalExpense)}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Neto Balans</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: balance >= 0 ? 'var(--color-income)' : 'var(--color-expense)' }}>
            {balance > 0 ? '+' : ''}{formatCurrency(balance)}
          </div>
        </div>
      </div>

      {/* Yearly Panel */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} className="text-primary" /> 
          Godišnji Pregled ({currentYear})
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Godišnji Prihodi</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 600 }} className="text-income">
              {formatCurrency(yearlyIncome)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              ≈ {formatEUR(yearlyIncome)}
            </div>
          </div>
          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Godišnji Rashodi</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 600 }} className="text-expense">
              {formatCurrency(yearlyExpense)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              ≈ {formatEUR(yearlyExpense)}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Godišnji Balans</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: yearlyBalance >= 0 ? 'var(--color-income)' : 'var(--color-expense)' }}>
              {yearlyBalance > 0 ? '+' : ''}{formatCurrency(yearlyBalance)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              ≈ {yearlyBalance > 0 ? '+' : ''}{formatEUR(yearlyBalance)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
