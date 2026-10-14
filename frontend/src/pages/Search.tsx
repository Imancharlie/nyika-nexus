import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Package, Search as SearchIcon, Users, X } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useArticles, useExperts, useGroups, usePackages, usePosts, useProducts } from "@/hooks/useApi";
import { formatTZS } from "@/lib/utils";

const suggestions = ["Magonjwa ya nyanya", "Mbolea", "Mbegu", "Fumigation", "Mkopo"];

const Search = () => {
  const [params] = useSearchParams();
  const { data: posts = [] } = usePosts();
  const { data: learningArticles = [] } = useArticles();
  const { data: experts = [] } = useExperts();
  const { data: servicePackages = [] } = usePackages();
  const { data: products = [] } = useProducts();
  const { data: groups = [] } = useGroups();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const { t } = useLanguage();
  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return null;
    return {
      products: products.filter(
        (item) => item.name.toLowerCase().includes(q) || item.category.includes(q) || item.description.toLowerCase().includes(q),
      ),
      groups: groups.filter(
        (item) => item.name.toLowerCase().includes(q) || item.crop.toLowerCase().includes(q) || item.region.toLowerCase().includes(q),
      ),
      learning: learningArticles.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      ),
      experts: experts.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.specialties.some((specialty) => specialty.toLowerCase().includes(q))
      ),
      posts: posts.filter(
        (item) =>
          item.text.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q)
      ),
      services: servicePackages.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.serviceType.toLowerCase().includes(q)
      ),
    };
  }, [q, posts, learningArticles, experts, servicePackages, products, groups]);

  const total = results
    ? results.products.length +
      results.groups.length +
      results.learning.length +
      results.experts.length +
      results.posts.length +
      results.services.length
    : 0;

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title={t("search.title")} />

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("search.ph")}
          className="rounded-full pl-9 pr-9"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label={t("search.clear")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!results && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">{t("search.suggestions")}</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setQuery(suggestion)}
                className="rounded-full border border-border/70 bg-card px-3.5 py-2 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{t("search.help")}</p>
        </div>
      )}

      {results && total === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-6 text-center">
          <p className="font-semibold">{t("search.none")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("search.none_hint")}</p>
        </div>
      )}

      {results && total > 0 && (
        <div className="space-y-6">
          {results.products.length > 0 && (
            <ResultGroup title={t("search.products")} count={results.products.length}>
              {results.products.map((item) => (
                <Link
                  key={item.id}
                  to={`/bidhaa?q=${encodeURIComponent(item.name)}`}
                  className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3"
                >
                  {item.image ? (
                    <img src={item.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  ) : (
                    <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-chip text-emerald">
                      <Package className="h-5 w-5" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.name} · {item.unit}</p>
                    <p className="text-xs font-semibold text-emerald">{formatTZS(item.price)}</p>
                  </div>
                </Link>
              ))}
            </ResultGroup>
          )}

          {results.groups.length > 0 && (
            <ResultGroup title={t("search.groups")} count={results.groups.length}>
              {results.groups.map((item) => (
                <Link
                  key={item.id}
                  to={`/vikundi/${item.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0E8F8F] text-white">
                    <Users className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.region} · {item.membersCount} {t("groups.members")}</p>
                  </div>
                </Link>
              ))}
            </ResultGroup>
          )}

          {results.learning.length > 0 && (
            <ResultGroup title={t("search.learning")} count={results.learning.length}>
              {results.learning.map((item) => (
                <Link
                  key={item.id}
                  to={`/jifunze/${item.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3"
                >
                  {item.image ? (
                    <img src={item.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  ) : (
                    <span className="h-14 w-14 shrink-0 rounded-xl bg-learn" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))}
            </ResultGroup>
          )}

          {results.experts.length > 0 && (
            <ResultGroup title={t("search.experts")} count={results.experts.length}>
              {results.experts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3"
                >
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={item.avatar} alt={item.name} />
                    <AvatarFallback>{item.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.title}</p>
                  </div>
                  <Link
                    to="/wataalamu"
                    className="ml-auto shrink-0 rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-primary"
                  >
                    {t("search.view")}
                  </Link>
                </div>
              ))}
            </ResultGroup>
          )}

          {results.services.length > 0 && (
            <ResultGroup title={t("search.services")} count={results.services.length}>
              {results.services.map((item) => (
                <Link
                  key={item.id}
                  to={`/huduma/${item.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <SearchIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))}
            </ResultGroup>
          )}

          {results.posts.length > 0 && (
            <ResultGroup title={t("search.posts")} count={results.posts.length}>
              {results.posts.map((item) => (
                <Link
                  key={item.id}
                  to="/post"
                  className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-3"
                >
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={item.avatar} alt={item.author} />
                    <AvatarFallback>{item.author.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{item.author}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{item.text}</p>
                  </div>
                </Link>
              ))}
            </ResultGroup>
          )}
        </div>
      )}
    </div>
  );
};

const ResultGroup = ({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) => (
  <section>
    <h2 className="mb-2 flex items-center justify-between text-sm font-bold">
      {title}
      <span className="text-xs font-medium text-muted-foreground">{count}</span>
    </h2>
    <div className="space-y-2">{children}</div>
  </section>
);

export default Search;
