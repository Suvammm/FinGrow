import { useState, useEffect } from 'react';
import { getFinance } from '../api';
import { Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await getFinance();
        // Access the 'summary' object from your old backend
        setData(response.data); 
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Wealth Data...</div>;

  // Use the summary from the backend, or default to 0
  const summary = data?.summary || { totalAssets: 0, totalLiabilities: 0, netWorth: 0 };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Financial Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Net Worth */}
        <div className="bg-indigo-600 p-6 rounded-2xl text-white">
          <p className="text-indigo-100 text-sm">Net Worth</p>
          <h2 className="text-4xl font-bold">${summary.netWorth.toLocaleString()}</h2>
        </div>

        {/* Assets */}
        <div className="bg-white border p-6 rounded-2xl">
          <div className="flex justify-between items-center">
            <p className="text-slate-500">Total Assets</p>
            <ArrowUpCircle className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">${summary.totalAssets.toLocaleString()}</h2>
        </div>

        {/* Liabilities */}
        <div className="bg-white border p-6 rounded-2xl">
          <div className="flex justify-between items-center">
            <p className="text-slate-500">Total Liabilities</p>
            <ArrowDownCircle className="text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">${summary.totalLiabilities.toLocaleString()}</h2>
        </div>
      </div>

      {/* AI Suggestions from your Backend */}
      {summary.suggestions?.length > 0 && (
        <div className="mt-8 bg-amber-50 border border-amber-200 p-6 rounded-2xl">
          <h3 className="font-bold text-amber-800 mb-3">AI Wealth Insights</h3>
          <ul className="space-y-2">
            {summary.suggestions.map((tip, i) => (
              <li key={i} className="text-amber-700 text-sm flex gap-2">
                <span>•</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;