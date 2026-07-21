import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { lazy, Suspense } from "react";
import Navbar from "./components/Navbar";

// Lazy loaded pages
const Home = lazy(() => import("./pages/Home"));
const Auth = lazy(() => import("./pages/Auth"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const Favourites = lazy(() => import("./pages/Favourites"));
const AgentDashboard = lazy(() => import("./pages/AgentDashboard"));
const CreateProperty = lazy(() => import("./pages/CreateProperty"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OAuthConsent = lazy(() => import("./pages/OAuthConsent"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/property/:id" element={<PropertyDetail />} />
              <Route path="/favourites" element={<Favourites />} />
              <Route path="/dashboard" element={<AgentDashboard />} />
              <Route path="/dashboard/create" element={<CreateProperty />} />
              <Route path="/listings/edit/:id" element={<CreateProperty />} />
              <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
