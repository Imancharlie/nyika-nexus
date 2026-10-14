import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Banknote,
  BookOpen,
  Check,
  ClipboardList,
  GraduationCap,
  LifeBuoy,
  ListOrdered,
  MessagesSquare,
  Package,
  Search,
  ShieldAlert,
  ShoppingCart,
  Sprout,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import PostCard from "@/components/PostCard";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import type { StringKey } from "@/i18n/strings";
import {
  useArticles,
  useCategories,
  useOrders,
  usePackages,
  usePayments,
  usePostActions,
  usePosts,
} from "@/hooks/useApi";
import { cn, formatTZS } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const APPS: { to: string; label: StringKey; icon: LucideIcon; color: string }[] = [
  { to: "/jifunze", label: "dash.app_learn", icon: GraduationCap, color: "#0B7A43" },
  { to: "/bidhaa", label: "dash.app_shop", icon: Package, color: "#12A05A" },
  { to: "/omba-oda", label: "dash.app_request", icon: ShoppingCart, color: "#E8801F" },
  { to: "/oda", label: "dash.app_orders", icon: ListOrdered, color: "#1F6FD0" },
  { to: "/lipia", label: "dash.app_pay", icon: Wallet, color: "#7A4FC4" },
  { to: "/vikundi", label: "dash.app_groups", icon: Users, color: "#0E8F8F" },
  { to: "/huduma", label: "dash.app_services", icon: ClipboardList, color: "#0A3D73" },
  { to: "/ushauri", label: "dash.app_experts", icon: MessagesSquare, color: "#B8741A" },
  { to: "/mikopo", label: "dash.app_loans", icon: Banknote, color: "#6B4FA0" },
  { to: "/post", label: "dash.app_community", icon: Sprout, color: "#34C16B" },
  { to: "/msaada", label: "dash.app_help", icon: LifeBuoy, color: "#D93A29" },
  { to: "/utafutaji", label: "dash.app_more", icon: Search, color: "#3C5A49" },
];

const TRACK: OrderStatus[] = ["imepokelewa", "inaandaliwa", "njiani", "imefika"];

const greetingKey = (): StringKey => {
  const hour = new Date().getHours();
  if (hour < 12) return "dash.greeting_morning";
  if (hour < 17) return "dash.greeting_afternoon";
  return "dash.greeting_evening";
};

