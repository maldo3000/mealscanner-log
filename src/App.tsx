
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

function App() {
  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <Router>
        <AuthProvider>
          <SubscriptionProvider>
            <MealJournalProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<Capture />} />
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/capture" element={<Capture />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/subscription" element={<SubscriptionPage />} />
                  <Route path="/subscription/success" element={<SubscriptionSuccess />} />
                </Routes>
              </Layout>
              <Toaster position="top-right" richColors />
            </MealJournalProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
