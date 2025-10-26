/**
 * Application Entry Point
 * 
 * This is the main entry file for the React application.
 * It initializes React, mounts the App component to the DOM, and sets up performance monitoring.
 * 
 * @module index
 */

// Core React library for building UI components
import React from 'react';
// React DOM client API for rendering React components to the browser DOM
import ReactDOM from 'react-dom/client';
// Global CSS styles applied across the entire application
import './index.css';
// Main App component containing the multi-layer visualization
import App from './App';
// Performance monitoring utility for tracking Core Web Vitals
import reportWebVitals from './reportWebVitals';

/**
 * Create React root and mount the application
 * 
 * ReactDOM.createRoot creates a root DOM node where React will render the app.
 * This uses the new React 18+ concurrent rendering API for better performance.
 * 
 * The root element (#root) is defined in public/index.html
 */
const root = ReactDOM.createRoot(document.getElementById('root'));

/**
 * Render the App component into the root element
 * 
 * React.StrictMode is a development tool that:
 * - Identifies components with unsafe lifecycles
 * - Warns about legacy string ref API usage
 * - Warns about deprecated findDOMNode usage
 * - Detects unexpected side effects
 * - Ensures reusable state
 * 
 * Note: StrictMode only runs in development mode and has no impact on production build
 */
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/**
 * Performance Monitoring
 * 
 * reportWebVitals() measures and reports Core Web Vitals:
 * - CLS (Cumulative Layout Shift): Visual stability
 * - FID (First Input Delay): Interactivity
 * - FCP (First Contentful Paint): Loading performance
 * - LCP (Largest Contentful Paint): Loading performance
 * - TTFB (Time to First Byte): Server response time
 * 
 * To log metrics to console: reportWebVitals(console.log)
 * To send to analytics: reportWebVitals(sendToAnalytics)
 * Learn more: https://bit.ly/CRA-vitals
 */
reportWebVitals();
