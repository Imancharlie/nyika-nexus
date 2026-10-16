import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  ClipboardList,
  KeyRound,
  LayoutGrid,
  LifeBuoy,
  ListOrdered,
  LogOut,
  Menu,
  MessageSquareText,
  MessagesSquare,
  Package,
  Smartphone,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAdminQuery } from "./lib";
import { cn } from "@/lib/utils";

type Metrics = { totals: Record<string, number> };

const NAV = [
  { to: "/admin", label: "Overview", icon: BarChart3, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/orders", label: "Orders", icon: ListOrdered, badge: "ordersOpen" },
  { to: "/admin/payments", label: "Payments", icon: Wallet, badge: "paymentsPending" },
  { to: "/admin/products", label: "Products", icon: Package, badge: "lowStock" },
  { to: "/admin/services", label: "Services", icon: ClipboardList, badge: "serviceRequestsPending" },
  { to: "/admin/consultations", label: "Consultations", icon: MessagesSquare, badge: "consultationsUnanswered" },
  { to: "/admin/content", label: "Content", icon: LayoutGrid },
  { to: "/admin/support", label: "Support", icon: LifeBuoy, badge: "ticketsOpen" },
  { to: "/admin/sms", label: "SMS & Broadcasts", icon: MessageSquareText },
  { to: "/admin/integrations", label: "API settings", icon: KeyRound },
] as const;

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data: metrics } = useAdminQuery<Metrics>("/admin/metrics/");

  const signOut = () => {
    logout();
    navigate("/ingia", { replace: true });
  };

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon, ...rest }) => {
        const badge = "badge" in rest ? metrics?.totals[rest.badge] : 0;
        return (
          <NavLink
            key={to}
            to={to}
            end={"end" in rest}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-white text-forest" : "text-white/75 hover:bg-white/10 hover:text-white",
              )
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="flex-1">{label}</span>
            {!!badge && (
              <span className="rounded-full bg-lime px-2 py-0.5 text-[11px] font-bold text-forest">{badge}</span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  const sidebar = (
    <div className="flex h-full flex-col gap-3 p-4">
      <Link to="/admin" className="flex items-center gap-2.5">
        <img src="/brand/mark-light.png" alt="" className="h-9 w-auto" />
        <div>
          <img src="/brand/wordmark-light.png" alt="AGRIMIKA" className="h-3.5 w-auto" />
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[.18em] text-lime">Admin</p>
        </div>
      </Link>
      <div className="flex-1 overflow-y-auto">{nav}</div>
      <div className="space-y-2 border-t border-white/10 pt-4">
        <p className="truncate px-1 text-sm text-white/80">{user?.fullName}</p>
        <Link to="/" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/10">
          <Smartphone className="h-4 w-4" /> Open farmer app
        </Link>
        <button type="button" onClick={signOut} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/10">
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="sticky top-0 hidden h-screen bg-forest lg:block">{sidebar}</aside>

      <header className="sticky top-0 z-40 flex items-center justify-between bg-forest px-4 py-3 lg:hidden">
        <Link to="/admin" className="flex items-center gap-2">
          <img src="/brand/mark-light.png" alt="" className="h-8 w-auto" />
          <span className="font-display font-bold text-white">Admin</span>
        </Link>
        <button type="button" onClick={() => setOpen(true)} className="rounded-xl border border-white/20 p-2 text-white" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-forest">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-3 p-2 text-white" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="min-w-0 px-4 py-6 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
