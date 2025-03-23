import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import AuthPage from './pages/AuthPage';
import CapturePage from './pages/Capture';
import JournalPage from './pages/JournalPage';
import MealDetailsPage from './pages/MealDetailsPage';
import NotFound from './pages/NotFound';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ThemeProvider } from "@/components/ui/theme-provider"
import { AuthProvider } from './context/AuthContext';
import { MealJournalProvider } from './context/MealJournal/MealJournalContext';
import { Toaster } from "@/components/ui/toaster"
import { SubscriptionProvider } from './context/SubscriptionContext';
import SubscriptionPage from './pages/SubscriptionPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="system" storageKey="mealscanner-theme">
        <AuthProvider>
          <SubscriptionProvider>
            <MealJournalProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                
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
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AdminPage />
                      </Layout>
                    </ProtectedRoute>
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
