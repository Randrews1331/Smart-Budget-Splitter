import React, { useState, useEffect } from 'react';
import axios from 'axios';
import emailjs from 'emailjs-com';
import NavBar from '../Components/NavBar';
import './splitjourney.css';


const SplitJourney = () => {
  const [journeys, setJourneys] = useState([]);
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [numPassengers, setNumPassengers] = useState(1);
  const [passengerDetails, setPassengerDetails] = useState([{ name: '', email: '' }]);
  const [selectedJourneyCost, setSelectedJourneyCost] = useState(0);
  const [paypalUsername, setPaypalUsername] = useState(''); // Single PayPal username

  useEffect(() => {
    const fetchJourneys = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/journeys', { withCredentials: true });
        setJourneys(response.data);
      } catch (error) {
        console.error('Error fetching journeys:', error);
      }
    };

    fetchJourneys();
  }, []);

  // Handle passenger count change
  const handlePassengerCountChange = (e) => {
    const count = parseInt(e.target.value);
    setNumPassengers(count);

    const newPassengerDetails = Array.from({ length: count }, (_, index) => 
      passengerDetails[index] || { name: '', email: '' }
    );
    setPassengerDetails(newPassengerDetails);
  };

  // Handle passenger detail input change
  const handlePassengerDetailChange = (index, field, value) => {
    const updatedDetails = [...passengerDetails];
    updatedDetails[index][field] = value;
    setPassengerDetails(updatedDetails);
  };

  // Handle journey selection and update cost
  const handleJourneySelect = (journey) => {
    setSelectedJourney(journey.id);
    setSelectedJourneyCost(journey.fuelCost);
  };

  // Send Emails via Email.js
  const handleConfirm = () => {
    if (!selectedJourney) {
      alert("Please select a journey before confirming.");
      return;
    }

    if (!paypalUsername) {
      alert("Please enter your PayPal username.");
      return;
    }

    const splitCost = (selectedJourneyCost / numPassengers).toFixed(2);
    const paypalLink = `https://www.paypal.me/${paypalUsername}/${splitCost}`;

    passengerDetails.forEach(passenger => {
      const templateParams = {
        to_name: passenger.name,
        to_email: passenger.email,
        journey_id: selectedJourney,
        split_cost: splitCost,
        paypal_link: paypalLink,
      };

      emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID_2,  // Use Service 2's environment variable
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID_2, // Use Service 2's Template ID
        templateParams,
        process.env.REACT_APP_EMAILJS_USER_ID_2   // Use Service 2's Public Key
      )
      .then(response => {
        console.log('Email sent successfully:', response);
        alert(`Email sent to ${passenger.email}`);
      })
      .catch(error => {
        console.error('Error sending email:', error);
      });
    });
  };

  return (
    <div className="split-journey-container">
      <NavBar />
      <div className="split-journey-content">
        <h2>Split Journey Cost</h2>

        {/* Select number of passengers */}
        <div className="passenger-selection">
          <label>Select number of passengers:</label>
          <select value={numPassengers} onChange={handlePassengerCountChange}>
            {[...Array(6)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>

        {/* PayPal Username Input (for the person collecting money) */}
        <div className="paypal-username">
          <label>Enter Your PayPal Username:</label>
          <input
            type="text"
            value={paypalUsername}
            onChange={(e) => setPaypalUsername(e.target.value)}
            placeholder="Enter PayPal username"
          />
        </div>

        {/* Journey carousel */}
        <div className="journey-carousel">
          <h3>Select a Journey</h3>
          <div className="carousel">
            {journeys.map((journey, index) => (
              <div 
                key={journey.id} 
                className={`carousel-item ${selectedJourney === journey.id ? 'selected' : ''}`}
                onClick={() => handleJourneySelect(journey)}
              >
                <p><strong>Journey ID:</strong> {journey.id}</p>
                <p><strong>Distance:</strong> {journey.distance} miles</p>
                <p><strong>Fuel Cost:</strong> £{journey.fuelCost}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Passenger details form */}
        <div className="passenger-details">
          <h3>Passenger Information</h3>
          {passengerDetails.map((passenger, index) => (
            <div key={index} className="passenger-entry">
              <label>Passenger {index + 1} Name:</label>
              <input
                type="text"
                value={passenger.name}
                onChange={(e) => handlePassengerDetailChange(index, 'name', e.target.value)}
                placeholder="Enter name"
              />

              <label>Passenger {index + 1} Email:</label>
              <input
                type="email"
                value={passenger.email}
                onChange={(e) => handlePassengerDetailChange(index, 'email', e.target.value)}
                placeholder="Enter email"
              />
            </div>
          ))}
        </div>

        {/* Confirm button */}
        <button className="confirm-split-btn" onClick={handleConfirm}>
          Confirm Split & Send Emails
        </button>
      </div>
    </div>
  );
};

export default SplitJourney;
