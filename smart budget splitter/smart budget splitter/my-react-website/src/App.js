import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Home from './Pages/Home';
import MyJourneys from './Pages/myjourneys';
import Support from './Pages/support';
import Login from './Pages/login';
import SplitJourney from './Pages/splitjourney'; // Import the new page
import Carbon from './Pages/carbon'; // Import the carbon footprint page
import NavBar from './Components/NavBar';


const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (window.self !== window.top) {
      document.body.innerHTML = "<h1>Embedding is not allowed.</h1>";
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:8081/auth/me', { credentials: 'include' });
        if (response.ok) {
          const userData = await response.json();
          setUserData(userData);
          setIsLoggedIn(true);
        } else {
          setUserData(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8081/auth/logout', { credentials: 'include' });
    } catch (error) {
      console.error('Error logging out:', error);
    }
    console.log('User logged out');
    setUserData(null);
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return <p>Loading...</p>; // Prevent rendering while checking authentication
  }

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>  {/* Use environment variable */}
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Navigate to="/home" />
              ) : (
                <Login setIsLoggedIn={setIsLoggedIn} setUserData={setUserData} />
              )
            }
          />
          <Route
            path="/home"
            element={
              isLoggedIn ? (
                <div>
                  <NavBar handleLogout={handleLogout} />
                  <Home />
                </div>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/myjourneys"
            element={
              isLoggedIn ? (
                <div>
                  <NavBar handleLogout={handleLogout} />
                  <MyJourneys />
                </div>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/splitjourney"
            element={
              isLoggedIn ? (
                <div>
                  <NavBar handleLogout={handleLogout} />
                  <SplitJourney />
                </div>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/support"
            element={
              isLoggedIn ? (
                <div>
                  <NavBar handleLogout={handleLogout} />
                  <Support />
                </div>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/carbon"
            element={
              isLoggedIn ? (
                <div>
                  <NavBar handleLogout={handleLogout} />
                  <Carbon />
                </div>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
