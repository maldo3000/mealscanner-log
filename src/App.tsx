
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MealJournalProvider } from "@/context/MealJournalContext";
import Layout from "@/components/layout/Layout";

// Pages
import HomePage from "./pages/HomePage";
import CapturePage from "./pages/CapturePage";
import JournalPage from "./pages/JournalPage";
import MealDetailsPage from "./pages/MealDetailsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MealJournalProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/capture" element={<Layout><CapturePage /></Layout>} />
            <Route path="/journal" element={<Layout><JournalPage /></Layout>} />
            <Route path="/meal/:id" element={<Layout><MealDetailsPage /></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </MealJournalProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
