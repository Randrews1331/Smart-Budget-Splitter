import React, { useState, useEffect } from "react";
import axios from "axios";
import "./carbon.css"; // Import the custom CSS

const Carbon = () => {
  const [distance, setDistance] = useState(100);
  const [unit, setUnit] = useState("miles");
  const [fuelType, setFuelType] = useState("petrol");
  const [vehicle, setVehicle] = useState("standard");
  const [carbonFootprint, setCarbonFootprint] = useState(null);
  
  // New states for journey integration
  const [journeys, setJourneys] = useState([]);
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showJourneySelector, setShowJourneySelector] = useState(false);

  const vehicleEmissions = {
    standard: 0.3,
    luxury: 0.4,
    suv: 0.35,
    van: 0.45,
    motorcycle: 0.2,
  };

  // Fetch journeys when component mounts
  useEffect(() => {
    const fetchJourneys = async () => {
      setLoading(true);
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

  const calculateCarbon = () => {
    const factor = vehicleEmissions[vehicle] || 0.3;
    const distanceInMiles = unit === "kilometers" ? distance * 0.621371 : distance;
    const emissions = (factor * distanceInMiles) / 100;
    setCarbonFootprint(emissions.toFixed(2));
  };

  const handleJourneySelect = (journey) => {
    setSelectedJourney(journey);
    setDistance(journey.distance);
    setShowJourneySelector(false);
  };

  return (
    <div className="carbon-wrapper">
      {/* Main form container */}
      <div className="carbon-container">
        <h1 className="carbon-title">Calculate Your Travel Carbon Footprint</h1>

        {/* Journey Selection Button */}
        <div className="carbon-input journey-selector">
          <label className="carbon-label">Use Existing Journey:</label>
          <button 
            className="journey-select-btn" 
            onClick={() => setShowJourneySelector(!showJourneySelector)}
          >
            {selectedJourney 
              ? `${selectedJourney.startLocation} → ${selectedJourney.endLocation}` 
              : "Select a journey"}
          </button>
          
          {/* Journey Dropdown */}
          {showJourneySelector && (
            <div className="journey-dropdown">
              {loading && <p className="journey-loading">Loading journeys...</p>}
              {error && <p className="journey-error">{error}</p>}
              {journeys.length === 0 && !loading && (
                <p className="no-journeys">No journeys found</p>
              )}
              {journeys.map(journey => (
                <div 
                  key={journey.id} 
                  className="journey-option"
                  onClick={() => handleJourneySelect(journey)}
                >
                  <div className="journey-option-info">
                    <span className="journey-locations">
                      {journey.startLocation} → {journey.endLocation}
                    </span>
                    <span className="journey-distance">
                      {journey.distance} miles
                    </span>
                  </div>
                  <div className="journey-option-date">
                    {new Date(journey.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vehicle selection */}
        <div className="carbon-input">
          <label className="carbon-label">Select Vehicle:</label>
          <div className="vehicle-options">
            <div
              className={`vehicle-option ${vehicle === "standard" ? "selected" : ""}`}
              onClick={() => setVehicle("standard")}
            >
              <img src="/sedan.png" alt="Standard Car" className="vehicle-icon" />
              <p>Standard Car</p>
            </div>
            <div
              className={`vehicle-option ${vehicle === "luxury" ? "selected" : ""}`}
              onClick={() => setVehicle("luxury")}
            >
              <img src="/transport.png" alt="Luxury Car" className="vehicle-icon" />
              <p>Luxury Car</p>
            </div>
            <div
              className={`vehicle-option ${vehicle === "suv" ? "selected" : ""}`}
              onClick={() => setVehicle("suv")}
            >
              <img src="/suv.png" alt="SUV" className="vehicle-icon" />
              <p>SUV</p>
            </div>
            <div
              className={`vehicle-option ${vehicle === "van" ? "selected" : ""}`}
              onClick={() => setVehicle("van")}
            >
              <img src="/van.png" alt="Van" className="vehicle-icon" />
              <p>Van</p>
            </div>
            <div
              className={`vehicle-option ${vehicle === "motorcycle" ? "selected" : ""}`}
              onClick={() => setVehicle("motorcycle")}
            >
              <img src="/motorcycle.png" alt="Motorcycle" className="vehicle-icon" />
              <p>Motorcycle</p>
            </div>
          </div>
        </div>

        {/* Distance and Unit Input */}
        <div className="carbon-input">
          <label className="carbon-label">
            {selectedJourney ? "Distance (from selected journey):" : "Distance Driven:"}
          </label>
          <input
            type="number"
            className="carbon-input-field"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            readOnly={!!selectedJourney}
          />
          <div className="carbon-radio-group">
            <label>
              <input 
                type="radio" 
                value="miles" 
                checked={unit === "miles"} 
                onChange={() => setUnit("miles")}
                disabled={!!selectedJourney}
              /> Miles
            </label>
            <label className="ml-4">
              <input 
                type="radio" 
                value="kilometers" 
                checked={unit === "kilometers"} 
                onChange={() => setUnit("kilometers")}
                disabled={!!selectedJourney}
              /> Kilometers
            </label>
          </div>
          {selectedJourney && (
            <button 
              className="clear-journey-btn" 
              onClick={() => {
                setSelectedJourney(null);
                setDistance(100);
              }}
            >
              Clear Selected Journey
            </button>
          )}
        </div>

        {/* Fuel Type Selection */}
        <div className="carbon-input">
          <label className="carbon-label">Fuel Type:</label>
          <select className="carbon-select" value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
          </select>
        </div>

        {/* Calculate Button */}
        <button className="calculate-btn" onClick={calculateCarbon}>Calculate</button>
      </div>

      {/* Result Box on the right side */}
      <div className="carbon-result-container">
        {carbonFootprint !== null ? (
          <div className="carbon-result-box">
            <img src="/envr.png" alt="Result Icon" className="result-icon" />
            <h2 className="carbon-result-title">Your Carbon Footprint</h2>
            <p className="carbon-result-value">{carbonFootprint} metric tons of CO₂</p>
            {selectedJourney && (
              <div className="journey-details">
                <p className="journey-route">
                  {selectedJourney.startLocation} → {selectedJourney.endLocation}
                </p>
                <p className="journey-date">
                  {new Date(selectedJourney.date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="carbon-result-box empty">
            <p>Your results will appear here after calculation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Carbon;