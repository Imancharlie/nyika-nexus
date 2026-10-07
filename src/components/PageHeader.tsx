import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  backTo?: string;
  action?: React.ReactNode;
  className?: string;
};

const backButtonClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/70 bg-card text-foreground transition-colors hover:bg-accent";

const PageHeader = ({ title, backTo, action, className }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className={cn("mb-4 flex items-center gap-2", className)}>
      {backTo ? (
        <Link to={backTo} aria-label="Rudi" className={backButtonClass}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Rudi nyuma"
          className={backButtonClass}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <h1 className="flex-1 text-lg font-bold tracking-tight">{title}</h1>
      {action}
    </div>
  );
};

export default PageHeader;
