import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = ({ setIsLoggedIn, setUserData }) => {
  const navigate = useNavigate();
  const [bubbles, setBubbles] = useState([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const random = (min, max) => Math.random() * (max - min) + min;

  const initializeBubbles = () => {
    const bubbleArray = [];
    for (let i = 0; i < 10; i++) {
      bubbleArray.push({
        id: i,
        top: random(0, window.innerHeight - 50),
        left: random(0, window.innerWidth - 50),
        velocityX: random(0.5, 2),
        velocityY: random(0.5, 2),
        directionX: Math.random() > 0.5 ? 1 : -1,
        directionY: Math.random() > 0.5 ? 1 : -1,
      });
    }
    setBubbles(bubbleArray);
  };

  const updatePositions = () => {
    setBubbles((prevBubbles) =>
      prevBubbles.map((bubble) => {
        let { top, left, velocityX, velocityY, directionX, directionY } = bubble;
        let newTop = top + velocityY * directionY;
        let newLeft = left + velocityX * directionX;

        if (newTop <= 0 || newTop >= window.innerHeight - 50) directionY *= -1;
        if (newLeft <= 0 || newLeft >= window.innerWidth - 50) directionX *= -1;

        return {
          ...bubble,
          top: Math.max(0, Math.min(window.innerHeight - 50, newTop)),
          left: Math.max(0, Math.min(window.innerWidth - 50, newLeft)),
          directionX,
          directionY,
        };
      })
    );
  };

  useEffect(() => {
    initializeBubbles();
    const interval = setInterval(updatePositions, 50);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = () => {
    setIsLoggingIn(true);
    window.location.href = "http://localhost:8081/auth/google?prompt=select_account&access_type=offline";
  };
  

  return (
    <div className="login-container">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="bubble"
          style={{
            top: `${bubble.top}px`,
            left: `${bubble.left}px`,
            transition: 'top 0.05s linear, left 0.05s linear',
          }}
        ></div>
      ))}

      <div className="login-box">
        <h1 className="login-title">Sign In</h1>
        <button className="login-button" onClick={handleLogin} disabled={isLoggingIn}>
          {isLoggingIn ? "Logging in..." : "Login with Google"}
        </button>
        <div className="login-text">
          <p>
            Forgot password? <a href="#">Click here</a>
          </p>
          <p>
            Don't have an account? <a href="#">Register now</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
