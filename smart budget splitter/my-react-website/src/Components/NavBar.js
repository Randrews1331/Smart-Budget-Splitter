import React from 'react';
import { useNavigate } from 'react-router-dom';
import './navbar.css';

const NavBar = ({ handleLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="nav-bar">
      {/* Left Side - Logo */}
      <div className="nav-logo" onClick={() => navigate('/home')}>
        <img src="/logo.png" alt="Logo" />
      </div>

      {/* Center - Navigation Links */}
      <div className="nav-links">
        <span className="nav-link" onClick={() => navigate('/home')}>Home</span>
        <span className="nav-link" onClick={() => navigate('/myjourneys')}>My Journeys</span>
        <span className="nav-link" onClick={() => navigate('/splitjourney')}>Split Journey</span>
        <span className="nav-link" onClick={() => navigate('/support')}>Contact Us</span>
        <span className="nav-link" onClick={() => navigate('/carbon')}>Carbon Footprint</span> {/* Added Carbon Footprint Page */}
      </div>

      {/* Right Side - Sign Out Button */}
      <div className="nav-right">
        <button className="sign-out-button" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default NavBar;
