import { useState } from 'react';
import { updateFinance } from '../api/api';
import './Finance.css';

const Finance = () => {
  const [assets, setAssets] = useState({ cash: 0, stocks: 0, crypto: 0, gold: 0, realEstate: 0 });

  const handleSave = async (e) => {
    e.preventDefault();
    await updateFinance({ assets });
    alert("Financial Profile Updated");
  };

  return (
    <div className="finance-container">
      <form className="finance-form" onSubmit={handleSave}>
        <h2>Update Assets</h2>
        {Object.keys(assets).map(key => (
          <div className="input-field" key={key}>
            <label>{key.toUpperCase()}</label>
            <input type="number" onChange={(e) => setAssets({...assets, [key]: Number(e.target.value)})} />
          </div>
        ))}
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};
export default Finance;