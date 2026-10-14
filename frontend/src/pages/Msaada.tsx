import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, LifeBuoy } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import QueryState from "@/components/QueryState";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTicketActions, useTickets } from "@/hooks/useApi";
import { useLanguage } from "@/i18n/LanguageContext";
import type { StringKey } from "@/i18n/strings";
import { ApiError } from "@/lib/api";
import { cn, timeAgo } from "@/lib/utils";
import type { TicketCategory, TicketStatus } from "@/types";

const CATS: TicketCategory[] = ["akaunti", "malipo", "oda", "huduma", "nyingine"];

export const ticketStatusClass: Record<TicketStatus, string> = {
  wazi: "bg-gold/25 text-[#8a5a00]",
  imejibiwa: "bg-emerald/10 text-emerald",
  imefungwa: "bg-muted text-muted-foreground",
};

const Msaada = () => {
  const { t, lang } = useLanguage();
  const { data: tickets = [], isLoading, isError, refetch } = useTickets();
  const { create } = useTicketActions();
  const [form, setForm] = useState({ subject: "", category: "nyingine" as TicketCategory, message: "" });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return toast.error(t("auth.err_required"));
    try {
      await create.mutateAsync(form);
      toast.success(t("help.sent"));
      setForm({ subject: "", category: "nyingine", message: "" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("auth.err_generic"));
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title={t("help.title")} />

      <section className="rounded-[24px] bg-hero p-5 text-white">
        <LifeBuoy className="h-8 w-8 text-lime" />
        <p className="mt-3 text-sm text-white/85">{t("help.sub")}</p>
      </section>

      <form onSubmit={submit} className="space-y-3 rounded-[24px] border bg-card p-4">
        <h2 className="text-base font-bold">{t("help.new")}</h2>
        <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder={t("help.subject")} />
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {CATS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setForm({ ...form, category: c })}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium",
                form.category === c ? "border-emerald bg-emerald text-white" : "text-muted-foreground",
              )}
            >
              {t(`help.cat_${c}` as StringKey)}
            </button>
          ))}
        </div>
        <Textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={t("help.message")} />
        <button type="submit" disabled={create.isPending} className="btn-lime w-full">{t("help.send")}</button>
      </form>

      <section>
        <h2 className="mb-3 text-base font-bold">{t("help.mine")}</h2>
        <QueryState isLoading={isLoading} isError={isError} onRetry={refetch} empty={!tickets.length} emptyText={t("help.none")}>
          <div className="space-y-2">
            {tickets.map((ticket) => (
              <Link key={ticket.id} to={`/msaada/${ticket.id}`} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {ticket.code} · {timeAgo(ticket.updatedAt, lang)}
                  </p>
                </div>
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", ticketStatusClass[ticket.status])}>
                  {t(`help.${ticket.status}` as StringKey)}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </QueryState>
      </section>
    </div>
  );
};

export default Msaada;
