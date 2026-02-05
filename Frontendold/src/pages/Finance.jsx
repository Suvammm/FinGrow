import { useState, useEffect } from 'react';
import { getFinance, updateFinance } from '../api';
import { Plus, Trash2, Save } from 'lucide-react';

const Finance = () => {
  const [assets, setAssets] = useState([{ name: '', value: '' }]);
  const [liabilities, setLiabilities] = useState([{ name: '', value: '' }]);
  const [loading, setLoading] = useState(false);

  // Load existing data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await getFinance();
        if (data) {
          if (data.assets?.length) setAssets(data.assets);
          if (data.liabilities?.length) setLiabilities(data.liabilities);
        }
      } catch (err) { console.error("Error loading finance data", err); }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateFinance({ assets, liabilities });
      alert("Finances updated!");
    } catch (err) {
      alert("Failed to save data");
    } finally { setLoading(false); }
  };

  const addItem = (type) => {
    if (type === 'asset') setAssets([...assets, { name: '', value: '' }]);
    else setLiabilities([...liabilities, { name: '', value: '' }]);
  };

  const removeItem = (type, index) => {
    if (type === 'asset') setAssets(assets.filter((_, i) => i !== index));
    else setLiabilities(liabilities.filter((_, i) => i !== index));
  };

  const updateItem = (type, index, field, val) => {
    const list = type === 'asset' ? [...assets] : [...liabilities];
    list[index][field] = val;
    type === 'asset' ? setAssets(list) : setLiabilities(list);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Balance Sheet</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Assets Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-emerald-600 flex items-center gap-2">Assets</h2>
          {assets.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input placeholder="Property, Cash..." className="flex-1 p-2 border rounded-lg" value={item.name} onChange={(e) => updateItem('asset', i, 'name', e.target.value)} />
              <input type="number" placeholder="$" className="w-24 p-2 border rounded-lg" value={item.value} onChange={(e) => updateItem('asset', i, 'value', e.target.value)} />
              <button onClick={() => removeItem('asset', i)} className="text-red-400 p-2"><Trash2 size={18}/></button>
            </div>
          ))}
          <button onClick={() => addItem('asset')} className="flex items-center gap-1 text-emerald-600 text-sm font-medium"><Plus size={16}/> Add Asset</button>
        </div>

        {/* Liabilities Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-red-600 flex items-center gap-2">Liabilities</h2>
          {liabilities.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input placeholder="Loan, Credit Card..." className="flex-1 p-2 border rounded-lg" value={item.name} onChange={(e) => updateItem('liability', i, 'name', e.target.value)} />
              <input type="number" placeholder="$" className="w-24 p-2 border rounded-lg" value={item.value} onChange={(e) => updateItem('liability', i, 'value', e.target.value)} />
              <button onClick={() => removeItem('liability', i)} className="text-red-400 p-2"><Trash2 size={18}/></button>
            </div>
          ))}
          <button onClick={() => addItem('liability')} className="flex items-center gap-1 text-red-600 text-sm font-medium"><Plus size={16}/> Add Liability</button>
        </div>
      </div>

      <button 
        onClick={handleSave}
        disabled={loading}
        className="w-full mt-12 bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition"
      >
        <Save size={20}/> {loading ? "Saving..." : "Save Financial Snapshot"}
      </button>
    </div>
  );
};

export default Finance;