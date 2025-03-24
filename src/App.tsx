
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import CapturePage from './pages/Capture';
import JournalPage from './pages/JournalPage';
import MealDetailsPage from './pages/MealDetailsPage';
import NotFound from './pages/NotFound';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import { ThemeProvider } from "./components/ui/theme-provider";
import { AuthProvider } from './context/auth';
import { MealJournalProvider } from './context/mealJournal';
import { Toaster } from "./components/ui/toaster";
import { SubscriptionProvider } from './context/subscription';
import SubscriptionPage from './pages/Subscription';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/admin';
import OnboardingPage from './pages/OnboardingPage';

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="system" storageKey="mealscanner-theme">
        <AuthProvider>
          <SubscriptionProvider>
            <MealJournalProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                
                {/* Protected routes */}
                <Route
                  path="/onboarding"
                  element={
                    <ProtectedRoute>
                      <OnboardingPage />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/home"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <HomePage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/capture"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <CapturePage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/journal"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <JournalPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/meal/:id"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <MealDetailsPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/subscription"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SubscriptionPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ProfilePage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <Layout>
                        <AdminPage />
                      </Layout>
                    </AdminRoute>
                  }
                />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </MealJournalProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
