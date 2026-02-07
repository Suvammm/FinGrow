import { useState } from 'react';
import { updateFinance, getAiInsights } from '../api/api';
import './Finance.css';

const Finance = () => {
  const [financeData, setFinanceData] = useState({
    assets: { cash: 0, fixedDeposits: 0, mutualFunds: 0, stocks: 0, crypto: 0, realEstate: 0, gold: 0 },
    liabilities: { homeLoan: 0, educationLoan: 0, personalLoan: 0, creditCardDues: 0 }
  });
  
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleChange = (section, key, value) => {
    setFinanceData({
      ...financeData,
      [section]: { ...financeData[section], [key]: Number(value) }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateFinance(financeData);
      alert("Wealth Engine Updated Successfully!");
    } catch (err) {
      alert("Error saving data");
    }
  };

  return (
    <div className="finance-container">
      <div className="finance-header">
        <h2>Wealth Entry</h2>
        <p>Update your financial position to get AI-driven insights.</p>
      </div>
      
      <form onSubmit={handleSave} className="wealth-form">
        <div className="wealth-grid">
          {/* ASSETS SECTION */}
          <div className="wealth-card assets-card">
            <div className="card-title">
              <span className="icon">🏦</span>
              <h3>Assets</h3>
            </div>
            <div className="input-grid">
              {Object.keys(financeData.assets).map(key => (
                <div key={key} className="input-box">
                  <label>{key.replace(/([A-Z])/g, ' $1')}</label>
                  <input 
                    type="number" 
                    value={financeData.assets[key]} 
                    onChange={(e) => handleChange('assets', key, e.target.value)} 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* LIABILITIES SECTION */}
          <div className="wealth-card liabilities-card">
            <div className="card-title">
              <span className="icon">💳</span>
              <h3>Liabilities</h3>
            </div>
            <div className="input-grid">
              {Object.keys(financeData.liabilities).map(key => (
                <div key={key} className="input-box">
                  <label>{key.replace(/([A-Z])/g, ' $1')}</label>
                  <input 
                    type="number" 
                    value={financeData.liabilities[key]} 
                    onChange={(e) => handleChange('liabilities', key, e.target.value)} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn-large">Sync Wealth Engine</button>
        </div>
      </form>

      {/* Floating AI Button remains the same as before */}
    </div>
  );
};

export default Finance;