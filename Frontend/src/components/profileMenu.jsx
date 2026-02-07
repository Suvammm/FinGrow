import React, { useState } from 'react';
import './profileMenu.css';

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Dummy user data
  const user = {
    name: "Suvam Kurmi",
    title: "Wealth Strategist",
    bio: "Currently building an AI-powered Wealth Engine. Exploring real estate and stock market trends.",
    achievements: ["50% Net Worth Growth in 2025", "Certified Financial Planner", "Early Crypto Investor"]
  };

  return (
    <div className="profile-wrapper" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <div className="profile-trigger">
        <span className="user-name">{user.name}</span>
        <div className="avatar">SK</div>
      </div>

      {isOpen && (
        <div className="profile-dropdown">
          <div className="dropdown-header">
            <h4>{user.name}</h4>
            <p>{user.title}</p>
          </div>
          <div className="dropdown-section">
            <label>Current Focus</label>
            <p>{user.bio}</p>
          </div>
          <div className="dropdown-section">
            <label>Accomplishments</label>
            <ul>
              {user.achievements.map((item, i) => <li key={i}>✅ {item}</li>)}
            </ul>
          </div>
          <button className="edit-profile-btn">View Full Profile</button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;