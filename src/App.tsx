
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
import JournalPage from './pages/JournalPage';
import MealDetailsPage from './pages/MealDetailsPage';
import AdminPage from './pages/admin/AdminPage';
import { AdminRoute } from './components/auth';
import NotFound from './pages/NotFound';

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
                <Route path="/home" element={<Layout><HomePage /></Layout>} />
                <Route path="/capture" element={<Layout><Capture /></Layout>} />
                <Route path="/journal" element={<Layout><JournalPage /></Layout>} />
                <Route path="/meal/:id" element={<Layout><MealDetailsPage /></Layout>} />
                <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
                <Route path="/subscription" element={<Layout><SubscriptionPage /></Layout>} />
                <Route path="/subscription/success" element={<Layout><SubscriptionSuccess /></Layout>} />
                
                {/* Admin route */}
                <Route path="/admin" element={<Layout><AdminRoute><AdminPage /></AdminRoute></Layout>} />
                
                {/* Not Found / 404 route - should be last */}
                <Route path="*" element={<NotFound />} />
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
