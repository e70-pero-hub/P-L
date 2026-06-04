import React, { useContext, useMemo, useState } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { filterTransactionsByMonth } from '../utils/dateUtils';
import { Trash2, Edit2, ArrowUpRight, ArrowDownRight, Repeat, X } from 'lucide-react';
import { parseISO, format } from 'date-fns';

const TransactionList = () => {
  const { transactions, currentMonth, deleteTransaction, editTransaction } = useContext(GlobalContext);
  
  const [actionModal, setActionModal] = useState({ open: false, type: null, transaction: null }); // type: 'DELETE' or 'EDIT'
  const [editForm, setEditForm] = useState({ amount: '', description: '', category: '', durationMonths: 1 });

  const monthTransactions = useMemo(() => {
    return filterTransactionsByMonth(transactions, currentMonth).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, currentMonth]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(amount);
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'STANDARD': return 'Standardni';
      case 'IMPOSED': return 'Nametnuti';
      case 'FRIENDLY': return 'Prijateljski';
      default: return '';
    }
  };

  const openDeleteModal = (t) => {
    if (!t.groupId) {
      deleteTransaction(t.id); // Direct delete for single transactions
    } else {
      setActionModal({ open: true, type: 'DELETE', transaction: t });
    }
  };

  const openEditModal = (t) => {
    setEditForm({ 
      amount: t.amount, 
      description: t.description, 
      category: t.category || 'STANDARD',
      durationMonths: t.durationMonths || 1
    });
    setActionModal({ open: true, type: 'EDIT', transaction: t });
  };

  const handleSmartAction = (scope) => {
    const { type, transaction } = actionModal;
    if (type === 'DELETE') {
      deleteTransaction(transaction.id, scope, transaction.date, transaction.groupId);
    } else if (type === 'EDIT') {
      const dataToUpdate = {
        amount: parseFloat(editForm.amount),
        description: editForm.description,
        durationMonths: parseInt(editForm.durationMonths, 10),
        ...(transaction.type === 'EXPENSE' ? { category: editForm.category } : {})
      };
      editTransaction(transaction.id, dataToUpdate, scope, transaction.date, transaction.groupId);
    }
    setActionModal({ open: false, type: null, transaction: null });
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '600px', overflowY: 'auto', position: 'relative' }}>
      <h2 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Lista Transakcija</h2>
      
      {monthTransactions.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '150px', color: 'var(--text-secondary)' }}>
          Nema unosa za odabrani mesec.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {monthTransactions.map((t) => (
            <div key={t.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '1rem', 
              backgroundColor: 'var(--bg-primary)', 
              borderRadius: 'var(--radius-md)',
              borderLeft: `4px solid ${t.type === 'INCOME' ? 'var(--color-income)' : 'var(--color-expense)'}`
            }}>
              <div className="flex items-center gap-4">
                <div style={{ color: t.type === 'INCOME' ? 'var(--color-income)' : 'var(--color-expense)' }}>
                  {t.type === 'INCOME' ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                </div>
                <div>
                  <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {t.description}
                    {t.isFixed && <Repeat size={14} className="text-secondary" title={`Fiksni unos (${t.durationMonths} meseci)`} />}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem' }}>
                    <span>{format(parseISO(t.date), 'dd.MM.yyyy.')}</span>
                    {t.type === 'EXPENSE' && t.category && (
                      <span style={{ 
                        padding: '0.1rem 0.4rem', 
                        backgroundColor: 'var(--bg-tertiary)', 
                        borderRadius: 'var(--radius-sm)' 
                      }}>
                        {getCategoryLabel(t.category)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div style={{ fontWeight: 600, color: t.type === 'INCOME' ? 'var(--color-income)' : 'var(--text-primary)' }}>
                  {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(t)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} title="Izmeni">
                    <Edit2 size={18} style={{ transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'} />
                  </button>
                  <button onClick={() => openDeleteModal(t)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} title="Obriši">
                    <Trash2 size={18} style={{ transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-expense)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Modal (Smart Delete / Smart Edit) */}
      {actionModal.open && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(4px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '2rem', zIndex: 10, borderRadius: 'var(--radius-lg)'
        }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem' }}>
                {actionModal.type === 'DELETE' ? 'Brisanje Fiksne Transakcije' : 'Izmena Fiksne Transakcije'}
              </h3>
              <button onClick={() => setActionModal({ open: false, type: null, transaction: null })} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {actionModal.type === 'EDIT' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label className="form-label">Opis</label>
                  <input type="text" className="form-control" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Iznos</label>
                  <input type="number" className="form-control" value={editForm.amount} onChange={(e) => setEditForm({...editForm, amount: e.target.value})} />
                </div>
                {actionModal.transaction.type === 'EXPENSE' && (
                  <div>
                    <label className="form-label">Kategorija</label>
                    <select className="form-control" value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})}>
                      <option value="STANDARD">Standardni Troškovi</option>
                      <option value="IMPOSED">Nametnuti Troškovi</option>
                      <option value="FRIENDLY">Prijateljski Troškovi</option>
                    </select>
                  </div>
                )}
                {actionModal.transaction.groupId && (
                  <div>
                    <label className="form-label">Trajanje (Broj Meseci)</label>
                    <input type="number" className="form-control" value={editForm.durationMonths} onChange={(e) => setEditForm({...editForm, durationMonths: e.target.value})} min="1" />
                  </div>
                )}
              </div>
            )}

            {actionModal.transaction.groupId ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Ova transakcija je deo niza koji se ponavlja. Na šta želiš da primeniš ovu akciju?
                </p>
                <button className="btn btn-outline" onClick={() => handleSmartAction('single')} style={{ justifyContent: 'flex-start' }}>
                  Samo na ovaj mesec
                </button>
                <button className="btn btn-outline" onClick={() => handleSmartAction('future')} style={{ justifyContent: 'flex-start' }}>
                  Na ovaj mesec i SVE naredne
                </button>
                <button className={`btn ${actionModal.type === 'DELETE' ? 'btn-expense' : 'btn-primary'}`} onClick={() => handleSmartAction('all')} style={{ justifyContent: 'flex-start' }}>
                  Na APSOLUTNO SVE (Prošle i buduće)
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button className={`btn ${actionModal.type === 'DELETE' ? 'btn-expense' : 'btn-primary'}`} style={{ flex: 1 }} onClick={() => handleSmartAction('single')}>
                  Potvrdi
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
