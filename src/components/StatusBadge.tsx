import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ServiceRequestStatus } from "@/types";

const styles: Record<ServiceRequestStatus, { label: string; className: string }> = {
  inasubiri: { label: "Inasubiri", className: "bg-amber-100 text-amber-800 hover:bg-amber-100" },
  imethibitishwa: { label: "Imethibitishwa", className: "bg-sky-100 text-sky-800 hover:bg-sky-100" },
  inachakatwa: { label: "Inachakatwa", className: "bg-violet-100 text-violet-800 hover:bg-violet-100" },
  imepangwa: { label: "Imepangwa", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  imekamilika: { label: "Imekamilika", className: "bg-primary/15 text-primary hover:bg-primary/15" },
  imeghairiwa: { label: "Imeghairiwa", className: "bg-red-100 text-red-700 hover:bg-red-100" },
};

const StatusBadge = ({ status }: { status: ServiceRequestStatus }) => {
  const { label, className } = styles[status] ?? styles.inasubiri;
  return (
    <Badge variant="outline" className={cn("border-transparent font-medium", className)}>
      {label}
    </Badge>
  );
};

export default StatusBadge;
