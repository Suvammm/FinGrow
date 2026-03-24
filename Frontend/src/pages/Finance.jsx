import { useEffect, useState } from 'react';
import { updateFinance, getAiInsights, fetchFinance } from '../api/api';
import './Finance.css';

const formatLabel = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

const Finance = () => {
  const [financeData, setFinanceData] = useState({
    assets: { cash: 0, fixedDeposits: 0, mutualFunds: 0, stocks: 0, crypto: 0, realEstate: 0, gold: 0 },
    liabilities: { homeLoan: 0, educationLoan: 0, personalLoan: 0, creditCardDues: 0 }
  });
  
  const [aiPlan, setAiPlan] = useState(null);
  const [aiError, setAiError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const loadFinance = async () => {
      try {
        const response = await fetchFinance();
        const payload = response?.data || {};
        setFinanceData({
          assets: { ...financeData.assets, ...(payload.assets || {}) },
          liabilities: { ...financeData.liabilities, ...(payload.liabilities || {}) },
        });
      } catch (err) {
        // Keep the current defaults when fetch fails.
      }
    };

    loadFinance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      window.dispatchEvent(new Event('finance-updated'));
      alert("Wealth Engine Updated Successfully!");
    } catch (err) {
      alert("Error saving data");
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAiError('');
    try {
      const response = await getAiInsights(financeData);
      setAiPlan(response?.data || null);
    } catch (err) {
      setAiError('AI analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
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
                  <label>{formatLabel(key)}</label>
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
                  <label>{formatLabel(key)}</label>
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
          <button
            type="button"
            className="analyze-btn-large"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
          </button>
        </div>
      </form>

      {aiError ? <p className="ai-error">{aiError}</p> : null}

      {aiPlan ? (
        <section className="ai-plan-card">
          <div className="ai-plan-header">
            <h3>AI Investment Analysis</h3>
            <span className="ai-source">{aiPlan?.source === 'openai' ? 'OpenAI' : 'Rule Engine'}</span>
          </div>
          <p className="ai-summary">{aiPlan.summary}</p>

          <div className="ai-grid">
            <article className="ai-panel">
              <h4>What may be wrong</h4>
              <ul>
                {(aiPlan.wrongInvestments || []).map((item, index) => (
                  <li key={`wrong-${index}`}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="ai-panel">
              <h4>Risk signals</h4>
              <ul>
                {(aiPlan.risks || []).map((item, index) => (
                  <li key={`risk-${index}`}>{item}</li>
                ))}
              </ul>
            </article>
          </div>

          <article className="ai-panel">
            <h4>Planned steps to grow assets</h4>
            <ol className="step-list">
              {(aiPlan.actionPlan || []).map((step, index) => (
                <li key={`step-${index}`}>
                  <strong>{step.step}</strong>
                  <span>Timeline: {step.timeline}</span>
                  <span>Impact: {step.impact}</span>
                </li>
              ))}
            </ol>
          </article>

          <article className="ai-panel">
            <h4>Suggested target allocation</h4>
            <div className="allocation-grid">
              {Object.entries(aiPlan.targetAllocation || {}).map(([key, value]) => (
                <div key={key} className="allocation-item">
                  <span>{formatLabel(key)}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </article>

          {aiPlan.note ? <p className="ai-note">{aiPlan.note}</p> : null}
        </section>
      ) : null}
    </div>
  );
};

export default Finance;
