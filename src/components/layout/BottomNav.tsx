import { NavLink } from "react-router-dom";
import { BookOpen, ClipboardList, Home, PlusCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Nyumbani", icon: Home, end: true },
  { to: "/huduma", label: "Huduma", icon: ClipboardList },
  { to: "/post", label: "Post", icon: PlusCircle, primary: true },
  { to: "/jifunze", label: "Jifunze", icon: BookOpen },
  { to: "/wasifu", label: "Wasifu", icon: User },
];

const BottomNav = () => {
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
                        ? "h-10 w-10 -translate-y-1 bg-primary text-primary-foreground shadow-md shadow-primary/30"
                        : "h-7 w-9",
                      !primary && isActive && "bg-accent"
                    )}
                  >
                    <Icon
                      className={primary ? "h-5 w-5" : "h-5 w-5"}
                      strokeWidth={isActive || primary ? 2.4 : 1.8}
                    />
                  </span>
                  <span>{label}</span>
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
