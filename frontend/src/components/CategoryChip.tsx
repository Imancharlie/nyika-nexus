import { cn } from "@/lib/utils";

type CategoryChipProps = {
  label: string;
  emoji?: string;
  active?: boolean;
  onClick?: () => void;
};

const CategoryChip = ({ label, emoji, active, onClick }: CategoryChipProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
    )}
  >
    {emoji && <span aria-hidden>{emoji}</span>}
    {label}
  </button>
);

export default CategoryChip;
