export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const parseCurrencyString = (currencyString: string): number => {
  const numericValue = currencyString.replace(/[^0-9.-]+/g, '');
  return parseFloat(numericValue);
};

export const formatLargeNumber = (num: number): string => {
  if (num >= 10000000) { // 1 crore
    return `${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) { // 1 lakh
    return `${(num / 100000).toFixed(2)} L`;
  } else if (num >= 1000) { // 1 thousand
    return `${(num / 1000).toFixed(2)} K`;
  }
  return num.toString();
};