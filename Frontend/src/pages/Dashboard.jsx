import React from 'react';
import ProfileMenu from '../components/profileMenu';

import './Dashboard.css';

const Dashboard = () => {
  let user = null;
  try {
    const storedUser = localStorage.getItem('user');
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  const stockNews = [
    { id: 1, title: "Nifty 50 Gains 1.2%", impact: "Positive", time: "5m ago" },
    { id: 2, title: "Tech Stocks Rally on AI Growth", impact: "High", time: "20m ago" },
    { id: 3, title: "Federal Reserve Maintains Interest Rates", impact: "Neutral", time: "1h ago" }
  ];

  const landTrends = [
    { city: "Bengaluru East", increase: "+22%", type: "Residential" },
    { city: "Pune IT Corridor", increase: "+18%", type: "Commercial" },
    { id: 3, city: "Navi Mumbai Airport Zone", increase: "+35%", type: "Investment Hotspot" }
  ];

  const growingStates = [
    { name: "Karnataka", gdpGrowth: "8.2%", sector: "Technology" },
    { name: "Maharashtra", gdpGrowth: "7.9%", sector: "Manufacturing" },
    { name: "Gujarat", gdpGrowth: "8.5%", sector: "Renewable Energy" }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-topbar">
        <ProfileMenu user={user} />
      </div>
      <header className="dash-header">
        <h1>Market Intelligence</h1>
        <span className="live-pulse">● Live Market Feed</span>
      </header>

      <div className="market-grid">
        {/* STOCK NEWS SECTION */}
        <div className="insight-card">
          <div className="card-header">
            <h3>📈 Stock Market News</h3>
          </div>
          <div className="news-list">
            {stockNews.map(news => (
              <div key={news.id} className="news-item">
                <span className={`impact-tag ${news.impact.toLowerCase()}`}>{news.impact}</span>
                <p>{news.title}</p>
                <small>{news.time}</small>
              </div>
            ))}
          </div>
        </div>

        {/* LAND PRICE SECTION */}
        <div className="insight-card">
          <div className="card-header">
            <h3>🏗️ Land Price Appreciation</h3>
          </div>
          <table className="trend-table">
            <thead>
              <tr>
                <th>Region</th>
                <th>Growth</th>
              </tr>
            </thead>
            <tbody>
              {landTrends.map((land, i) => (
                <tr key={i}>
                  <td>
                    <strong>{land.city}</strong><br/>
                    <small>{land.type}</small>
                  </td>
                  <td className="growth-text">{land.increase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* STATE GROWTH SECTION */}
        <div className="insight-card">
          <div className="card-header">
            <h3>🚀 Fastest Growing States</h3>
          </div>
          <div className="state-ranking">
            {growingStates.map((state, i) => (
              <div key={i} className="state-row">
                <div className="state-info">
                  <span className="rank">#{i + 1}</span>
                  <strong>{state.name}</strong>
                  <p>Primary Sector: {state.sector}</p>
                </div>
                <div className="growth-badge">{state.gdpGrowth}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
