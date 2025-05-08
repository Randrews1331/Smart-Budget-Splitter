import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import axios from 'axios';
import NavBar from '../Components/NavBar';
import './home.css';

const mapStyle = [ {
  "featureType": "water",
  "stylers": [
    { "saturation": 43 },
    { "lightness": -11 },
    { "hue": "#0088ff" }
  ]
},
{
  "featureType": "road",
  "elementType": "geometry.fill",
  "stylers": [
    { "hue": "#ff0000" },
    { "saturation": -100 },
    { "lightness": 99 }
  ]
},
{
  "featureType": "road",
  "elementType": "geometry.stroke",
  "stylers": [
    { "color": "#808080" },
    { "lightness": 54 }
  ]
},
{
  "featureType": "landscape.man_made",
  "elementType": "geometry.fill",
  "stylers": [
    { "color": "#ece2d9" }
  ]
},
{
  "featureType": "poi.park",
  "elementType": "geometry.fill",
  "stylers": [
    { "color": "#ccdca1" }
  ]
},
{
  "featureType": "road",
  "elementType": "labels.text.fill",
  "stylers": [
    { "color": "#767676" }
  ]
},
{
  "featureType": "road",
  "elementType": "labels.text.stroke",
  "stylers": [
    { "color": "#ffffff" }
  ]
},
{
  "featureType": "poi",
  "stylers": [
    { "visibility": "off" }
  ]
},
{
  "featureType": "landscape.natural",
  "elementType": "geometry.fill",
  "stylers": [
    { "visibility": "on" },
    { "color": "#b8cb93" }
  ]
}
];

