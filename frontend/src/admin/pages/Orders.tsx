import { Fragment, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { adminApi, fmtDate, useAdminList, useAdminMutation } from "../lib";
import { Btn, inputClass, PageTitle, Pager, Pill, SearchBox, Select, statusTone, Table, Td } from "../ui";
import { prettyPhone } from "@/lib/api";
import { cn, formatTZS } from "@/lib/utils";
import type { Order, OrderRequest } from "@/types";

type Customer = { customer: { id: number; name: string; phone: string; username: string } };

const ORDER_STATUSES = [
  { value: "imepokelewa", label: "Received" },
  { value: "inaandaliwa", label: "Preparing" },
  { value: "njiani", label: "On the way" },
  { value: "imefika", label: "Delivered" },
  { value: "imeghairiwa", label: "Cancelled" },
];
const REQUEST_STATUSES = [
  { value: "mpya", label: "New" },
  { value: "inashughulikiwa", label: "In progress" },
  { value: "imekamilika", label: "Completed" },
  { value: "imekataliwa", label: "Declined" },
];
const OrdersTab = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [payment, setPayment] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<number | null>(null);
  const { data, isLoading } = useAdminList<Order & Customer>("/admin/orders/", {
    search, status: status || undefined, payment_status: payment || undefined, page,
  });
  const update = useAdminMutation(
    ({ id, status }: { id: number; status: string }) => adminApi.patch(`/admin/orders/${id}/`, { status }),
    "Order updated — the farmer was notified",
  );
  const markPaid = useAdminMutation((id: number) => adminApi.post(`/admin/orders/${id}/mark-paid/`), "Marked as paid");

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Customer name, phone or location" />
        <Select value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={[{ value: "", label: "All statuses" }, ...ORDER_STATUSES]} />
        <Select value={payment} onChange={(v) => { setPayment(v); setPage(1); }} options={[{ value: "", label: "Any payment" }, { value: "inasubiri", label: "Unpaid" }, { value: "imelipwa", label: "Paid" }, { value: "imeshindikana", label: "Failed" }]} />
      </div>
      <Table head={["Order", "Customer", "Items", "Total", "Payment", "Status", "Placed", ""]} loading={isLoading} empty={!data?.results.length}>
        {data?.results.map((o) => (
          <Fragment key={o.id}>
            <tr className="cursor-pointer hover:bg-chip/30">
              <Td className="font-semibold">{o.code}</Td>
              <Td>
                <p className="font-medium">{o.customer.name}</p>
                <p className="text-xs text-muted-foreground">{prettyPhone(o.phone)}</p>
              </Td>
              <Td>
                <button type="button" data-view="" onClick={() => setExpanded(expanded === o.id ? null : o.id)} className="text-emerald underline-offset-2 hover:underline">
                  {o.items.length} item{o.items.length === 1 ? "" : "s"}
                </button>
              </Td>
              <Td className="whitespace-nowrap font-semibold tabular-nums">{formatTZS(o.total)}</Td>
              <Td><Pill tone={statusTone(o.paymentStatus)}>{o.paymentStatus === "imelipwa" ? "Paid" : o.paymentStatus === "inasubiri" ? "Unpaid" : "Failed"}</Pill></Td>
              <Td>
                <Select value={o.status} onChange={(v) => update.mutate({ id: o.id, status: v })} options={ORDER_STATUSES} />
              </Td>
              <Td className="whitespace-nowrap text-muted-foreground">{fmtDate(o.createdAt)}</Td>
              <Td className="row-actions">
                {o.paymentStatus !== "imelipwa" && o.status !== "imeghairiwa" && (
                  <Btn variant="outline" onClick={() => markPaid.mutate(o.id)}>Mark paid</Btn>
                )}
              </Td>
            </tr>
            {expanded === o.id && (
              <tr className="detail-row bg-chip/30">
                <td colSpan={8} className="px-6 py-3 text-sm">
                  <ul className="space-y-1">
                    {o.items.map((i) => (
                      <li key={i.id} className="flex justify-between gap-4"><span>{i.quantity} × {i.name}</span><span className="tabular-nums">{formatTZS(i.subtotal)}</span></li>
                    ))}
                  </ul>
                  <p className="mt-2 text-muted-foreground">Deliver to: {o.deliveryLocation}{o.notes && ` · Notes: ${o.notes}`}</p>
                  {o.paymentStatus !== "imelipwa" && o.status !== "imeghairiwa" && (
                    <div className="mt-3">
                      <Btn variant="outline" onClick={() => markPaid.mutate(o.id)}>Mark paid</Btn>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </Fragment>
        ))}
      </Table>
      <Pager page={page} count={data?.count ?? 0} onPage={setPage} />
    </>
  );
};

const RequestRow = ({ r }: { r: OrderRequest & Customer }) => {
  const [reply, setReply] = useState(r.adminReply);
  const update = useAdminMutation(
    (body: Record<string, string>) => adminApi.patch(`/admin/order-requests/${r.id}/`, body),
    "Request updated — the farmer was notified",
  );
  return (
    <tr className="hover:bg-chip/30">
      <Td>
        <p className="font-semibold">{r.productName}</p>
        <p className="text-xs text-muted-foreground">{r.quantity}{r.category && ` · ${r.category}`}</p>
        {r.notes && <p className="mt-1 max-w-xs text-xs text-muted-foreground">{r.notes}</p>}
      </Td>
      <Td>
        <p className="font-medium">{r.customer.name}</p>
        <p className="text-xs text-muted-foreground">{prettyPhone(r.customer.phone)}</p>
      </Td>
      <Td>
        <p>{r.location}</p>
        <p className="text-xs text-muted-foreground">{r.neededBy ? `by ${r.neededBy}` : ""}</p>
      </Td>
      <Td>
        <Select value={r.status} onChange={(v) => update.mutate({ status: v })} options={REQUEST_STATUSES} />
      </Td>
      <Td>
        <div className="flex min-w-0 flex-wrap gap-2">
          <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply to farmer…" className={cn(inputClass, "py-1.5")} />
          <Btn variant="outline" disabled={reply === r.adminReply} onClick={() => update.mutate({ adminReply: reply })}>Send</Btn>
        </div>
      </Td>
      <Td className="whitespace-nowrap text-muted-foreground">{fmtDate(r.createdAt)}</Td>
    </tr>
  );
};

const RequestsTab = () => {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminList<OrderRequest & Customer>("/admin/order-requests/", { status: status || undefined, search, page });
  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Product, phone or location" />
        <Select value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={[{ value: "", label: "All statuses" }, ...REQUEST_STATUSES]} />
      </div>
      <Table head={["Request", "Customer", "Location", "Status", "Reply", "Sent"]} loading={isLoading} empty={!data?.results.length}>
        {data?.results.map((r) => <RequestRow key={r.id} r={r} />)}
      </Table>
      <Pager page={page} count={data?.count ?? 0} onPage={setPage} />
    </>
  );
};

const Orders = () => {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "requests" ? "requests" : "orders";
  return (
    <div>
      <PageTitle title="Orders" subtitle="Shop orders and order requests (Omba oda)." />
      <div className="mb-5 inline-flex rounded-full border bg-card p-1">
        {(["orders", "requests"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setParams(t === "orders" ? {} : { tab: t })}
            className={cn("rounded-full px-4 py-1.5 text-sm font-semibold", tab === t ? "bg-forest text-white" : "text-muted-foreground")}
          >
            {t === "orders" ? "Orders" : "Order requests"}
          </button>
        ))}
      </div>
      {tab === "orders" ? <OrdersTab /> : <RequestsTab />}
    </div>
  );
};

export default Orders;
