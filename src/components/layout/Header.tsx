import { Link } from "react-router-dom";
import { Bell, Search, Sprout } from "lucide-react";
import { useApp } from "@/context/AppContext";

const Header = () => {
  const { unreadCount } = useApp();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sprout className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            AGRIMIKA
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/utafutaji"
            aria-label="Tafuta"
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            to="/taarifa"
            aria-label="Taarifa"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                {unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
