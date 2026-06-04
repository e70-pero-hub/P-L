import React, { useContext, useMemo } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { X, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';

const RecurringManager = ({ onClose }) => {
  const { transactions, deleteTransaction } = useContext(GlobalContext);

  // Group recurring transactions by groupId
  const recurringGroups = useMemo(() => {
    const groups = {};
    transactions.forEach(t => {
      if (t.isFixed && t.groupId) {
        if (!groups[t.groupId]) {
          groups[t.groupId] = {
            ...t,
            count: 1,
            startDate: t.date,
            endDate: t.date,
          };
        } else {
          groups[t.groupId].count += 1;
          if (t.date < groups[t.groupId].startDate) groups[t.groupId].startDate = t.date;
          if (t.date > groups[t.groupId].endDate) groups[t.groupId].endDate = t.date;
        }
      }
    });
    return Object.values(groups).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  }, [transactions]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(amount);
  };

  const handleDeleteAll = (groupId) => {
    if (window.confirm('Da li si siguran da želiš da obrišeš ovu pretplatu i sve njene mesece?')) {
      deleteTransaction(null, 'all', null, groupId);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', zIndex: 100
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Fiksne Pretplate i Ugovori</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={28} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
          {recurringGroups.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
              Nemate aktivnih fiksnih transakcija.
            </div>
          ) : (
            recurringGroups.map(group => (
              <div key={group.groupId} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1.25rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)',
                borderLeft: `4px solid ${group.type === 'INCOME' ? 'var(--color-income)' : 'var(--color-expense)'}`
              }}>
                <div className="flex items-center gap-4">
                  <div style={{ color: group.type === 'INCOME' ? 'var(--color-income)' : 'var(--color-expense)' }}>
                    {group.type === 'INCOME' ? <ArrowUpRight size={28} /> : <ArrowDownRight size={28} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{group.description}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Trajanje: {group.count} meseci (Od {group.startDate.substring(0, 7)} do {group.endDate.substring(0, 7)})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.25rem', color: group.type === 'INCOME' ? 'var(--color-income)' : 'var(--text-primary)' }}>
                      {group.type === 'INCOME' ? '+' : '-'}{formatCurrency(group.amount)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>mesečno</div>
                  </div>
                  <button 
                    onClick={() => handleDeleteAll(group.groupId)}
                    className="btn btn-expense"
                    style={{ padding: '0.5rem' }}
                    title="Obriši ceo niz"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RecurringManager;
