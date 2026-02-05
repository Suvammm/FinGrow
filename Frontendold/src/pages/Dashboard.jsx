import { useFinance } from '../hooks/useFinance';

const Dashboard = () => {
  const { data, loading, error } = useFinance();

  if (loading) return <div className="p-10">Loading...</div>;
  if (error) return <div className="p-10 text-red-600">Error: {error}</div>;

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Mode</h1>
      
      <div className="bg-yellow-50 p-4 border border-yellow-400 rounded mb-6">
        <p className="font-bold text-yellow-800">Instructions:</p>
        <p className="text-sm">Look at the code block below. Do you see your "Cash" value inside an "assets" folder?</p>
      </div>

      <h3 className="font-bold">Raw Data from Backend:</h3>
      <pre className="bg-slate-900 text-green-400 p-6 rounded-xl overflow-auto text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default Dashboard;