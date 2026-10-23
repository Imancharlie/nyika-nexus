import { Link } from "react-router-dom";
import { MessagesSquare } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import QueryState from "@/components/QueryState";
import { usePackages } from "@/hooks/useApi";
import { useLanguage } from "@/i18n/LanguageContext";
import AdvisorFab from "@/components/AdvisorFab";

const Huduma = () => {
  const { t } = useLanguage();
  const { data: packages, isLoading, isError, refetch } = usePackages();
  return (
    <div className="space-y-5 animate-fade-in">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">{t("svc.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("svc.sub")}</p>
      </section>

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
      <AdvisorFab />
    </div>
  );
};

export default Huduma;
