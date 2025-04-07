import React from 'react';
import './JourneyDetailsPopup.css';

const JourneyDetailsPopup = ({ journey, onClose }) => {
  if (!journey) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Journey Details</h2>
        <p><strong>ID:</strong> {journey.id}</p>
        <p><strong>Distance:</strong> {journey.distance} miles</p>
        <p><strong>MPG:</strong> {journey.mpg}</p>
        <p><strong>Fuel Cost:</strong> £{journey.fuelCost}</p>
        <p><strong>Date:</strong> {new Date(journey.date).toLocaleString()}</p>
        <button className="close-popup-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default JourneyDetailsPopup;
