import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Minus, Package, Plus, Search, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import CategoryChip from "@/components/CategoryChip";
import ImagePreview from "@/components/ImagePreview";
import QueryState from "@/components/QueryState";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/hooks/useApi";
import { useLanguage } from "@/i18n/LanguageContext";
import type { StringKey } from "@/i18n/strings";
import { formatTZS } from "@/lib/utils";
import type { Product, ProductCategory } from "@/types";

const CATEGORIES: { id: ProductCategory; emoji: string }[] = [
  { id: "mbegu", emoji: "🌾" },
  { id: "mbolea", emoji: "🧪" },
  { id: "vifaa", emoji: "🛠️" },
  { id: "dawa", emoji: "🧴" },
  { id: "mifugo", emoji: "🐄" },
];

const ProductCard = ({ product }: { product: Product }) => {
  const { t } = useLanguage();
  const { lines, add, setQuantity } = useCart();
  const inCart = lines.find((l) => l.product.id === product.id)?.quantity ?? 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-[22px] border border-border/70 bg-card">
      <div className="relative aspect-[4/3] bg-chip">
        {product.image ? (
          <ImagePreview src={product.image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <Package className="absolute inset-0 m-auto h-10 w-10 text-emerald/50" />
        )}
        {!product.inStock && (
          <span className="absolute left-2 top-2 rounded-full bg-destructive px-2 py-0.5 text-[11px] font-semibold text-white">
            {t("shop.out")}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-semibold leading-snug">{product.name}</p>
        <p className="text-xs text-muted-foreground">{product.unit}</p>
        <p className="mt-auto pt-1 font-display text-base font-bold text-emerald">{formatTZS(product.price)}</p>
        {product.inStock && product.stock <= 5 && (
          <p className="text-[11px] font-medium text-[#B8741A]">
            {product.stock} {t("shop.left")}
          </p>
        )}
        {inCart > 0 ? (
          <div className="mt-1 flex items-center justify-between rounded-full bg-chip p-1">
            <button type="button" onClick={() => setQuantity(product.id, inCart - 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-card" aria-label="-">
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold tabular-nums">{inCart}</span>
            <button
              type="button"
              disabled={inCart >= product.stock}
              onClick={() => setQuantity(product.id, inCart + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald text-white disabled:opacity-40"
              aria-label="+"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={!product.inStock}
            onClick={() => {
              add(product);
              toast.success(t("shop.added"));
            }}
            className="mt-1 flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-emerald text-sm font-semibold text-white transition hover:bg-emerald/90 disabled:bg-muted disabled:text-muted-foreground"
          >
            <ShoppingCart className="h-4 w-4" /> {t("shop.add")}
          </button>
        )}
      </div>
    </article>
  );
};

const Bidhaa = () => {
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const { data: products = [], isLoading, isError, refetch } = useProducts();
  const { count, total } = useCart();
  const [category, setCategory] = useState<ProductCategory | "all">("all");
  const [query, setQuery] = useState(params.get("q") ?? "");
  const dockRef = useRef<HTMLAnchorElement>(null);
  const [dockInView, setDockInView] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)),
    );
  }, [products, category, query]);

  useLayoutEffect(() => {
    const el = dockRef.current;
    if (!el) {
      setDockInView(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setDockInView(entry.isIntersecting),
      { rootMargin: "0px 0px -88px 0px", threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [count, visible.length]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">{t("shop.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("shop.sub")}</p>
      </div>

      <label className="flex items-center gap-2 rounded-full border bg-card px-4 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("shop.search")}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </label>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        <CategoryChip label={t("shop.all")} emoji="🛒" active={category === "all"} onClick={() => setCategory("all")} />
        {CATEGORIES.map((c) => (
          <CategoryChip
            key={c.id}
            label={t(`shop.cat_${c.id}` as StringKey)}
            emoji={c.emoji}
            active={category === c.id}
            onClick={() => setCategory(c.id)}
          />
        ))}
      </div>

      <QueryState isLoading={isLoading} isError={isError} onRetry={refetch} empty={!visible.length} emptyText={t("shop.empty")}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </QueryState>

      <Link
        to="/omba-oda"
        className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-emerald/45 bg-background p-4"
      >
        <span className="text-sm font-semibold">{t("shop.not_found")}</span>
        <span className="rounded-full bg-emerald px-3.5 py-2 text-xs font-semibold text-white">{t("shop.request_it")}</span>
      </Link>

      {count > 0 && (
        <Link ref={dockRef} to="/kikapu" className="btn-lime w-full justify-between px-5 text-base shadow-xl">
          <span className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> {t("shop.cart")} · {count}
          </span>
          <span className="tabular-nums">{formatTZS(total)}</span>
        </Link>
      )}

      {count > 0 && !dockInView && (
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-30 min-[901px]:left-[268px]">
          <div className="pointer-events-auto mx-auto w-full max-w-[1280px] px-[clamp(18px,3vw,36px)]">
            <Link to="/kikapu" className="btn-lime w-full justify-between px-5 text-base shadow-xl">
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" /> {t("shop.cart")} · {count}
              </span>
              <span className="tabular-nums">{formatTZS(total)}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bidhaa;
