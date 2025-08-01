import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { TRPCProvider } from "@/lib/trpc-provider";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const App = () => (
  <TRPCProvider>
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="collabhub-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
                      <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/register" element={<Register />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </TRPCProvider>
);

export default App;
