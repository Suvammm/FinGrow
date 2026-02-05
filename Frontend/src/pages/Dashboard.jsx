import { useState, useEffect } from 'react';
import { fetchFinance } from  '../api/api'; // Ensure the casing matches the actual file path
import './Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState({ netWorth: 0, totalAssets: 0, totalLiabilities: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        const { data } = await fetchFinance();
        
        // If your controller returns data.summary, update the state
        if (data && data.summary) {
          setSummary(data.summary);
        }
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
        setError("Unable to load financial data. Please check your backend.");
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, []);

  if (loading) return <div className="loading-state">Calculating your wealth...</div>;

  return (
    <div className="dashboard-container">
      <h1>Financial Overview</h1>
      
      {error && <div className="dashboard-error-banner">{error}</div>}
      
      <div className="card-grid">
        <div className="card nw">
          <h3>Net Worth</h3>
          <p>${Number(summary.netWorth).toLocaleString()}</p>
        </div>
        <div className="card as">
          <h3>Total Assets</h3>
          <p>${Number(summary.totalAssets).toLocaleString()}</p>
        </div>
        <div className="card lb">
          <h3>Total Liabilities</h3>
          <p>${Number(summary.totalLiabilities).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;