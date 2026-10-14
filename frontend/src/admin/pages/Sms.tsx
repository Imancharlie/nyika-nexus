import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Megaphone, Send } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { adminApi, fmtDate, useAdminList, useAdminMutation, useAdminQuery } from "../lib";
import { Btn, Card, Field, inputClass, PageTitle, Pager, Pill, SearchBox, Select, statusTone, Table, Td } from "../ui";
import { TZ_REGIONS } from "@/lib/regions";

type Broadcast = {
  id: number; message: string; audience: string; region: string; recipientsCount: number; sentCount: number;
  failedCount: number; status: string; createdAt: string; createdBy: string | null; alsoNotifyInApp: boolean;
};
type SmsLog = { id: number; phone: string; message: string; purpose: string; status: string; providerResponse: string; createdAt: string };

const Composer = () => {
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [region, setRegion] = useState(TZ_REGIONS[0]);
  const [sendSms, setSendSms] = useState(true);
  const [inApp, setInApp] = useState(true);
  const params = `?audience=${audience}&region=${encodeURIComponent(region)}`;
  const { data: count } = useAdminQuery<{ count: number; smsReady: boolean }>(`/admin/broadcasts/audience-count/${params}`);
  const send = useAdminMutation(
    () => adminApi.post("/admin/broadcasts/", { message, audience, region: audience === "region" ? region : "", sendSms, alsoNotifyInApp: inApp }),
    "Announcement is being sent",
  );
  const smsOff = count && !count.smsReady;
  const parts = Math.max(1, Math.ceil(message.length / 160));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!confirm(`Send this announcement to ${count?.count ?? 0} farmer(s)?`)) return;
    await send.mutateAsync(undefined);
    setMessage("");
  };

  return (
    <Card>
      <h2 className="mb-4 flex items-center gap-2 font-bold"><Megaphone className="h-5 w-5 text-emerald" /> New announcement</h2>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Message" hint={`${message.length} characters · ${parts} SMS per farmer`}>
          <textarea required maxLength={640} rows={4} className={inputClass} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="AGRIMIKA: Mbolea ya DAP sasa inapatikana kwa TSh 85,000…" />
        </Field>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Send to">
            <Select value={audience} onChange={setAudience} options={[{ value: "all", label: "All farmers" }, { value: "region", label: "One region" }]} />
          </Field>
          {audience === "region" && (
            <Field label="Region">
              <Select value={region} onChange={setRegion} options={TZ_REGIONS.map((r) => ({ value: r, label: r }))} />
            </Field>
          )}
          <p className="pb-2 text-sm text-muted-foreground"><b className="text-foreground">{count?.count ?? "…"}</b> farmer(s)</p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2"><Switch checked={sendSms && !smsOff} disabled={!!smsOff} onCheckedChange={setSendSms} /> Send by SMS</label>
          <label className="flex items-center gap-2"><Switch checked={inApp} onCheckedChange={setInApp} /> Show in app notifications</label>
        </div>
        {smsOff && (
          <p className="flex items-center gap-2 rounded-xl bg-gold/15 p-3 text-sm">
            <AlertTriangle className="h-4 w-4 text-[#8a5a00]" /> SMS is off. <Link to="/admin/integrations" className="font-semibold text-emerald">Add your Beem API key</Link> to send SMS. In-app notifications still work.
          </p>
        )}
        <Btn type="submit" disabled={send.isPending || !message.trim() || (!inApp && (!sendSms || !!smsOff))}>
          <Send className="h-4 w-4" /> Send announcement
        </Btn>
      </form>
    </Card>
  );
};

const Sms = () => {
  const { data: broadcasts } = useAdminList<Broadcast>("/admin/broadcasts/");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const { data: logs, isLoading } = useAdminList<SmsLog>("/admin/sms-logs/", { search, status: status || undefined, page });

  return (
    <div className="space-y-6">
      <PageTitle title="SMS & Broadcasts" subtitle="Send announcements to all farmers or one region, and see every SMS sent." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Composer />
        <Card>
          <h2 className="mb-4 font-bold">Recent announcements</h2>
          {!broadcasts?.results.length && <p className="text-sm text-muted-foreground">None yet.</p>}
          <ul className="space-y-3">
            {broadcasts?.results.slice(0, 8).map((b) => (
              <li key={b.id} className="rounded-2xl bg-chip/50 p-3 text-sm">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">{fmtDate(b.createdAt)} · {b.audience === "all" ? "All farmers" : b.region}</span>
                  <Pill tone={statusTone(b.status)}>{b.status}</Pill>
                </div>
                <p className="line-clamp-2">{b.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{b.recipientsCount} recipients · {b.sentCount} SMS sent · {b.failedCount} failed</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold">SMS log</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Phone or text" />
          <Select value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={[{ value: "", label: "All" }, { value: "sent", label: "Sent" }, { value: "failed", label: "Failed" }]} />
        </div>
        <Table head={["When", "Phone", "Purpose", "Message", "Status"]} loading={isLoading} empty={!logs?.results.length}>
          {logs?.results.map((l) => (
            <tr key={l.id}>
              <Td className="whitespace-nowrap text-muted-foreground">{fmtDate(l.createdAt)}</Td>
              <Td className="whitespace-nowrap font-mono text-xs">{l.phone}</Td>
              <Td>{l.purpose}</Td>
              <Td className="max-w-md"><p className="line-clamp-2">{l.purpose.startsWith("otp") ? "•••• (verification code hidden)" : l.message}</p></Td>
              <Td><span title={l.providerResponse}><Pill tone={statusTone(l.status)}>{l.status}</Pill></span></Td>
            </tr>
          ))}
        </Table>
        <Pager page={page} count={logs?.count ?? 0} onPage={setPage} />
      </div>
    </div>
  );
};

export default Sms;
