
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { STLFileProvider } from "@/contexts/STLFileContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BuyerSignIn from "./pages/BuyerSignIn";
import SellerSignIn from "./pages/SellerSignIn";
import BuyerDashboard from "./pages/BuyerDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import SellerProfile from "./pages/SellerProfile";
import UploadFile from "./pages/UploadFile";
import PrinterMap from "./pages/PrinterMap";
import Messages from "./pages/Messages";
import SellerMessages from "./pages/SellerMessages";
import Marketplace from "./pages/Marketplace";
import SellerListings from "./pages/SellerListings";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <STLFileProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/buyer-signin" element={<BuyerSignIn />} />
              <Route path="/seller-signin" element={<SellerSignIn />} />
              <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
              <Route path="/seller-dashboard" element={<SellerDashboard />} />
              <Route path="/seller-profile" element={<SellerProfile />} />
              <Route path="/seller-listings" element={<SellerListings />} />
              <Route path="/create-listing" element={<CreateListing />} />
              <Route path="/edit-listing/:id" element={<EditListing />} />
              <Route path="/upload-file" element={<UploadFile />} />
              <Route path="/printer-map" element={<PrinterMap />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/seller-messages" element={<SellerMessages />} />
              <Route path="/marketplace" element={<Marketplace />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </STLFileProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
