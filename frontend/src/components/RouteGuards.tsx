import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import DashLayout from "@/layouts/DashLayout";
import Landing from "@/pages/landing/Landing";

const Splash = () => (
  <div className="flex min-h-screen items-center justify-center bg-forest">
    <div className="flex flex-col items-center gap-4">
      <img src="/brand/mark-light.png" alt="AGRIMIKA" className="h-16 w-auto animate-pulse" />
      <Loader2 className="h-5 w-5 animate-spin text-lime" />
    </div>
  </div>
);

/** Guests see the landing page at "/" and are sent to login elsewhere; members get the app. */
export const AppShell = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Splash />;
  if (!user) {
    if (location.pathname === "/") return <Landing />;
    return <Navigate to="/ingia" replace state={{ from: location.pathname + location.search }} />;
  }
  return <DashLayout />;
};

/** Login/signup pages: already signed-in users go straight to their home. */
export const GuestOnly = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  if (user) return <Navigate to={user.isStaff ? "/admin" : "/"} replace />;
  return <>{children}</>;
};

export const RequireStaff = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/ingia" replace state={{ from: location.pathname }} />;
  if (!user.isStaff) return <Navigate to="/" replace />;
  return <Outlet />;
};
