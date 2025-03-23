
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MealJournalProvider } from "@/context/mealJournal";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useEffect } from "react";

// Pages
import HomePage from "./pages/HomePage";
import CapturePage from "./pages/Capture";
import JournalPage from "./pages/JournalPage";
import MealDetailsPage from "./pages/MealDetailsPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  // Force layout recalculation for iOS Safari
  useEffect(() => {
    // Fix for iOS Safari viewport height issues
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Allow scrolling by default, only prevent default on specific elements
    const preventOverscroll = (event: TouchEvent) => {
      const target = event.target as HTMLElement;
      
      // Only prevent if on an input, textarea, or other non-scrollable element
      if (
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || 
         target.tagName === 'TEXTAREA' ||
         target.tagName === 'BUTTON')
      ) {
        // Prevent overscroll only on these elements
        event.preventDefault();
      }
    };

    // Set initial viewport height
    setViewportHeight();
    
    // Update on resize and orientation change
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    
    // Allow scrolling by default on iOS
    document.addEventListener('touchmove', preventOverscroll, { passive: false });
    
    console.log("App initialized for mobile compatibility with scrolling enabled");
    
    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
      document.removeEventListener('touchmove', preventOverscroll);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <MealJournalProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Layout><HomePage /></Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/capture" 
                  element={
                    <ProtectedRoute>
                      <Layout><CapturePage /></Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/journal" 
                  element={
                    <ProtectedRoute>
                      <Layout><JournalPage /></Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/meal/:id" 
                  element={
                    <ProtectedRoute>
                      <Layout><MealDetailsPage /></Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MealJournalProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
