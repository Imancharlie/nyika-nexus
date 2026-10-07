import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import MobileLayout from "@/layouts/MobileLayout";
import InstallPrompt from "@/components/shared/InstallPrompt";

import Nyumbani from "@/pages/Nyumbani";
import Huduma from "@/pages/Huduma";
import ServiceDetails from "@/pages/ServiceDetails";
import ServiceRequest from "@/pages/ServiceRequest";
import Consultation from "@/pages/Consultation";
import Experts from "@/pages/Experts";
import Post from "@/pages/Post";
import CreatePost from "@/pages/CreatePost";
import Jifunze from "@/pages/Jifunze";
import LearningDetails from "@/pages/LearningDetails";
import Mikopo from "@/pages/Mikopo";
import Wasifu from "@/pages/Wasifu";
import Mipangilio from "@/pages/Mipangilio";
import Notifications from "@/pages/Notifications";
import Search from "@/pages/Search";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <InstallPrompt />
        <BrowserRouter>
          <Routes>
            <Route element={<MobileLayout />}>
              <Route path="/" element={<Nyumbani />} />
              <Route path="/huduma" element={<Huduma />} />
              <Route path="/huduma/:id" element={<ServiceDetails />} />
              <Route path="/huduma/:id/ombi" element={<ServiceRequest />} />
              <Route path="/ushauri" element={<Consultation />} />
              <Route path="/wataalamu" element={<Experts />} />
              <Route path="/post" element={<Post />} />
              <Route path="/post/unda" element={<CreatePost />} />
              <Route path="/jifunze" element={<Jifunze />} />
              <Route path="/jifunze/:id" element={<LearningDetails />} />
              <Route path="/mikopo" element={<Mikopo />} />
              <Route path="/wasifu" element={<Wasifu />} />
              <Route path="/mipangilio" element={<Mipangilio />} />
              <Route path="/taarifa" element={<Notifications />} />
              <Route path="/utafutaji" element={<Search />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
