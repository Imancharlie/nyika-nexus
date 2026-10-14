import PageHeader from "@/components/PageHeader";
import ExpertCard from "@/components/ExpertCard";
import QueryState from "@/components/QueryState";
import { useExperts } from "@/hooks/useApi";
import { useLanguage } from "@/i18n/LanguageContext";

const Experts = () => {
  const { data: experts, isLoading, isError, refetch } = useExperts();
  const { t } = useLanguage();
  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <PageHeader title={t("exp.title")} />
        <p className="-mt-2 mb-2 text-sm text-muted-foreground">{t("exp.sub")}</p>
      </div>

      <QueryState isLoading={isLoading} isError={isError} onRetry={refetch}>
        <div className="space-y-4">
          {experts?.map((expert) => (
            <ExpertCard key={expert.id} expert={expert} />
          ))}
        </div>
      </QueryState>
    </div>
  );
};

export default Experts;
