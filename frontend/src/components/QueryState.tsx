import type { ReactNode } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

type Props = {
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  empty?: boolean;
  emptyText?: string;
  children: ReactNode;
};

const QueryState = ({ isLoading, isError, onRetry, empty, emptyText, children }: Props) => {
  const { t } = useLanguage();
  if (isLoading)
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-emerald" /> {t("common.loading")}
      </div>
    );
  if (isError)
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        {t("common.error")}
        {onRetry && (
          <button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 font-semibold text-emerald">
            <RefreshCw className="h-4 w-4" /> {t("common.retry")}
          </button>
        )}
      </div>
    );
  if (empty)
    return (
      <div className="rounded-3xl border border-dashed p-8 text-center text-sm text-muted-foreground">{emptyText}</div>
    );
  return <>{children}</>;
};

export default QueryState;
