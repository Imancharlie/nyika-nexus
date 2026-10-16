import { NavLink } from "react-router-dom";
import { BookOpen, Home, LayoutGrid, Newspaper, User } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { StringKey } from "@/i18n/strings";

const items: { to: string; label: StringKey; icon: typeof Home; end?: boolean }[] = [
  { to: "/", label: "nav.home", icon: Home, end: true },
  { to: "/huduma", label: "dash.app_services", icon: LayoutGrid },
  { to: "/post", label: "nav.post", icon: Newspaper },
  { to: "/jifunze", label: "nav.learn", icon: BookOpen },
  { to: "/wasifu", label: "nav.profile", icon: User },
];

const BottomNav = () => {
  const { t } = useLanguage();
  return (
    <nav className="tabbar" aria-label={t("shell.nav_main")}>
      <ul>
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end}>
              {({ isActive }) => (
                <>
                  <Icon className="ic" strokeWidth={isActive ? 2.4 : 1.8} />
                  <span>{t(label)}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BottomNav;
