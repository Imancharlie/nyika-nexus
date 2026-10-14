import { Link } from "react-router-dom";
import { MessagesSquare, ShieldCheck } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import QueryState from "@/components/QueryState";
import { usePackages } from "@/hooks/useApi";
import { useLanguage } from "@/i18n/LanguageContext";

const Huduma = () => {
  const { t } = useLanguage();
  const { data: packages, isLoading, isError, refetch } = usePackages();
  return (
    <div className="space-y-5 animate-fade-in">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">{t("svc.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("svc.sub")}</p>
      </section>

      <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div className="text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">{t("svc.not_shop")}</p>
          <p>{t("svc.not_shop_text")}</p>
        </div>
      </div>

      <QueryState isLoading={isLoading} isError={isError} onRetry={refetch}>
        <div className="space-y-4">
          {packages?.map((pkg) => (
            <ServiceCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </QueryState>

      <Link
        to="/ushauri"
        className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/50 bg-primary/5 px-4 py-4 text-sm font-semibold text-primary"
      >
        <MessagesSquare className="h-5 w-5" />
        {t("svc.need_advice")}
      </Link>
    </div>
  );
};

export default Huduma;
