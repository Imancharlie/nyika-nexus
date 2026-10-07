import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

type SectionHeaderProps = {
  title: string;
  moreTo?: string;
  moreLabel?: string;
};

const SectionHeader = ({ title, moreTo, moreLabel = "Zaidi" }: SectionHeaderProps) => (
  <div className="mb-3 flex items-center justify-between">
    <h2 className="text-base font-bold tracking-tight">{title}</h2>
    {moreTo && (
      <Link
        to={moreTo}
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        {moreLabel} <ArrowRight className="h-4 w-4" />
      </Link>
    )}
  </div>
);

export default SectionHeader;
