import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCarSide } from 'react-icons/fa'; // Import the car icon
import NavBar from '../Components/NavBar';
import './myjourney.css';
import JourneyDetailsPopup from '../Components/JourneyDetailsPopup';

const MyJourneys = () => {
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJourney, setSelectedJourney] = useState(null);

  const ticketColors = ["#9cc1e3", "#e3a89c", "#9ce3b8", "#d8e39c", "#c19ce3"];

  useEffect(() => {
    const fetchJourneys = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/journeys', { withCredentials: true });
        setJourneys(response.data);
      } catch (error) {
        console.error('Error fetching journeys:', error);
        setError('Failed to fetch journeys. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJourneys();
  }, []);

  const handleRemoveJourney = async (journeyId) => {
    try {
      await axios.delete(`http://localhost:8081/api/journeys/${journeyId}`, { withCredentials: true });
      setJourneys(journeys.filter(journey => journey.id !== journeyId));
    } catch (error) {
      console.error('Error removing journey:', error);
      setError('Failed to remove journey. Please try again later.');
    }
  };

  return (
    <div className="my-journeys-container">
      <NavBar />
      <div className="my-journeys-content">
        <h3 className="my-journey-title">My Journeys</h3>

        {loading && <p>Loading journeys...</p>}
        {error && <p className="error-message">{error}</p>}

        {journeys.length === 0 && !loading && (
          <p>You haven't submitted any journeys yet.</p>
        )}

        {journeys.length > 0 && (
          <div className="journeys-list">
            {journeys.map((journey, index) => (
              <div 
                key={journey.id} 
                className="journey-ticket" 
                style={{ background: ticketColors[index % ticketColors.length] }}
              >
                <div className="journey-card">
                  <div className="journey-info">
                    <h4>
                      Journey:{" "}
                      {journey.startLocation
                        ? journey.startLocation.charAt(0).toUpperCase() + journey.startLocation.slice(1)
                        : "Unknown"}{" "}
                      →{" "}
                      {journey.endLocation
                        ? journey.endLocation.charAt(0).toUpperCase() + journey.endLocation.slice(1)
                        : "Unknown"}
                    </h4>
                    <p><strong>Distance:</strong> {journey.distance} miles</p>
                    <p><strong>MPG:</strong> {journey.mpg}</p>
                    <p><strong>Fuel Cost:</strong> £{journey.fuelCost}</p>
                    <p><strong>Date:</strong> {new Date(journey.date).toLocaleString()}</p>
                    <div className="journey-icon">
                      <FaCarSide />
                    </div>
                  </div>
                </div>
                <div className="journey-actions">
                  <button 
                    className="details-journey-btn"
                    onClick={() => setSelectedJourney(journey)}
                  >
                    View Details
                  </button>
                  <button 
                    className="remove-journey-btn"
                    onClick={() => handleRemoveJourney(journey.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedJourney && (
        <JourneyDetailsPopup 
          journey={selectedJourney} 
          onClose={() => setSelectedJourney(null)} 
        />
      )}
    </div>
  );
};

export default MyJourneys;
