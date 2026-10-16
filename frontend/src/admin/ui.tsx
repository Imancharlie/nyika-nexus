import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import BrandLoader from "@/components/BrandLoader";
import { cn } from "@/lib/utils";

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

export const PageTitle = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="font-display text-3xl font-bold tracking-[-.03em]">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const Card = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cn("rounded-[22px] border border-border/70 bg-card p-5", className)}>{children}</div>
);

export const Stat = ({ label, value, hint, tone = "default", icon }: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "green" | "navy" | "warn";
  icon?: ReactNode;
}) => (
  <div
    className={cn(
      "rounded-[22px] border p-5",
      tone === "default" && "border-border/70 bg-card",
      tone === "green" && "border-transparent bg-learn text-white",
      tone === "navy" && "border-transparent bg-navy text-white",
      tone === "warn" && "border-gold/60 bg-gold/15",
    )}
  >
    <div className="flex items-center justify-between">
      <p className={cn("text-sm font-medium", tone === "green" || tone === "navy" ? "text-white/75" : "text-muted-foreground")}>{label}</p>
      {icon}
    </div>
    <p className="mt-2 font-display text-3xl font-bold tabular-nums tracking-tight">{value}</p>
    {hint && <p className={cn("mt-1 text-xs", tone === "green" || tone === "navy" ? "text-white/70" : "text-muted-foreground")}>{hint}</p>}
  </div>
);

export const Pill = ({ children, tone = "gray" }: { children: ReactNode; tone?: "gray" | "green" | "amber" | "red" | "blue" | "violet" }) => (
  <span
    className={cn(
      "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold",
      tone === "gray" && "bg-muted text-muted-foreground",
      tone === "green" && "bg-emerald/10 text-emerald",
      tone === "amber" && "bg-gold/30 text-[#7a4f00]",
      tone === "red" && "bg-destructive/10 text-destructive",
      tone === "blue" && "bg-sky-100 text-sky-800",
      tone === "violet" && "bg-violet-100 text-violet-800",
    )}
  >
    {children}
  </span>
);

export const statusTone = (status: string): "gray" | "green" | "amber" | "red" | "blue" | "violet" => {
  if (["imelipwa", "imefika", "imekamilika", "imejibiwa", "sent", "inajibiwa"].includes(status)) return "green";
  if (["inasubiri", "wazi", "mpya", "pending", "sending", "partial"].includes(status)) return "amber";
  if (["imeshindikana", "imeghairiwa", "imekataliwa", "failed"].includes(status)) return "red";
  if (["njiani", "imepangwa", "imethibitishwa"].includes(status)) return "blue";
  if (["inaandaliwa", "inachakatwa", "inashughulikiwa"].includes(status)) return "violet";
  return "gray";
};

export const SearchBox = ({ value, onChange, placeholder = "Search..." }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-full border bg-card px-4 py-2">
    <Search className="h-4 w-4 text-muted-foreground" />
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
  </label>
);

export const Select = ({ value, onChange, options, className }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={cn("h-9 rounded-full border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-emerald/30", className)}
  >
    {options.map((o) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);

export const Table = ({ head, children, loading, empty }: { head: string[]; children: ReactNode; loading?: boolean; empty?: boolean }) => {
  const showLoader = useShowAfter(!!loading);
  return (
    <div
      className="adm-table overflow-x-auto rounded-[22px] border border-border/70 bg-card"
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("button, a, select, input, textarea, label")) return;
        const row = target.closest("tr");
        if (!row || row.classList.contains("detail-row")) return;
        row.querySelector<HTMLElement>("[data-view]")?.click();
      }}
    >
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b bg-[#f2fbf5] text-xs uppercase tracking-wide text-muted-foreground">
          <tr>{head.map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y">{children}</tbody>
      </table>
      {loading && showLoader && (
        <div className="flex flex-col items-center justify-center gap-2 bg-[#f2fbf5] py-8 text-sm text-[#3c5a49]">
          <BrandLoader size="sm" /> Loading...
        </div>
      )}
      {!loading && empty && <p className="py-10 text-center text-sm text-muted-foreground">Nothing here yet.</p>}
    </div>
  );
};

export const Td = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <td className={cn("px-4 py-3 align-top", className)}>{children}</td>
);

export const Pager = ({ page, count, pageSize = 50, onPage }: { page: number; count: number; pageSize?: number; onPage: (p: number) => void }) => {
  const pages = Math.max(1, Math.ceil(count / pageSize));
  if (pages <= 1) return <p className="mt-3 text-xs text-muted-foreground">{count} total</p>;
  return (
    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
      <span>{count} total</span>
      <div className="flex items-center gap-2">
        <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className="rounded-full border p-1.5 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
        <span>Page {page} / {pages}</span>
        <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)} className="rounded-full border p-1.5 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
};

export const Btn = ({ children, onClick, variant = "primary", type = "button", disabled, className, view }: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "danger" | "ghost";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  view?: boolean;
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    data-view={view ? "" : undefined}
    className={cn(
      "inline-flex min-h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition disabled:opacity-50",
      variant === "primary" && "bg-emerald text-white hover:bg-emerald/90",
      variant === "outline" && "border bg-card hover:bg-chip",
      variant === "danger" && "bg-destructive/10 text-destructive hover:bg-destructive/15",
      variant === "ghost" && "text-muted-foreground hover:bg-chip",
      className,
    )}
  >
    {children}
  </button>
);

export const Field = ({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) => (
  <label className="block space-y-1.5">
    <span className="text-sm font-medium">{label}</span>
    {children}
    {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
  </label>
);

export const inputClass =
  "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20";
