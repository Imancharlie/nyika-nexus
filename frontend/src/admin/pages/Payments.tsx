import { useState } from "react";
import { adminApi, fmtDate, useAdminList, useAdminMutation } from "../lib";
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
          <tr key={p.id} className="hover:bg-chip/30">
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
            <Td>
              {p.status === "inasubiri" && (
                <div className="flex gap-1.5">
                  <Btn onClick={() => markPaid.mutate(p.id)}>Confirm</Btn>
                  <Btn variant="danger" onClick={() => markFailed.mutate(p.id)}>Failed</Btn>
                </div>
              )}
            </Td>
          </tr>
        ))}
      </Table>
      <Pager page={page} count={data?.count ?? 0} onPage={setPage} />
    </div>
  );
};

export default Payments;
