import { format, addMonths, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export const getCurrentMonthStr = () => format(new Date(), 'yyyy-MM');

export const formatMonthDisplay = (monthStr) => {
  if (!monthStr) return '';
  const date = parseISO(`${monthStr}-01`);
  return format(date, 'MMMM yyyy'); // e.g., June 2026
};

export const getNextMonths = (startMonthStr, numMonths) => {
  const result = [];
  const startDate = parseISO(`${startMonthStr}-01`);
  for (let i = 0; i < numMonths; i++) {
    result.push(format(addMonths(startDate, i), 'yyyy-MM'));
  }
  return result;
};

export const filterTransactionsByMonth = (transactions, monthStr) => {
  const start = startOfMonth(parseISO(`${monthStr}-01`));
  const end = endOfMonth(parseISO(`${monthStr}-01`));
  
  return transactions.filter(t => {
    const tDate = parseISO(t.date);
    return isWithinInterval(tDate, { start, end });
  });
};
