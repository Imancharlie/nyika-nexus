import { Link } from "react-router-dom";
import { Bell, Search, ShoppingCart } from "lucide-react";
import { useUnreadCount } from "@/hooks/useApi";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/i18n/LanguageContext";

const iconLink =
  "relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";

const Dot = ({ value }: { value: number }) =>
  value > 0 ? (
    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
      {value > 99 ? "99+" : value}
    </span>
  ) : null;

const Header = () => {
  const unreadCount = useUnreadCount();
  const { count } = useCart();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur pt-[env(safe-area-inset-top)]">
      <div className="flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/brand/mark-color.png" alt="" className="h-8 w-auto" />
          <span className="font-display text-lg font-bold tracking-tight text-navy">AGRIMIKA</span>
        </Link>

        <div className="flex items-center">
          <Link to="/utafutaji" aria-label={t("nav.search")} className={iconLink}>
            <Search className="h-5 w-5" />
          </Link>
          <Link to="/kikapu" aria-label={t("shop.cart")} className={iconLink}>
            <ShoppingCart className="h-5 w-5" />
            <Dot value={count} />
          </Link>
          <Link to="/taarifa" aria-label={t("nav.notifications")} className={iconLink}>
            <Bell className="h-5 w-5" />
            <Dot value={unreadCount} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
