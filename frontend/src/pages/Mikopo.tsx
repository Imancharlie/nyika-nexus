import { Landmark } from "lucide-react";
import LoanCard from "@/components/LoanCard";
import QueryState from "@/components/QueryState";
import { useLoans } from "@/hooks/useApi";
import { useLanguage } from "@/i18n/LanguageContext";

const Mikopo = () => {
  const { t } = useLanguage();
  const { data: loans, isLoading, isError, refetch } = useLoans();
  return (
    <div className="space-y-5 animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl bg-navy p-5 text-white">
        <div className="absolute -right-6 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{t("loan.label")}</p>
        <h1 className="mt-1 text-xl font-bold leading-snug">{t("loan.title")}</h1>
        <p className="mt-1 text-sm text-white/85">{t("loan.sub")}</p>
      </section>

      <QueryState isLoading={isLoading} isError={isError} onRetry={refetch}>
        <div className="space-y-4">
          {loans?.map((loan) => (
            <LoanCard key={loan.id} loan={loan} />
          ))}
        </div>
      </QueryState>

      <p className="flex items-start gap-2 rounded-2xl bg-muted p-4 text-xs text-muted-foreground">
        <Landmark className="mt-0.5 h-4 w-4 shrink-0" />
        {t("loan.disclaimer")}
      </p>
    </div>
  );
};

export default Mikopo;
