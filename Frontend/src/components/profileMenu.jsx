import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './profileMenu.css';

const ProfileMenu = ({ user }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const name = user?.name || 'User';
  const email = user?.email || localStorage.getItem('lastLoginEmail') || '';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

  useEffect(() => {
    const onClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const goTo = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="profile-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="profile-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="user-details">
          <span className="user-name">{name}</span>
          {email ? <span className="user-email">{email}</span> : null}
        </span>
        <div className="avatar">{initials}</div>
      </button>
      {isOpen ? (
        <div className="profile-menu-dropdown">
          <button type="button" onClick={() => goTo('/profile')}>
            Profile
          </button>
          <button type="button" onClick={() => goTo('/finance-status')}>
            Finance Status
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ProfileMenu;