const Home = () => {
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState('');
  const [distanceInMiles, setDistanceInMiles] = useState(0);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [mpgInput, setMpgInput] = useState('');
  const [mpg, setMpg] = useState(null);
  const [gallonsUsed, setGallonsUsed] = useState(null);
  const [fuelCost, setFuelCost] = useState(null);
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState(null);
  const [user, setUser] = useState(null);
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState({ lat: 51.5074, lng: -0.1278 });
  const [mapZoom, setMapZoom] = useState(12);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:8081/auth/me', { credentials: 'include' });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  // Convert start location to coordina using Google Geocoding API
  const getCoordinatesFromAddress = async (address) => {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address,
          key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
        }
      });

      if (response.data.status === 'OK') {
        const location = response.data.results[0].geometry.location;
        return location;
      } else {
        throw new Error('Failed to get coordinates');
      }
    } catch (err) {
      console.error('Error getting coordinates:', err);
      return null;
    }
  };

  const fetchFuelPricesNear = async (lat, lng) => {
    try {
      const response = await axios.get('http://localhost:8080/https://storelocator.asda.com/fuel_prices_data.json');
      const stations = response.data.stations;

      if (stations.length > 0) {
        // Find nearest station
        const nearest = stations.reduce((prev, curr) => {
          const distPrev = Math.hypot(prev.lat - lat, prev.lng - lng);
          const distCurr = Math.hypot(curr.lat - lat, curr.lng - lng);
          return distCurr < distPrev ? curr : prev;
        });

        const e10PricePerLiter = nearest.prices.E10 / 100;
        setFuelPricePerLiter(e10PricePerLiter);
      }
    } catch (error) {
      console.error('Error fetching fuel prices:', error);
      alert('Could not retrieve fuel prices. Please try again later.');
    }
  };

  const handleCalculateRoute = async () => {
    if (!start || !end) {
      alert('Please enter both start and end locations.');
      return;
    }

    setIsCalculating(true);

    // Get coordinates and fetch local fuel price
    const coords = await getCoordinatesFromAddress(start);
    if (coords) {
      await fetchFuelPricesNear(coords.lat, coords.lng);
    }
  };

  const handleDirectionsCallback = (result, status) => {
    if (status === 'OK') {
      setDirectionsResponse(result);
      const distanceText = result.routes[0].legs[0].distance.text;
      setDistance(distanceText);

      let miles = parseFloat(distanceText.replace(/[^\d.]/g, ''));
      if (distanceText.includes('km')) {
        miles = miles * 0.621371;
      }

      setDistanceInMiles(miles.toFixed(2));

      if (mapRef.current) {
        const bounds = new window.google.maps.LatLngBounds();
        result.routes[0].legs[0].steps.forEach(step => {
          bounds.extend(step.start_location);
          bounds.extend(step.end_location);
        });
        mapRef.current.fitBounds(bounds);
        const newCenter = bounds.getCenter();
        setMapCenter({ lat: newCenter.lat(), lng: newCenter.lng() });
        setMapZoom(mapRef.current.getZoom());
      }
    } else {
      console.error('Directions request failed:', status);
    }
    setIsCalculating(false);
  };

  const handleMpgSubmit = () => {
    if (!mpgInput || isNaN(mpgInput) || mpgInput <= 0) {
      alert('Please enter a valid MPG value.');
      return;
    }

    setMpg(parseFloat(mpgInput));
    const gallons = distanceInMiles / parseFloat(mpgInput);
    setGallonsUsed(gallons.toFixed(2));

    if (fuelPricePerLiter) {
      const litersUsed = gallons * 4.54609;
      const totalFuelCost = litersUsed * fuelPricePerLiter;
      setFuelCost(totalFuelCost.toFixed(2));
    } else {
      alert('Fuel price data is not available.');
    }

    if (start && end && mpgInput) {
      setIsSubmitEnabled(true);
    }
  };

  const handleFinalSubmit = async () => {
    if (!user) {
      alert('You must be logged in to submit a journey.');
      return;
    }

    try {
      const journeyData = {
        userId: user.id,
        startLocation: start,
        endLocation: end,
        distance: distanceInMiles,
        mpg,
        fuelCost,
        date: new Date().toISOString(),
      };

      const response = await fetch('http://localhost:8081/api/journeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(journeyData),
      });

      if (response.ok) {
        alert('Journey details have been submitted successfully!');
      } else {
        console.error('Failed to submit journey:', await response.json());
        alert('Failed to submit journey. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting journey:', error);
      alert('An error occurred while submitting the journey.');
    }
  };

  return (
    <div className="home-container">
      <NavBar />
      <div className="home-content">
        {isLoadingUser ? (
          <p>Loading user data...</p>
        ) : (
          <>
            <div className="map-container">
              <GoogleMap
                key={`${mapCenter.lat}-${mapCenter.lng}`}
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={mapCenter}
                zoom={mapZoom}
                options={{ styles: mapStyle, disableDefaultUI: true, minZoom: 5, maxZoom: 18 }}
                onLoad={map => (mapRef.current = map)}
              >
                {isCalculating && start && end && (
                  <DirectionsService
                    options={{ destination: end, origin: start, travelMode: 'DRIVING' }}
                    callback={handleDirectionsCallback}
                  />
                )}
                {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
              </GoogleMap>
            </div>

            <div className="controls-container">
              <h3>Plan Your Journey</h3>

              {!user && (
                <div className="login-prompt">
                  <p>
                    Please <a href="http://localhost:8081/auth/google">log in</a> to submit your journey details.
                  </p>
                </div>
              )}

              <input type="text" placeholder="Start Location" value={start} onChange={e => setStart(e.target.value)} className="input" />
              <input type="text" placeholder="End Location" value={end} onChange={e => setEnd(e.target.value)} className="input" />

              <button onClick={handleCalculateRoute} className="button">
                Calculate Route
              </button>

              {distance && <h4>Total Distance: {distanceInMiles} miles</h4>}

              <label>Enter Your Car's MPG:</label>
              <input type="number" placeholder="Enter MPG" value={mpgInput} onChange={e => setMpgInput(e.target.value)} className="input" />

              <button onClick={handleMpgSubmit} className="button">
                Submit MPG
              </button>

              {mpg && (
                <>
                  <h4>Estimated MPG: {mpg} miles per gallon</h4>
                  <h4>Estimated Gallons Used: {gallonsUsed} gallons</h4>
                  {fuelCost && <h4>Estimated Fuel Cost: £{fuelCost}</h4>}
                </>
              )}

              <button onClick={handleFinalSubmit} className="button" disabled={!isSubmitEnabled}>
                Submit Journey
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
