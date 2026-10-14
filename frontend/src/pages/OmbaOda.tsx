import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import QueryState from "@/components/QueryState";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useCreateOrderRequest, useOrderRequests } from "@/hooks/useApi";
import { useLanguage } from "@/i18n/LanguageContext";
import type { StringKey } from "@/i18n/strings";
import { ApiError } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import type { OrderRequestStatus, ProductCategory } from "@/types";

const CATS: ProductCategory[] = ["mbegu", "mbolea", "vifaa", "dawa", "mifugo"];

const statusClass: Record<OrderRequestStatus, string> = {
  mpya: "bg-sky-100 text-sky-800",
  inashughulikiwa: "bg-gold/25 text-[#8a5a00]",
  imekamilika: "bg-emerald/10 text-emerald",
  imekataliwa: "bg-destructive/10 text-destructive",
};

const FormField = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium">{label}</label>
    {children}
    {error && <p className="text-xs font-medium text-destructive">{error}</p>}
  </div>
);

const OmbaOda = () => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { data: requests = [], isLoading, isError, refetch } = useOrderRequests();
  const createRequest = useCreateOrderRequest();
  const [form, setForm] = useState({
    productName: "",
    category: "" as ProductCategory | "",
    quantity: "",
    location: [user?.location, user?.region].filter(Boolean).join(", "),
    neededBy: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((errs) => ({ ...errs, [key]: undefined }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.productName.trim()) errs.productName = t("auth.err_required");
    if (!form.quantity.trim()) errs.quantity = t("auth.err_required");
    if (!form.location.trim()) errs.location = t("auth.err_required");
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      await createRequest.mutateAsync({ ...form, neededBy: form.neededBy || null });
      toast.success(t("req.sent"));
      setForm((f) => ({ ...f, productName: "", category: "", quantity: "", neededBy: "", notes: "" }));
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({ neededBy: err.field("neededBy"), productName: err.field("productName") });
        toast.error(err.message);
      }
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title={t("req.title")} />
      <p className="-mt-3 text-sm text-muted-foreground">{t("req.sub")}</p>

      <form onSubmit={submit} noValidate className="space-y-3 rounded-[24px] border bg-card p-4">
        <FormField error={errors.productName} label={t("req.product")}>
          <Input value={form.productName} onChange={set("productName")} placeholder={t("req.product_ph")} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField error={errors.category} label={t("req.category")}>
            <select value={form.category} onChange={set("category")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="">—</option>
              {CATS.map((c) => (
                <option key={c} value={c}>{t(`shop.cat_${c}` as StringKey)}</option>
              ))}
            </select>
          </FormField>
          <FormField error={errors.quantity} label={t("req.quantity")}>
            <Input value={form.quantity} onChange={set("quantity")} placeholder={t("req.quantity_ph")} />
          </FormField>
        </div>
        <FormField error={errors.location} label={t("req.location")}>
          <Input value={form.location} onChange={set("location")} placeholder={t("shop.delivery_ph")} />
        </FormField>
        <FormField error={errors.neededBy} label={t("req.needed_by")}>
          <Input type="date" min={new Date().toISOString().slice(0, 10)} value={form.neededBy} onChange={set("neededBy")} />
        </FormField>
        <FormField error={errors.notes} label={t("req.notes")}>
          <Textarea rows={3} value={form.notes} onChange={set("notes")} />
        </FormField>
        <button type="submit" disabled={createRequest.isPending} className="btn-lime w-full">{t("req.send")}</button>
      </form>

      <section>
        <h2 className="mb-3 text-base font-bold">{t("req.mine")}</h2>
        <QueryState isLoading={isLoading} isError={isError} onRetry={refetch} empty={!requests.length} emptyText={t("req.none")}>
          <div className="space-y-2">
            {requests.map((r) => (
              <article key={r.id} className="rounded-2xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{r.productName}</p>
                    <p className="text-xs text-muted-foreground">{r.quantity} · {formatDate(r.createdAt, lang)}</p>
                  </div>
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", statusClass[r.status])}>
                    {t(`req.${r.status}` as StringKey)}
                  </span>
                </div>
                {r.adminReply && (
                  <div className="mt-3 rounded-xl bg-chip p-3 text-sm">
                    <p className="mb-0.5 text-xs font-bold text-emerald">{t("req.reply")}</p>
                    {r.adminReply}
                  </div>
                )}
              </article>
            ))}
          </div>
        </QueryState>
      </section>
    </div>
  );
};

export default OmbaOda;
