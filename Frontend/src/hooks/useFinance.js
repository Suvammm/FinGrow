import { useState, useEffect, useCallback } from 'react';
import { getFinance } from '../api';

export const useFinance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFinanceData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getFinance();
      
      // We expect the backend to return: { finance, summary }
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error("Hook Error:", err);
      setError(err.response?.data?.message || "Failed to acquire financial data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data automatically on mount
  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  // We return 'refresh' so you can manually update the data after a form submit
  return { data, loading, error, refresh: fetchFinanceData };
};