const Nyumbani = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { data: orders = [] } = useOrders();
  const { data: payments = [] } = usePayments();
  const { data: articles = [] } = useArticles();
  const { data: categories = [] } = useCategories();
  const { data: packages = [] } = usePackages();
  const { data: posts = [] } = usePosts();
  const { like, save, comment } = usePostActions();

  const activeOrder = orders.find((o) => o.status !== "imeghairiwa" && o.status !== "imefika") ?? orders[0];
  const stepIndex = activeOrder ? TRACK.indexOf(activeOrder.status) : -1;
  const featured = packages.find((pkg) => pkg.featured) ?? packages[0];
  const lessons = articles.slice(0, 3);
  const latestPost = posts[0];

  const search = (e: FormEvent) => {
    e.preventDefault();
    navigate(query.trim() ? `/utafutaji?q=${encodeURIComponent(query.trim())}` : "/utafutaji");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <section className="relative -mx-4 -mt-4 overflow-hidden bg-hero px-5 pb-6 pt-6 text-white">
        <svg className="absolute inset-x-0 bottom-0 w-full opacity-25" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 120V60C70 30 150 20 240 32 150 42 80 74 40 120Z" fill="#C8F169" />
          <path d="M60 120C120 64 230 34 360 26 270 50 200 84 150 120Z" fill="#fff" opacity=".5" />
          <path d="M220 120C270 76 330 48 400 40V120Z" fill="#C8F169" />
        </svg>
        <div className="relative">
          <p className="text-sm font-medium text-white/80">{t(greetingKey())},</p>
          <h1 className="font-display text-[28px] font-bold leading-tight tracking-[-.03em]">
            {user?.firstName || user?.username} 🌱
          </h1>
          <form onSubmit={search} className="mt-4">
            <label className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/95 px-4 py-3 text-forest shadow-lg">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("dash.search")}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
          </form>
        </div>
      </section>

      {user && !user.phoneVerified && (
        <div className="flex items-start gap-3 rounded-2xl border border-gold/60 bg-gold/15 p-3 text-sm">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#B8741A]" />
          <p>{t("dash.verify_banner")}</p>
        </div>
      )}

      {/* App grid */}
      <section>
        <h2 className="mb-3 text-base font-bold">{t("dash.services")}</h2>
        <div className="grid grid-cols-4 gap-x-2 gap-y-4">
          {APPS.map(({ to, label, icon: Icon, color }) => (
            <Link key={to} to={to} className="group flex flex-col items-center gap-1.5 text-center">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-[18px] text-white shadow-md transition-transform group-hover:-translate-y-0.5"
                style={{ background: color, boxShadow: `0 8px 18px -10px ${color}` }}
              >
                <Icon className="h-6 w-6" strokeWidth={1.8} />
              </span>
              <span className="text-[11.5px] font-semibold leading-tight">{t(label)}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Order tracker */}
      <section className="rounded-[28px] border border-border/70 bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold">{t("dash.track_title")}</h2>
          <Link to="/oda" className="text-sm font-semibold text-emerald">{t("dash.see_all")}</Link>
        </div>
        {activeOrder ? (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{activeOrder.code}</p>
                <p className="text-xs text-muted-foreground">
                  {activeOrder.items.length} {t("orders.items")} · {formatTZS(activeOrder.total)}
                </p>
              </div>
              {activeOrder.paymentStatus !== "imelipwa" && activeOrder.status !== "imeghairiwa" && (
                <Link to="/lipia" className="rounded-full bg-emerald px-3.5 py-2 text-xs font-semibold text-white">
                  {t("orders.pay")}
                </Link>
              )}
            </div>
            {activeOrder.status === "imeghairiwa" ? (
              <p className="text-sm font-semibold text-destructive">{t("order.imeghairiwa")}</p>
            ) : (
              <ol className="flex items-start">
                {TRACK.map((status, i) => {
                  const done = i < stepIndex || (i === stepIndex && status === "imefika");
                  const now = i === stepIndex && status !== "imefika";
                  return (
                    <li key={status} className="relative flex flex-1 flex-col items-center gap-1.5 text-center">
                      {i > 0 && (
                        <span
                          className={cn(
                            "absolute right-1/2 top-3 h-[3px] w-full -translate-y-1/2",
                            i <= stepIndex ? "bg-gradient-to-r from-leaf to-emerald" : "bg-border",
                          )}
                        />
                      )}
                      <span
                        className={cn(
                          "relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2",
                          done && "border-emerald bg-emerald text-white",
                          now && "border-leaf bg-card ring-4 ring-leaf/25",
                          !done && !now && "border-border bg-card",
                        )}
                      >
                        {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                      </span>
                      <span className={cn("text-[11px]", done || now ? "font-semibold" : "text-muted-foreground")}>
                        {t(`order.${status}` as StringKey)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-emerald/40 bg-background p-4">
            <p className="text-sm text-muted-foreground">{t("dash.no_orders")}</p>
            <Link to="/bidhaa" className="shrink-0 rounded-full bg-emerald px-3.5 py-2 text-xs font-semibold text-white">
              {t("dash.shop_now")}
            </Link>
          </div>
        )}
      </section>

      {/* Payments */}
      <section className="rounded-[28px] bg-navy p-5 text-white">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <Wallet className="h-5 w-5" />
            </span>
            {t("dash.payments")}
          </h2>
          <Link to="/lipia" className="text-sm font-semibold text-lime">{t("dash.see_all")}</Link>
        </div>
        {payments.length ? (
          <div className="space-y-2.5">
            {payments.slice(0, 3).map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{p.description}</p>
                  <p className="text-xs text-white/70">{p.reference}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-sm font-semibold tabular-nums">{formatTZS(p.amount)}</p>
                  <p className={cn("text-xs font-medium", p.status === "imelipwa" ? "text-[#9BE564]" : p.status === "inasubiri" ? "text-gold" : "text-red-300")}>
                    {t(`pay.${p.status}` as StringKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/80">{t("dash.no_payments")}</p>
        )}
      </section>

      {/* Learning */}
      {lessons.length > 0 && (
        <section className="rounded-[28px] bg-learn p-5 text-white">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <BookOpen className="h-5 w-5" />
              </span>
              {t("dash.learn_title")}
            </h2>
            <Link to="/jifunze" className="text-sm font-semibold text-lime">{t("dash.see_all")}</Link>
          </div>
          <div className="space-y-2.5">
            {lessons.map((article) => {
              const category = categories.find((c) => c.id === article.categoryId);
              return (
                <Link
                  key={article.id}
                  to={`/jifunze/${article.id}`}
                  className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 transition-colors hover:bg-white/15"
                >
                  <span className="text-xl">{category?.emoji ?? "🌱"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{article.title}</p>
                    <p className="text-xs text-white/70">
                      {category?.name} · {article.readTime} min
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-lime" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured service */}
      {featured && (
        <section>
          <h2 className="mb-3 text-base font-bold">{t("dash.featured_service")}</h2>
          <Link to={`/huduma/${featured.id}`} className="flex overflow-hidden rounded-[24px] border border-border/70 bg-card">
            {featured.image && <img src={featured.image} alt="" className="h-auto w-28 object-cover" loading="lazy" />}
            <div className="flex-1 p-4">
              <p className="text-xs font-semibold text-emerald">{featured.serviceType}</p>
              <p className="font-bold leading-snug">{featured.name}</p>
              <p className="mt-1 text-sm font-semibold">{formatTZS(featured.price)}</p>
            </div>
          </Link>
        </section>
      )}

      {/* Community */}
      {latestPost && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold">{t("dash.community_title")}</h2>
            <Link to="/post" className="text-sm font-semibold text-emerald">{t("dash.see_all")}</Link>
          </div>
          <PostCard
            post={latestPost}
            onLike={() => like.mutate(latestPost.id)}
            onSave={() => save.mutate(latestPost.id)}
            onComment={(text) => comment.mutate({ id: latestPost.id, text })}
          />
        </section>
      )}
    </div>
  );
};

export default Nyumbani;
