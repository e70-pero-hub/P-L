import React, { createContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentMonthStr, getNextMonths } from '../utils/dateUtils';

// Initial State
const initialState = {
  transactions: JSON.parse(localStorage.getItem('pl_transactions')) || [],
  bankBalances: JSON.parse(localStorage.getItem('pl_bankBalances')) || {},
  currentMonth: getCurrentMonthStr(),
};

// Create Context
export const GlobalContext = createContext(initialState);

// Reducer
const AppReducer = (state, action) => {
  switch (action.type) {
    case 'SET_MONTH':
      return { ...state, currentMonth: action.payload };
    
    case 'ADD_TRANSACTIONS': {
      const newTransactions = [...state.transactions, ...action.payload];
      localStorage.setItem('pl_transactions', JSON.stringify(newTransactions));
      return { ...state, transactions: newTransactions };
    }

    case 'DELETE_TRANSACTION': {
      const { id, scope, date, groupId } = action.payload;
      let filteredTransactions = state.transactions;

      if (!groupId || scope === 'single') {
        filteredTransactions = state.transactions.filter(t => t.id !== id);
      } else if (scope === 'future') {
        filteredTransactions = state.transactions.filter(t => {
          if (t.groupId === groupId && t.date >= date) return false;
          return true;
        });
      } else if (scope === 'all') {
        filteredTransactions = state.transactions.filter(t => t.groupId !== groupId);
      }

      localStorage.setItem('pl_transactions', JSON.stringify(filteredTransactions));
      return { ...state, transactions: filteredTransactions };
    }

    case 'EDIT_TRANSACTION': {
      const { id, data, scope, date, groupId } = action.payload;
      
      if (!groupId || scope === 'single') {
        // Simple map update
        const updatedTransactions = state.transactions.map(t => {
          if (t.id === id) return { ...t, ...data };
          return t;
        });
        localStorage.setItem('pl_transactions', JSON.stringify(updatedTransactions));
        return { ...state, transactions: updatedTransactions };
      }

      // Complex update: We need to regenerate sequence for 'future' or 'all'
      // First, find the target transactions and the original start date (for 'all')
      let originalStartDate = '9999-99-99';
      let originalTransaction = null;
      
      const filteredTransactions = state.transactions.filter(t => {
        if (t.groupId === groupId) {
          if (t.date < originalStartDate) originalStartDate = t.date;
          if (t.id === id) originalTransaction = t;
        }

        if (scope === 'future') {
          return !(t.groupId === groupId && t.date >= date); // Remove future ones
        } else if (scope === 'all') {
          return t.groupId !== groupId; // Remove all
        }
        return true;
      });

      // Now generate the new ones
      const newTransactions = [];
      const newDuration = data.durationMonths || originalTransaction.durationMonths;
      const type = data.type || originalTransaction.type;
      const amount = data.amount !== undefined ? data.amount : originalTransaction.amount;
      const description = data.description || originalTransaction.description;
      const category = data.category || originalTransaction.category;
      
      const generationStartDate = scope === 'all' ? originalStartDate : date;
      const startMonthStr = generationStartDate.substring(0, 7);
      const day = generationStartDate.split('-')[2] || '01';
      
      const months = getNextMonths(startMonthStr, newDuration);
      
      months.forEach((monthStr) => {
        newTransactions.push({
          id: uuidv4(),
          groupId,
          type,
          amount: Number(amount),
          description,
          date: `${monthStr}-${day}`,
          category,
          isFixed: true,
          durationMonths: newDuration,
        });
      });

      const updatedTransactions = [...filteredTransactions, ...newTransactions];
      localStorage.setItem('pl_transactions', JSON.stringify(updatedTransactions));
      return { ...state, transactions: updatedTransactions };
    }
      
    case 'SET_BANK_BALANCE': {
      const newBalances = { ...state.bankBalances, [action.payload.month]: action.payload.balance };
      localStorage.setItem('pl_bankBalances', JSON.stringify(newBalances));
      return { ...state, bankBalances: newBalances };
    }
      
    default:
      return state;
  }
};

// Provider Component
export const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);

  const setCurrentMonth = (monthStr) => {
    dispatch({ type: 'SET_MONTH', payload: monthStr });
  };

  const addTransaction = (transactionData) => {
    const { type, amount, description, date, category, isFixed, durationMonths } = transactionData;
    const groupId = uuidv4();
    const newTransactions = [];
    
    const startMonth = date.substring(0, 7); 
    
    if (isFixed && durationMonths > 1) {
      const months = getNextMonths(startMonth, durationMonths);
      months.forEach((monthStr) => {
        const day = date.split('-')[2] || '01';
        newTransactions.push({
          id: uuidv4(),
          groupId,
          type,
          amount: Number(amount),
          description: `${description}`,
          date: `${monthStr}-${day}`,
          category,
          isFixed: true,
          durationMonths,
        });
      });
    } else {
      newTransactions.push({
        id: uuidv4(),
        type,
        amount: Number(amount),
        description,
        date,
        category,
        isFixed: false,
      });
    }
    
    dispatch({ type: 'ADD_TRANSACTIONS', payload: newTransactions });
  };

  const deleteTransaction = (id, scope = 'single', date = null, groupId = null) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: { id, scope, date, groupId } });
  };

  const editTransaction = (id, data, scope = 'single', date = null, groupId = null) => {
    dispatch({ type: 'EDIT_TRANSACTION', payload: { id, data, scope, date, groupId } });
  };

  const setBankBalance = (month, balance) => {
    dispatch({ type: 'SET_BANK_BALANCE', payload: { month, balance } });
  };

  return (
    <GlobalContext.Provider
      value={{
        transactions: state.transactions,
        bankBalances: state.bankBalances,
        currentMonth: state.currentMonth,
        setCurrentMonth,
        addTransaction,
        deleteTransaction,
        editTransaction,
        setBankBalance,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
