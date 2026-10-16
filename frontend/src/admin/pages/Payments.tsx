import { useState } from "react";
import { adminApi, fmtDate, useAdminList, useAdminMutation } from "../lib";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Btn, PageTitle, Pager, Pill, SearchBox, Select, statusTone, Table, Td } from "../ui";
import { prettyPhone } from "@/lib/api";
import { formatTZS } from "@/lib/utils";
import type { Payment } from "@/types";

type AdminPayment = Payment & {
  customer: { name: string; phone: string };
  providerReference: string;
  providerMessage: string;
};

const LABEL: Record<string, string> = { inasubiri: "Pending", imelipwa: "Paid", imeshindikana: "Failed" };

const Payments = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminList<AdminPayment>("/admin/payments/", { search, status: status || undefined, page });
  const [open, setOpen] = useState<AdminPayment | null>(null);
  const markPaid = useAdminMutation((id: number) => adminApi.post(`/admin/payments/${id}/mark-paid/`), "Payment confirmed");
  const markFailed = useAdminMutation((id: number) => adminApi.post(`/admin/payments/${id}/mark-failed/`), "Payment marked as failed");

  return (
    <div>
      <PageTitle
        title="Payments"
        subtitle="Until a payment gateway is connected, confirm payments here after the farmer pays you (e.g. by M-Pesa)."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Reference, phone or name" />
        <Select value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={[{ value: "", label: "All" }, { value: "inasubiri", label: "Pending" }, { value: "imelipwa", label: "Paid" }, { value: "imeshindikana", label: "Failed" }]} />
      </div>
      <Table head={["Reference", "Customer", "For", "Amount", "Method", "Status", "Date", ""]} loading={isLoading} empty={!data?.results.length}>
        {data?.results.map((p) => (
          <tr key={p.id} className="cursor-pointer hover:bg-chip/30">
            <Td>
              <p className="font-mono text-xs font-semibold">{p.reference}</p>
              {p.providerReference && <p className="font-mono text-[11px] text-muted-foreground">{p.providerReference}</p>}
            </Td>
            <Td>
              <p className="font-medium">{p.customer.name}</p>
              <p className="text-xs text-muted-foreground">{prettyPhone(p.phone)}</p>
            </Td>
            <Td>{p.description}</Td>
            <Td className="whitespace-nowrap font-semibold tabular-nums">{formatTZS(p.amount)}</Td>
            <Td className="capitalize">{p.method}</Td>
            <Td><Pill tone={statusTone(p.status)}>{LABEL[p.status]}</Pill></Td>
            <Td className="whitespace-nowrap text-muted-foreground">{fmtDate(p.paidAt ?? p.createdAt)}</Td>
            <Td className="row-actions">
              <Btn view variant="ghost" onClick={() => setOpen(p)}>View</Btn>
            </Td>
          </tr>
        ))}
      </Table>
      <Pager page={page} count={data?.count ?? 0} onPage={setPage} />
      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader><DialogTitle>{open?.reference}</DialogTitle></DialogHeader>
          {open && (
            <div className="space-y-2 text-sm">
              <p className="font-semibold">{open.customer.name}</p>
              <p className="text-muted-foreground">{prettyPhone(open.phone)} · {open.description}</p>
              <p className="font-semibold tabular-nums">{formatTZS(open.amount)}</p>
              <Pill tone={statusTone(open.status)}>{LABEL[open.status]}</Pill>
              {open.status === "inasubiri" && (
                <div className="flex gap-2 pt-2">
                  <Btn onClick={() => { markPaid.mutate(open.id); setOpen(null); }}>Confirm</Btn>
                  <Btn variant="danger" onClick={() => { markFailed.mutate(open.id); setOpen(null); }}>Failed</Btn>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payments;
