import { useEffect, useState, type ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import BrandLoader from "@/components/BrandLoader";
import DashLayout from "@/layouts/DashLayout";
import Landing from "@/pages/landing/Landing";

const Splash = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setShow(true), 320);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f2fbf5]">
      {show && <BrandLoader />}
    </div>
  );
};

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
