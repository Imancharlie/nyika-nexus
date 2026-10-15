import { useEffect, useState, type FormEvent } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Box,
  GraduationCap,
  Home,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  Menu,
  Search,
  Settings,
  ShoppingCart,
  User,
  Users,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useUnreadCount } from "@/hooks/useApi";
import { useLanguage } from "@/i18n/LanguageContext";
import type { StringKey } from "@/i18n/strings";
import "./dash.css";

export type DashContext = { query: string };

const Wave = () => (
  <svg className="sw" viewBox="0 0 400 160" aria-hidden="true">
    <path d="M0 160C30 108 130 52 240 50 150 62 80 104 40 160Z" fill="#fff" />
    <path d="M60 160C120 90 230 52 360 40 270 72 200 116 160 160Z" fill="#C8F169" />
    <path d="M220 160C270 106 330 72 400 62V160Z" fill="#fff" />
  </svg>
);

const MAIN: { id: string; to: string; icon: LucideIcon; label: StringKey }[] = [
  { id: "muhtasari", to: "/", icon: Home, label: "shell.nav_overview" },
  { id: "huduma", to: "/#huduma", icon: LayoutGrid, label: "shell.nav_services" },
  { id: "soko", to: "/#soko", icon: Box, label: "shell.nav_market" },
  { id: "jamii", to: "/#jamii", icon: Users, label: "shell.nav_comm" },
];

const CRUMBS: [string, StringKey][] = [
  ["/bidhaa", "dash.app_shop"],
  ["/kikapu", "shell.cart"],
  ["/omba-oda", "dash.app_request"],
  ["/oda", "dash.app_orders"],
  ["/lipia", "dash.app_pay"],
  ["/vikundi", "dash.app_groups"],
  ["/huduma", "dash.app_services"],
  ["/ushauri", "dash.app_experts"],
  ["/wataalamu", "dash.app_experts"],
  ["/jifunze", "dash.app_learn"],
  ["/mikopo", "dash.app_loans"],
  ["/post", "dash.app_community"],
  ["/msaada", "dash.app_help"],
  ["/wasifu", "shell.nav_profile"],
  ["/mipangilio", "shell.nav_settings"],
  ["/taarifa", "shell.bell"],
  ["/utafutaji", "nav.search"],
];

const routeCurrent = (path: string, id: string) => {
  if (path === "/") return false;
  if (id === "soko") return ["/bidhaa", "/kikapu", "/omba-oda", "/oda", "/lipia"].some((p) => path.startsWith(p));
  if (id === "huduma") return ["/huduma", "/ushauri", "/wataalamu", "/mikopo"].some((p) => path.startsWith(p));
  if (id === "jamii") return path.startsWith("/post") || path.startsWith("/vikundi");
  return false;
};

