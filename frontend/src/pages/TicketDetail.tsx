import { useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { Send } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import QueryState from "@/components/QueryState";
import { Input } from "@/components/ui/input";
import NotFound from "./NotFound";
import { ticketStatusClass } from "./Msaada";
import { useTicket, useTicketActions } from "@/hooks/useApi";
import { useLanguage } from "@/i18n/LanguageContext";
import type { StringKey } from "@/i18n/strings";
import { cn, timeAgo } from "@/lib/utils";

const TicketDetail = () => {
  const { id } = useParams();
  const { t, lang } = useLanguage();
  const { data: ticket, isLoading, isError, refetch } = useTicket(id);
  const { reply } = useTicketActions();
  const [body, setBody] = useState("");

  if (isLoading) return <QueryState isLoading isError={false}>{null}</QueryState>;
  if (isError || !ticket) return <NotFound />;

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    await reply.mutateAsync({ id: ticket.id, body: body.trim() });
    setBody("");
    refetch();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title={ticket.code} backTo="/msaada" />
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-lg font-bold leading-snug">{ticket.subject}</h1>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold", ticketStatusClass[ticket.status])}>
          {t(`help.${ticket.status}` as StringKey)}
        </span>
      </div>

      <div className="space-y-3">
        {ticket.messages.map((m) => (
          <div key={m.id} className={cn("flex", m.fromStaff ? "justify-start" : "justify-end")}>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                m.fromStaff ? "rounded-tl-sm border bg-card" : "rounded-tr-sm bg-emerald text-white",
              )}
            >
              <p className={cn("mb-1 text-xs font-semibold", m.fromStaff ? "text-emerald" : "text-white/80")}>
                {m.fromStaff ? t("help.team") : m.author} · {timeAgo(m.createdAt, lang)}
              </p>
              <p className="whitespace-pre-line">{m.body}</p>
            </div>
          </div>
        ))}
      </div>

      {ticket.status !== "imefungwa" && (
        <form onSubmit={send} className="sticky bottom-24 flex gap-2 rounded-full border bg-card p-1.5 shadow-lg">
          <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder={t("help.reply_ph")} className="rounded-full border-0 shadow-none focus-visible:ring-0" />
          <button type="submit" disabled={!body.trim() || reply.isPending} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald text-white disabled:opacity-50">
            <Send className="h-4 w-4" />
          </button>
        </form>
      )}
    </div>
  );
};

export default TicketDetail;
