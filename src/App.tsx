
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/auth';
import { SubscriptionProvider } from './context/subscription';
import { MealJournalProvider } from './context/mealJournal';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import Capture from './pages/Capture';
import { ThemeProvider } from "@/components/ui/theme-provider"
import SubscriptionPage, { SubscriptionSuccess } from './pages/Subscription';
import Layout from './components/layout/Layout';
import { Toaster } from 'sonner';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Index from './pages/Index';

function App() {
  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <Router>
        <AuthProvider>
          <SubscriptionProvider>
            <MealJournalProvider>
              <Routes>
                {/* Public routes outside the Layout */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                
                {/* Authenticated routes with Layout */}
                <Route path="/" element={<Layout><Index /></Layout>} />
                <Route path="/home" element={<Layout><HomePage /></Layout>} />
                <Route path="/capture" element={<Layout><Capture /></Layout>} />
                <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
                <Route path="/subscription" element={<Layout><SubscriptionPage /></Layout>} />
                <Route path="/subscription/success" element={<Layout><SubscriptionSuccess /></Layout>} />
              </Routes>
              <Toaster position="top-right" richColors />
            </MealJournalProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
