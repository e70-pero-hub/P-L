import React, { useState, useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { PlusCircle, MinusCircle } from 'lucide-react';

const TransactionForm = () => {
  const { addTransaction, currentMonth } = useContext(GlobalContext);
  const [type, setType] = useState('EXPENSE');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(`${currentMonth}-01`);
  const [category, setCategory] = useState('STANDARD');
  const [isFixed, setIsFixed] = useState(false);
  const [durationMonths, setDurationMonths] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount || !date) return;

    addTransaction({
      type,
      description,
      amount: parseFloat(amount),
      date,
      category: type === 'EXPENSE' ? category : null,
      isFixed,
      durationMonths: isFixed ? parseInt(durationMonths, 10) : 1
    });

    // Reset form
    setDescription('');
    setAmount('');
    setIsFixed(false);
    setDurationMonths(1);
  };

  return (
    <div className="glass-panel" style={{ height: 'fit-content' }}>
      <h2 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {type === 'INCOME' ? <PlusCircle size={20} className="text-income" /> : <MinusCircle size={20} className="text-expense" />}
        Dodaj Unos
      </h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button 
          className={`btn ${type === 'INCOME' ? 'btn-income' : 'btn-outline'}`} 
          style={{ flex: 1 }}
          onClick={() => setType('INCOME')}
        >
          Prihod
        </button>
        <button 
          className={`btn ${type === 'EXPENSE' ? 'btn-expense' : 'btn-outline'}`} 
          style={{ flex: 1 }}
          onClick={() => setType('EXPENSE')}
        >
          Trošak
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Opis</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Npr. Plata, Namirnice, Račun za struju..." 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group">
          <label className="form-label">Iznos (RSD)</label>
          <input 
            type="number" 
            className="form-control" 
            placeholder="0" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            min="0" 
            step="0.01"
            required 
          />
        </div>

        <div className="form-group">
          <label className="form-label">Datum</label>
          <input 
            type="date" 
            className="form-control" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            required 
          />
        </div>

        {type === 'EXPENSE' && (
          <div className="form-group">
            <label className="form-label">Kategorija Troška</label>
            <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="STANDARD">Standardni Troškovi</option>
              <option value="IMPOSED">Nametnuti Troškovi</option>
              <option value="FRIENDLY">Prijateljski Troškovi</option>
            </select>
          </div>
        )}

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <input 
            type="checkbox" 
            id="isFixed" 
            checked={isFixed} 
            onChange={(e) => setIsFixed(e.target.checked)} 
            style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
          />
          <label htmlFor="isFixed" style={{ fontSize: '0.875rem', cursor: 'pointer', userSelect: 'none' }}>
            Fiksni ponavljajući unos
          </label>
        </div>

        {isFixed && (
          <div className="form-group">
            <label className="form-label">Trajanje (Broj Meseci)</label>
            <input 
              type="number" 
              className="form-control" 
              value={durationMonths} 
              onChange={(e) => setDurationMonths(e.target.value)} 
              min="2" 
              required 
            />
          </div>
        )}

        <button type="submit" className={`btn ${type === 'INCOME' ? 'btn-income' : 'btn-expense'} mt-4`} style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}>
          Sačuvaj Unos
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
