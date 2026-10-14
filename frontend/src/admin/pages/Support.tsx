import { useState } from "react";
import { adminApi, fmtDate, useAdminList, useAdminMutation, useAdminQuery } from "../lib";
import { Btn, Card, inputClass, PageTitle, Pill, SearchBox, Select, statusTone } from "../ui";
import { prettyPhone } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Ticket } from "@/types";

const STATUS = [
  { value: "wazi", label: "Open" },
  { value: "imejibiwa", label: "Answered" },
  { value: "imefungwa", label: "Closed" },
];
const statusLabel = (s: string) => STATUS.find((x) => x.value === s)?.label ?? s;

const Thread = ({ id }: { id: number }) => {
  const { data: ticket } = useAdminQuery<Ticket>(`/admin/tickets/${id}/`);
  const [body, setBody] = useState("");
  const reply = useAdminMutation(() => adminApi.post(`/admin/tickets/${id}/reply/`, { body }), "Reply sent");
  const setStatus = useAdminMutation((status: string) => adminApi.patch(`/admin/tickets/${id}/`, { status }), "Status updated");

  if (!ticket) return <Card><p className="text-sm text-muted-foreground">Loading…</p></Card>;

  return (
    <Card className="flex h-full flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
        <div>
          <p className="text-xs text-muted-foreground">{ticket.code} · {ticket.category}</p>
          <h2 className="text-lg font-bold">{ticket.subject}</h2>
          <p className="text-sm text-muted-foreground">{ticket.user.name} · {prettyPhone(ticket.user.phone)}</p>
        </div>
        <Select value={ticket.status} onChange={(v) => setStatus.mutate(v)} options={STATUS} />
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        {ticket.messages.map((m) => (
          <div key={m.id} className={cn("flex", m.fromStaff ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[80%] rounded-2xl px-4 py-3 text-sm", m.fromStaff ? "bg-emerald text-white" : "bg-chip")}>
              <p className={cn("mb-1 text-xs font-semibold", m.fromStaff ? "text-white/80" : "text-muted-foreground")}>{m.author} · {fmtDate(m.createdAt)}</p>
              <p className="whitespace-pre-line">{m.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2 border-t pt-4">
        <textarea rows={3} className={inputClass} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a reply… (the farmer gets a notification)" />
        <Btn disabled={!body.trim() || reply.isPending} onClick={async () => { await reply.mutateAsync(undefined); setBody(""); }}>Send reply</Btn>
      </div>
    </Card>
  );
};

const Support = () => {
  const [status, setStatus] = useState("wazi");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const { data, isLoading } = useAdminList<Ticket>("/admin/tickets/", { status: status || undefined, search });

  return (
    <div>
      <PageTitle title="Support" subtitle="Help requests from farmers (Msaada)." />
      <div className="mb-4 flex flex-wrap gap-2">
        <SearchBox value={search} onChange={setSearch} placeholder="Subject, name or phone" />
        <Select value={status} onChange={setStatus} options={[{ value: "", label: "All" }, ...STATUS]} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="space-y-2">
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!isLoading && !data?.results.length && <Card><p className="text-center text-sm text-muted-foreground">No tickets.</p></Card>}
          {data?.results.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t.id)}
              className={cn("w-full rounded-2xl border bg-card p-4 text-left transition", selected === t.id ? "border-emerald ring-2 ring-emerald/20" : "hover:bg-chip/40")}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{t.subject}</p>
                <Pill tone={statusTone(t.status)}>{statusLabel(t.status)}</Pill>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t.user.name} · {fmtDate(t.updatedAt)}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{t.messages[t.messages.length - 1]?.body}</p>
            </button>
          ))}
        </div>
        {selected ? <Thread key={selected} id={selected} /> : <Card><p className="py-16 text-center text-sm text-muted-foreground">Select a ticket to read and reply.</p></Card>}
      </div>
    </div>
  );
};

export default Support;
