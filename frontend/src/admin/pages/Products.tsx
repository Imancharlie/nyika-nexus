import { useState, type FormEvent } from "react";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { adminApi, useAdminList, useAdminMutation } from "../lib";
import { Btn, Field, inputClass, PageTitle, Pill, SearchBox, Select, Table, Td } from "../ui";
import { formatTZS } from "@/lib/utils";
import type { Product } from "@/types";

const CATS = [
  { value: "mbegu", label: "Seeds (Mbegu)" },
  { value: "mbolea", label: "Fertiliser (Mbolea)" },
  { value: "vifaa", label: "Tools (Vifaa)" },
  { value: "dawa", label: "Crop care (Dawa)" },
  { value: "mifugo", label: "Livestock (Mifugo)" },
];

type Draft = {
  id?: number;
  name: string;
  category: string;
  description: string;
  price: string;
  unit: string;
  stock: string;
  imageUrl: string;
  featured: boolean;
  active: boolean;
};

const empty: Draft = { name: "", category: "mbolea", description: "", price: "", unit: "", stock: "0", imageUrl: "", featured: false, active: true };

const ProductForm = ({ draft, onDone }: { draft: Draft; onDone: () => void }) => {
  const [form, setForm] = useState(draft);
  const [file, setFile] = useState<File | null>(null);
  const save = useAdminMutation(async (body: Draft) => {
    const payload = { ...body, price: Number(body.price), stock: Number(body.stock) };
    const saved = body.id
      ? await adminApi.patch<Product>(`/admin/products/${body.id}/`, payload)
      : await adminApi.post<Product>("/admin/products/", payload);
    if (file) {
      const fd = new FormData();
      fd.append("imageFile", file);
      await adminApi.patch(`/admin/products/${saved.id}/`, fd);
    }
    return saved;
  }, "Product saved");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await save.mutateAsync(form);
    onDone();
  };

  const set = (k: keyof Draft) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Name"><input required className={inputClass} value={form.name} onChange={set("name")} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category">
          <select className={inputClass} value={form.category} onChange={set("category")}>
            {CATS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </Field>
        <Field label="Unit" hint="e.g. 50kg, lita 1"><input required className={inputClass} value={form.unit} onChange={set("unit")} /></Field>
        <Field label="Price (TSh)"><input required type="number" min={0} className={inputClass} value={form.price} onChange={set("price")} /></Field>
        <Field label="Stock"><input required type="number" min={0} className={inputClass} value={form.stock} onChange={set("stock")} /></Field>
      </div>
      <Field label="Description"><textarea rows={2} className={inputClass} value={form.description} onChange={set("description")} /></Field>
      <Field label="Image" hint="Upload a photo, or paste an image link instead.">
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="block w-full text-sm" />
        <input className={`${inputClass} mt-2`} placeholder="https://…" value={form.imageUrl} onChange={set("imageUrl")} />
      </Field>
      <div className="flex gap-6 text-sm">
        <label className="flex items-center gap-2"><Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} /> Featured</label>
        <label className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /> Visible in shop</label>
      </div>
      <Btn type="submit" disabled={save.isPending} className="w-full">Save product</Btn>
    </form>
  );
};

const Products = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [editing, setEditing] = useState<Draft | null>(null);
  const { data, isLoading } = useAdminList<Product>("/admin/products/", { search, category: category || undefined });
  const remove = useAdminMutation((id: number) => adminApi.delete(`/admin/products/${id}/`), "Product deleted");

  const edit = (p: Product) =>
    setEditing({
      id: p.id, name: p.name, category: p.category, description: p.description, price: String(p.price), unit: p.unit,
      stock: String(p.stock), imageUrl: p.image?.startsWith("http") && !p.image.includes("/media/") ? p.image : "", featured: p.featured, active: p.active,
    });

  return (
    <div>
      <PageTitle title="Products" subtitle="Items farmers can buy in the shop (Bidhaa)." action={<Btn onClick={() => setEditing(empty)}><Plus className="h-4 w-4" /> Add product</Btn>} />
      <div className="mb-4 flex flex-wrap gap-2">
        <SearchBox value={search} onChange={setSearch} placeholder="Search products" />
        <Select value={category} onChange={setCategory} options={[{ value: "", label: "All categories" }, ...CATS]} />
      </div>
      <Table head={["Product", "Category", "Price", "Stock", "Status", ""]} loading={isLoading} empty={!data?.results.length}>
        {data?.results.map((p) => (
          <tr key={p.id} className="cursor-pointer hover:bg-chip/30">
            <Td>
              <div className="flex items-center gap-3">
                {p.image ? <img src={p.image} alt="" className="h-11 w-11 rounded-xl object-cover" /> : <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-chip"><Package className="h-5 w-5 text-emerald" /></span>}
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.unit}</p>
                </div>
              </div>
            </Td>
            <Td className="capitalize">{p.category}</Td>
            <Td className="whitespace-nowrap tabular-nums">{formatTZS(p.price)}</Td>
            <Td>{p.stock <= 5 ? <Pill tone={p.stock ? "amber" : "red"}>{p.stock}</Pill> : <span className="tabular-nums">{p.stock}</span>}</Td>
            <Td className="space-x-1">
              {p.active ? <Pill tone="green">visible</Pill> : <Pill>hidden</Pill>}
              {p.featured && <Pill tone="blue">featured</Pill>}
            </Td>
            <Td className="row-actions">
              <div className="flex gap-1">
                <Btn view variant="ghost" onClick={() => edit(p)}><Pencil className="h-4 w-4" /></Btn>
                <Btn variant="ghost" onClick={() => confirm(`Delete ${p.name}?`) && remove.mutate(p.id)}><Trash2 className="h-4 w-4" /></Btn>
              </div>
            </Td>
          </tr>
        ))}
      </Table>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-3xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit product" : "New product"}</DialogTitle></DialogHeader>
          {editing && <ProductForm draft={editing} onDone={() => setEditing(null)} />}
          {editing?.id && (
            <Btn variant="danger" className="mt-3" onClick={() => { if (!confirm(`Delete ${editing.name}?`)) return; remove.mutate(editing.id!); setEditing(null); }}>Delete product</Btn>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
