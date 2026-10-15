import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AppShell, GuestOnly, RequireStaff } from "@/components/RouteGuards";
import InstallPrompt from "@/components/shared/InstallPrompt";

import Signup from "@/pages/auth/Signup";
import Login from "@/pages/auth/Login";
import VerifyPhone from "@/pages/auth/VerifyPhone";
import ForgotPassword from "@/pages/auth/ForgotPassword";

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
import Bidhaa from "@/pages/Bidhaa";
import Kikapu from "@/pages/Kikapu";
import OmbaOda from "@/pages/OmbaOda";
import Oda from "@/pages/Oda";
import Lipia from "@/pages/Lipia";
import Vikundi from "@/pages/Vikundi";
import GroupDetail from "@/pages/GroupDetail";
import Msaada from "@/pages/Msaada";
import TicketDetail from "@/pages/TicketDetail";
import NotFound from "@/pages/NotFound";

const AdminLayout = lazy(() => import("@/admin/AdminLayout"));
const AdminOverview = lazy(() => import("@/admin/pages/Overview"));
const AdminUsers = lazy(() => import("@/admin/pages/Users"));
const AdminOrders = lazy(() => import("@/admin/pages/Orders"));
const AdminPayments = lazy(() => import("@/admin/pages/Payments"));
const AdminProducts = lazy(() => import("@/admin/pages/Products"));
const AdminServices = lazy(() => import("@/admin/pages/Services"));
const AdminConsultations = lazy(() => import("@/admin/pages/Consultations"));
const AdminContent = lazy(() => import("@/admin/pages/Content"));
const AdminSupport = lazy(() => import("@/admin/pages/Support"));
const AdminSms = lazy(() => import("@/admin/pages/Sms"));
const AdminIntegrations = lazy(() => import("@/admin/pages/Integrations"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-center" />
            <InstallPrompt />
            <BrowserRouter>
              <Suspense fallback={null}>
                <Routes>
                  <Route path="/jisajili" element={<GuestOnly><Signup /></GuestOnly>} />
                  <Route path="/ingia" element={<GuestOnly><Login /></GuestOnly>} />
                  <Route path="/thibitisha" element={<VerifyPhone />} />
                  <Route path="/sahau-nenosiri" element={<GuestOnly><ForgotPassword /></GuestOnly>} />

                  <Route path="/admin" element={<RequireStaff />}>
                    <Route element={<AdminLayout />}>
                      <Route index element={<AdminOverview />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="payments" element={<AdminPayments />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="services" element={<AdminServices />} />
                      <Route path="consultations" element={<AdminConsultations />} />
                      <Route path="content" element={<AdminContent />} />
                      <Route path="support" element={<AdminSupport />} />
                      <Route path="sms" element={<AdminSms />} />
                      <Route path="integrations" element={<AdminIntegrations />} />
                    </Route>
                  </Route>

                  <Route element={<AppShell />}>
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
                    <Route path="/bidhaa" element={<Bidhaa />} />
                    <Route path="/kikapu" element={<Kikapu />} />
                    <Route path="/omba-oda" element={<OmbaOda />} />
                    <Route path="/oda" element={<Oda />} />
                    <Route path="/lipia" element={<Lipia />} />
                    <Route path="/vikundi" element={<Vikundi />} />
                    <Route path="/vikundi/:id" element={<GroupDetail />} />
                    <Route path="/msaada" element={<Msaada />} />
                    <Route path="/msaada/:id" element={<TicketDetail />} />
                    <Route path="/wasifu" element={<Wasifu />} />
                    <Route path="/mipangilio" element={<Mipangilio />} />
                    <Route path="/taarifa" element={<Notifications />} />
                    <Route path="/utafutaji" element={<Search />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
