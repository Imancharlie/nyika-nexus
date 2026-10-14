import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n/LanguageContext";
import type { StringKey } from "@/i18n/strings";
import { cn } from "@/lib/utils";
import type { ServiceRequestStatus } from "@/types";

const styles: Record<ServiceRequestStatus, string> = {
  inasubiri: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  imethibitishwa: "bg-sky-100 text-sky-800 hover:bg-sky-100",
  inachakatwa: "bg-violet-100 text-violet-800 hover:bg-violet-100",
  imepangwa: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  imekamilika: "bg-primary/15 text-primary hover:bg-primary/15",
  imeghairiwa: "bg-red-100 text-red-700 hover:bg-red-100",
};

const StatusBadge = ({ status }: { status: ServiceRequestStatus }) => {
  const { t } = useLanguage();
  const key = styles[status] ? status : "inasubiri";
  return (
    <Badge variant="outline" className={cn("border-transparent font-medium", styles[key])}>
      {t(`status.${key}` as StringKey)}
    </Badge>
  );
};

export default StatusBadge;
