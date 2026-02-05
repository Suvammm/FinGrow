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
      
      // Safety Check: If backend sends just the finance object, 
      // we ensure summary exists so the Dashboard doesn't crash.
      const rawData = response.data;
      if (rawData && !rawData.summary) {
        rawData.summary = {
          totalAssets: rawData.finance?.totalAssets || 0,
          totalLiabilities: rawData.finance?.totalLiabilities || 0,
          netWorth: rawData.finance?.netWorth || 0
        };
      }

      setData(rawData);
      setError(null);
    } catch (err) {
      console.error("Hook Error:", err);
      // If it's a 404, we give a specific hint
      const message = err.response?.status === 404 
        ? "API Route Not Found (Check backend routes)" 
        : (err.response?.data?.message || "Failed to acquire data");
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  return { data, loading, error, refresh: fetchFinanceData };
};