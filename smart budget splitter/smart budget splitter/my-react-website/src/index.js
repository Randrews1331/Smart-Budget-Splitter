import React from 'react';
import ReactDOM from 'react-dom';
import { LoadScript } from '@react-google-maps/api';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <App />
    </LoadScript>
  </React.StrictMode>,
  document.getElementById('root')
);
