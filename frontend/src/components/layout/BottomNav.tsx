import { NavLink } from "react-router-dom";
import { BookOpen, Home, Package, PlusCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import type { StringKey } from "@/i18n/strings";

const items: { to: string; label: StringKey; icon: typeof Home; end?: boolean; primary?: boolean }[] = [
  { to: "/", label: "nav.home", icon: Home, end: true },
  { to: "/bidhaa", label: "nav.shop", icon: Package },
  { to: "/post", label: "nav.post", icon: PlusCircle, primary: true },
  { to: "/jifunze", label: "nav.learn", icon: BookOpen },
  { to: "/wasifu", label: "nav.profile", icon: User },
];

const BottomNav = () => {
  const { t } = useLanguage();
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t bg-background/95 backdrop-blur safe-bottom">
      <ul className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon, end, primary }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] font-medium transition-colors",
                  primary
                    ? "text-primary"
                    : isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "flex items-center justify-center rounded-full transition-all",
                      primary
                        ? "h-11 w-11 -translate-y-1.5 bg-gradient-to-br from-lime to-mint text-forest shadow-md shadow-mint/40"
                        : "h-7 w-9",
                      !primary && isActive && "bg-accent"
                    )}
                  >
                    <Icon
                      className={primary ? "h-5 w-5" : "h-5 w-5"}
                      strokeWidth={isActive || primary ? 2.4 : 1.8}
                    />
                  </span>
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
