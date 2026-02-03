/**
 * Formats a number as a currency string.
 * @param {number} amount - The raw number to format.
 * @returns {string} - e.g., $1,250.00
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };
  
  /**
   * Shortens large numbers for small UI cards.
   * @param {number} num - e.g., 1000000
   * @returns {string} - e.g., 1.0M
   */
  export const formatCompactNumber = (num) => {
    return Intl.NumberFormat('en-US', {
      notation: "compact",
      maximumFractionDigits: 1
    }).format(num || 0);
  };