
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/auth';
import ProfilePage from './pages/ProfilePage';
import Capture from './pages/Capture';
import { ThemeProvider } from "@/components/ui/theme-provider"
import SubscriptionPage, { SubscriptionSuccess } from './pages/Subscription';

function App() {
  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Capture />} />
            <Route path="/capture" element={<Capture />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/subscription/success" element={<SubscriptionSuccess />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
