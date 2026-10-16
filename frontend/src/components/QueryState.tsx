import { useEffect, useState, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import BrandLoader from "@/components/BrandLoader";
import { useLanguage } from "@/i18n/LanguageContext";

type Props = {
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  empty?: boolean;
  emptyText?: string;
  children: ReactNode;
};

const useShowAfter = (active: boolean, delay = 320) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!active) {
      setShow(false);
      return;
    }
    const timer = window.setTimeout(() => setShow(true), delay);
    return () => window.clearTimeout(timer);
  }, [active, delay]);
  return show;
};

const QueryState = ({ isLoading, isError, onRetry, empty, emptyText, children }: Props) => {
  const { t } = useLanguage();
  const showLoader = useShowAfter(isLoading);
  if (isLoading && !showLoader) return <div className="min-h-8" aria-hidden="true" />;
  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-[#f2fbf5] py-10 text-sm text-[#3c5a49]">
        <BrandLoader size="sm" /> {t("common.loading")}
      </div>
    );
  if (isError)
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-[#0b7a43]/20 bg-[#f2fbf5] p-8 text-center text-sm text-[#3c5a49]">
        {t("common.error")}
        {onRetry && (
          <button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 font-semibold text-[#0b7a43]">
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
