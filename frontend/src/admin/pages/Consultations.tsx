import { useState } from "react";
import { adminApi, fmtDate, useAdminList, useAdminMutation } from "../lib";
import { Btn, Card, inputClass, PageTitle, Pager, Pill, Select } from "../ui";
import { prettyPhone } from "@/lib/api";
import type { Consultation, Expert } from "@/types";

type AdminConsultation = Consultation & { customer: { name: string; phone: string }; expertId: string | null };

const ReplyBox = ({ c, experts }: { c: AdminConsultation; experts: Expert[] }) => {
  const [reply, setReply] = useState(c.reply ?? "");
  const [expertId, setExpertId] = useState(c.expertId ?? experts[0]?.id ?? "");
  const send = useAdminMutation(
    () => adminApi.post(`/admin/consultations/${c.id}/reply/`, { reply, expertId }),
    "Reply sent — the farmer was notified",
  );
  return (
    <div className="mt-3 space-y-2">
      <textarea rows={3} className={inputClass} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write the expert's advice…" />
      <div className="flex flex-wrap items-center gap-2">
        <Select value={expertId} onChange={setExpertId} options={experts.map((e) => ({ value: e.id, label: e.name }))} />
        <Btn disabled={!reply.trim() || send.isPending} onClick={() => send.mutate(undefined)}>
          {c.reply ? "Update reply" : "Send reply"}
        </Btn>
      </div>
    </div>
  );
};

const Consultations = () => {
  const [state, setState] = useState("unanswered");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminList<AdminConsultation>("/admin/consultations/", { state, page });
  const { data: experts } = useAdminList<Expert>("/admin/experts/");

  return (
    <div>
      <PageTitle title="Consultations" subtitle="Farmers' questions for the experts (Ushauri)." />
      <div className="mb-4">
        <Select value={state} onChange={(v) => { setState(v); setPage(1); }} options={[{ value: "unanswered", label: "Waiting for a reply" }, { value: "answered", label: "Answered" }, { value: "", label: "All" }]} />
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && !data?.results.length && <Card><p className="text-center text-sm text-muted-foreground">Nothing here.</p></Card>}
      <div className="grid gap-4 lg:grid-cols-2">
        {data?.results.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{c.customer.name}</p>
                <p className="text-xs text-muted-foreground">{prettyPhone(c.customer.phone)} · {fmtDate(c.createdAt)}</p>
              </div>
              <Pill tone={c.reply ? "green" : "amber"}>{c.cropType}</Pill>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm">{c.problem}</p>
            {c.image && <a href={c.image} target="_blank" rel="noreferrer"><img src={c.image} alt="" className="mt-3 max-h-56 rounded-xl object-cover" /></a>}
            <ReplyBox c={c} experts={experts?.results ?? []} />
          </Card>
        ))}
      </div>
      <Pager page={page} count={data?.count ?? 0} onPage={setPage} />
    </div>
  );
};

export default Consultations;