const DashLayout = () => {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const unread = useUnreadCount();
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [spy, setSpy] = useState("muhtasari");

  const home = location.pathname === "/";
  const crumb = CRUMBS.find(([prefix]) => location.pathname.startsWith(prefix))?.[1] ?? "shell.crumb";
  const name = user?.firstName || user?.username || "";
  const initial = (name || "A").slice(0, 1).toUpperCase();

  useEffect(() => {
    document.body.classList.toggle("dash-nav-open", open);
    return () => document.body.classList.remove("dash-nav-open");
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!home || !location.hash) return;
    const el = document.getElementById(location.hash.slice(1));
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [home, location.hash]);

  useEffect(() => {
    if (!home) return;
    const ids = ["muhtasari", "soko", "huduma", "jamii"];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setSpy(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -55% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [home]);

  const search = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/utafutaji?q=${encodeURIComponent(q)}` : "/utafutaji");
  };

  const signOut = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="dash">
      <a className="skip" href="#main">{t("shell.skip")}</a>
      <div className="scrim" onClick={() => setOpen(false)} />
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <linearGradient id="dash-rg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#34C16B" />
            <stop offset="1" stopColor="#C8F169" />
          </linearGradient>
        </defs>
      </svg>

      <div className="shell">
        <aside className="side dark-zone" id="side" aria-label="Menu">
          <Link className="brand" to="/" aria-label="AGRIMIKA">
            <img className="mark" src="/brand/mark-light.png" alt="" />
            <img className="word" src="/brand/wordmark-light.png" alt="AGRIMIKA" />
          </Link>

          <div className="grp-t">{t("shell.nav_main")}</div>
          <nav className="nav">
            {MAIN.map((item) => {
              const current = home ? spy === item.id : routeCurrent(location.pathname, item.id);
              return (
                <Link key={item.id} to={item.to} aria-current={current ? "true" : undefined}>
                  <item.icon className="ic" strokeWidth={1.7} />
                  <span>{t(item.label)}</span>
                </Link>
              );
            })}
            <NavLink to="/jifunze" aria-current={location.pathname.startsWith("/jifunze") ? "true" : undefined}>
              <GraduationCap className="ic" strokeWidth={1.7} />
              <span>Agri-Learn</span>
            </NavLink>
          </nav>

          <div className="grp-t">{t("shell.nav_acct")}</div>
          <nav className="nav">
            <NavLink to="/wasifu">
              <User className="ic" strokeWidth={1.7} />
              <span>{t("shell.nav_profile")}</span>
            </NavLink>
            <NavLink to="/mipangilio">
              <Settings className="ic" strokeWidth={1.7} />
              <span>{t("shell.nav_settings")}</span>
            </NavLink>
            <NavLink to="/msaada">
              <LifeBuoy className="ic" strokeWidth={1.7} />
              <span>{t("shell.nav_help")}</span>
            </NavLink>
          </nav>

          <div className="side-bottom">
            <div className="help">
              <Wave />
              <b>{t("shell.help_h")}</b>
              <p>{t("shell.help_p")}</p>
              <Link to="/msaada">
                {t("shell.help_a")} <ArrowUpRight className="ic" />
              </Link>
            </div>
            <nav className="nav">
              <button type="button" className="nav-link" onClick={signOut}>
                <LogOut className="ic" strokeWidth={1.7} />
                <span>{t("shell.nav_logout")}</span>
              </button>
            </nav>
          </div>
        </aside>

        <div className="main">
          <header className="top">
            <button
              className="ibtn menu-btn"
              type="button"
              aria-expanded={open}
              aria-controls="side"
              aria-label={t("shell.menu")}
              onClick={() => setOpen((v) => !v)}
            >
              <Menu className="ic" />
            </button>
            <div className="crumb">
              AGRIMIKA <span style={{ padding: "0 6px", opacity: 0.5 }}>/</span> <b>{t(crumb)}</b>
            </div>
            <form className="search" onSubmit={search}>
              <Search className="ic" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("shell.search_ph")}
                aria-label={t("shell.search_ph")}
              />
            </form>
            <div className="tools">
              <div className="lang" role="group" aria-label="Language">
                <button type="button" aria-pressed={lang === "sw"} onClick={() => setLang("sw")}>SW</button>
                <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>EN</button>
              </div>
              <Link className="ibtn" to="/kikapu" aria-label={t("shell.cart")}>
                <ShoppingCart className="ic" />
                {count > 0 && <span className="count">{count > 9 ? "9+" : count}</span>}
              </Link>
              <Link className="ibtn" to="/taarifa" aria-label={t("shell.bell")}>
                <Bell className="ic" />
                {unread > 0 && <i />}
              </Link>
              <Link className="me" to="/wasifu">
                <span className="av" aria-hidden="true">{initial}</span>
                <div>
                  <b>{name}</b>
                  <small>{t("shell.role")}</small>
                </div>
              </Link>
            </div>
          </header>

          <main className="content" id="main">
            <Outlet context={{ query } satisfies DashContext} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashLayout;
