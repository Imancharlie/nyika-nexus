import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { adminApi, fmtDate, fmtDay, linesToList, listToLines, useAdminList, useAdminMutation } from "../lib";
import { Btn, Field, inputClass, PageTitle, Pager, Pill, SearchBox, Select, Table, Td } from "../ui";
import { prettyPhone } from "@/lib/api";
import { cn, formatTZS } from "@/lib/utils";
import type { ServicePackage, ServiceRequest } from "@/types";

const SR_STATUSES = [
  { value: "inasubiri", label: "Waiting" },
  { value: "imethibitishwa", label: "Confirmed" },
  { value: "inachakatwa", label: "Processing" },
  { value: "imepangwa", label: "Scheduled" },
  { value: "imekamilika", label: "Completed" },
  { value: "imeghairiwa", label: "Cancelled" },
];

type AdminSR = ServiceRequest & { customer: { name: string; phone: string }; adminNotes: string };

const RequestsTab = () => {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminList<AdminSR>("/admin/service-requests/", { status: status || undefined, search, page });
  const update = useAdminMutation(
    ({ pk, body }: { pk: number; body: Record<string, string> }) => adminApi.patch(`/admin/service-requests/${pk}/`, body),
    "Request updated — the farmer was notified",
  );
  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Phone, name, location or crop" />
        <Select value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={[{ value: "", label: "All statuses" }, ...SR_STATUSES]} />
      </div>
      <Table head={["Request", "Customer", "Farm", "Preferred date", "Status", "Received"]} loading={isLoading} empty={!data?.results.length}>
        {data?.results.map((r) => (
          <tr key={r.pk} className="hover:bg-chip/30">
            <Td>
              <p className="font-semibold">{r.id}</p>
              <p className="text-xs text-muted-foreground">{r.packageName} · {formatTZS(r.price)}</p>
            </Td>
            <Td>
              <p className="font-medium">{r.customer.name}</p>
              <p className="text-xs text-muted-foreground">{prettyPhone(r.customer.phone)}</p>
            </Td>
            <Td>
              <p>{r.farmLocation}, {r.location}</p>
              <p className="text-xs text-muted-foreground">{r.farmSize} · {r.cropType}</p>
              {r.notes && <p className="mt-1 max-w-xs text-xs text-muted-foreground">{r.notes}</p>}
            </Td>
            <Td className="whitespace-nowrap">{fmtDay(r.preferredDate)}</Td>
            <Td><Select value={r.status} onChange={(v) => update.mutate({ pk: r.pk, body: { status: v } })} options={SR_STATUSES} /></Td>
            <Td className="whitespace-nowrap text-muted-foreground">{fmtDate(r.createdAt)}</Td>
          </tr>
        ))}
      </Table>
      <Pager page={page} count={data?.count ?? 0} onPage={setPage} />
    </>
  );
};

type Draft = Omit<ServicePackage, "includes" | "benefits" | "requirements" | "image"> & {
  includes: string; benefits: string; requirements: string; imageUrl: string; isNew?: boolean;
};

const blank: Draft = {
  id: "", name: "", description: "", serviceType: "", coverage: "", price: 0, duration: "", includes: "", benefits: "",
  requirements: "", serviceArea: "", featured: false, imageUrl: "", active: true, sortOrder: 0, isNew: true,
};

