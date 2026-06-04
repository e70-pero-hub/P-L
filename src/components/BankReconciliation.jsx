import React, { useContext, useState, useMemo } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { filterTransactionsByMonth } from '../utils/dateUtils';
import { Building2, CheckCircle2, AlertCircle } from 'lucide-react';

const BankReconciliation = () => {
  const { transactions, bankBalances, currentMonth, setBankBalance } = useContext(GlobalContext);
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const monthTransactions = useMemo(() => {
    return filterTransactionsByMonth(transactions, currentMonth);
  }, [transactions, currentMonth]);

  // For MVP, we'll calculate Expected Balance as: Total Income - Total Expense for the month
  // In a real app, this should add previous month's actual balance. Let's do that!
  
  const previousMonthStr = useMemo(() => {
    const [year, month] = currentMonth.split('-');
    const prevDate = new Date(parseInt(year), parseInt(month) - 2); // -1 for 0-index, -1 for previous month
    const prevYear = prevDate.getFullYear();
    const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
    return `${prevYear}-${prevMonth}`;
  }, [currentMonth]);

  const expectedBalance = useMemo(() => {
    const prevBalance = bankBalances[previousMonthStr] || 0;
    let net = 0;
    monthTransactions.forEach(t => {
      if (t.type === 'INCOME') net += t.amount;
      if (t.type === 'EXPENSE') net -= t.amount;
    });
    return prevBalance + net;
  }, [monthTransactions, bankBalances, previousMonthStr]);

  const actualBalance = bankBalances[currentMonth];
  const difference = actualBalance !== undefined ? actualBalance - expectedBalance : 0;
  const isReconciled = actualBalance !== undefined && difference === 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(amount);
  };

  const handleSave = () => {
    if (inputValue !== '') {
      setBankBalance(currentMonth, parseFloat(inputValue));
      setIsEditing(false);
      setInputValue('');
    }
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: actualBalance !== undefined ? `4px solid ${isReconciled ? 'var(--color-income)' : 'var(--color-expense)'}` : '1px solid var(--border-light)' }}>
      <h2 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Building2 size={20} className="text-primary" /> 
        Kontrola Bankovnog Računa
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Unesi stvarno stanje sa banke na kraju meseca kako bi proverio da li si uneo sve transakcije.
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Očekivano stanje (Po sistemu)</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{formatCurrency(expectedBalance)}</div>
      </div>

      {actualBalance === undefined || isEditing ? (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input 
            type="number" 
            className="form-control" 
            placeholder="Unesi stanje sa banke" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleSave}>Sačuvaj</button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: `1px solid ${isReconciled ? 'var(--color-income)' : 'var(--color-expense)'}`, borderRadius: 'var(--radius-md)', backgroundColor: isReconciled ? 'var(--color-income-bg)' : 'var(--color-expense-bg)' }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: isReconciled ? 'var(--color-income)' : 'var(--color-expense)' }}>Stvarno stanje na banci</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{formatCurrency(actualBalance)}</div>
          </div>
          <div className="flex items-center gap-2">
            {isReconciled ? (
              <CheckCircle2 size={24} className="text-income" />
            ) : (
              <div style={{ textAlign: 'right' }}>
                <AlertCircle size={20} className="text-expense" style={{ marginLeft: 'auto', marginBottom: '0.25rem' }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--color-expense)' }}>
                  Razlika: {formatCurrency(difference)}
                </div>
              </div>
            )}
            <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', marginLeft: '1rem', fontSize: '0.75rem' }} onClick={() => setIsEditing(true)}>
              Izmeni
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankReconciliation;
