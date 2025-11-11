import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js'; // Use .js extension for browser module resolution
import { registerServiceWorker } from './serviceWorkerRegistration.js'; // Use .js extension

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log("Attempting to register service worker...");
registerServiceWorker();
console.log("Service worker registration initiated.");