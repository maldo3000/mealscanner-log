
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Function to initialize the application
const initializeApp = () => {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error("Root element not found");
    return;
  }
  
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (error) {
    console.error("Failed to render app:", error);
    // Display fallback content if rendering fails
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h2>Unable to load application</h2>
          <p>Please try refreshing the page.</p>
        </div>
      `;
    }
  }
};

// Execute initialization
initializeApp();

// Add a safety timeout to show content if the app doesn't load within 5 seconds
setTimeout(() => {
  const rootElement = document.getElementById("root");
  if (rootElement && rootElement.children.length === 0) {
    console.warn("Application didn't render within the timeout period, showing fallback content");
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2>Loading taking longer than expected</h2>
        <p>Please try refreshing the page.</p>
      </div>
    `;
  }
}, 5000);