const PackageForm = ({ draft, onDone }: { draft: Draft; onDone: () => void }) => {
  const [f, setF] = useState(draft);
  const save = useAdminMutation(async (d: Draft) => {
    const { isNew, ...rest } = d;
    const body = { ...rest, price: Number(d.price), includes: linesToList(d.includes), benefits: linesToList(d.benefits), requirements: linesToList(d.requirements) };
    return isNew ? adminApi.post("/admin/packages/", body) : adminApi.patch(`/admin/packages/${d.id}/`, body);
  }, "Service package saved");
  const set = (k: keyof Draft) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await save.mutateAsync(f);
    onDone();
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="ID (short code)" hint="lowercase-with-dashes"><input required disabled={!f.isNew} className={inputClass} value={f.id} onChange={set("id")} /></Field>
        <Field label="Price (TSh)"><input required type="number" className={inputClass} value={f.price} onChange={set("price")} /></Field>
      </div>
      <Field label="Name"><input required className={inputClass} value={f.name} onChange={set("name")} /></Field>
      <Field label="Description"><textarea required rows={2} className={inputClass} value={f.description} onChange={set("description")} /></Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Type"><input required className={inputClass} value={f.serviceType} onChange={set("serviceType")} /></Field>
        <Field label="Coverage"><input required className={inputClass} value={f.coverage} onChange={set("coverage")} /></Field>
        <Field label="Duration"><input required className={inputClass} value={f.duration} onChange={set("duration")} /></Field>
      </div>
      <Field label="Service area"><input required className={inputClass} value={f.serviceArea} onChange={set("serviceArea")} /></Field>
      <Field label="What's included" hint="One per line"><textarea rows={3} className={inputClass} value={f.includes} onChange={set("includes")} /></Field>
      <Field label="Benefits" hint="One per line"><textarea rows={3} className={inputClass} value={f.benefits} onChange={set("benefits")} /></Field>
      <Field label="Requirements" hint="One per line"><textarea rows={3} className={inputClass} value={f.requirements} onChange={set("requirements")} /></Field>
      <Field label="Image link"><input className={inputClass} value={f.imageUrl} onChange={set("imageUrl")} placeholder="https://…" /></Field>
      <div className="flex gap-6 text-sm">
        <label className="flex items-center gap-2"><Switch checked={!!f.featured} onCheckedChange={(v) => setF({ ...f, featured: v })} /> Featured</label>
        <label className="flex items-center gap-2"><Switch checked={!!f.active} onCheckedChange={(v) => setF({ ...f, active: v })} /> Visible</label>
      </div>
      <Btn type="submit" disabled={save.isPending} className="w-full">Save package</Btn>
    </form>
  );
};

const PackagesTab = () => {
  const { data, isLoading } = useAdminList<ServicePackage>("/admin/packages/");
  const [editing, setEditing] = useState<Draft | null>(null);
  const edit = (p: ServicePackage) =>
    setEditing({ ...p, includes: listToLines(p.includes), benefits: listToLines(p.benefits), requirements: listToLines(p.requirements), imageUrl: p.image ?? "" });
  return (
    <>
      <div className="mb-4 flex justify-end"><Btn onClick={() => setEditing(blank)}><Plus className="h-4 w-4" /> New package</Btn></div>
      <Table head={["Package", "Type", "Price", "Status", ""]} loading={isLoading} empty={!data?.results.length}>
        {data?.results.map((p) => (
          <tr key={p.id} className="cursor-pointer hover:bg-chip/30">
            <Td><p className="font-semibold">{p.name}</p><p className="text-xs text-muted-foreground">{p.coverage} · {p.duration}</p></Td>
            <Td>{p.serviceType}</Td>
            <Td className="tabular-nums">{formatTZS(p.price)}</Td>
            <Td className="space-x-1">{p.active ? <Pill tone="green">visible</Pill> : <Pill>hidden</Pill>}{p.featured && <Pill tone="blue">featured</Pill>}</Td>
            <Td className="row-actions"><Btn view variant="ghost" onClick={() => edit(p)}><Pencil className="h-4 w-4" /></Btn></Td>
          </tr>
        ))}
      </Table>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-3xl">
          <DialogHeader><DialogTitle>{editing?.isNew ? "New service package" : "Edit service package"}</DialogTitle></DialogHeader>
          {editing && <PackageForm draft={editing} onDone={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </>
  );
};

const Services = () => {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "packages" ? "packages" : "requests";
  return (
    <div>
      <PageTitle title="Services" subtitle="Fumigation and soil-testing requests, and the packages farmers can order." />
      <div className="mb-5 inline-flex rounded-full border bg-card p-1">
        {(["requests", "packages"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setParams(t === "requests" ? {} : { tab: t })}
            className={cn("rounded-full px-4 py-1.5 text-sm font-semibold", tab === t ? "bg-forest text-white" : "text-muted-foreground")}>
            {t === "requests" ? "Service requests" : "Packages"}
          </button>
        ))}
      </div>
      {tab === "requests" ? <RequestsTab /> : <PackagesTab />}
    </div>
  );
};

export default Services;
