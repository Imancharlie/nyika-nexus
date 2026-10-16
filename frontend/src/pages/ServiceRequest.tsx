import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Home } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import QueryState from "@/components/QueryState";
import NotFound from "./NotFound";
import { cropTypes, formatTZS } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useCreateServiceRequest, usePackage } from "@/hooks/useApi";
import { useLanguage } from "@/i18n/LanguageContext";
import { ApiError, prettyPhone } from "@/lib/api";

type FormState = {
  location: string;
  farmLocation: string;
  farmSize: string;
  cropType: string;
  preferredDate: string;
  notes: string;
};

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-sm">{label}</Label>
    {children}
    {error && <p className="text-xs font-medium text-destructive">{error}</p>}
  </div>
);

const ServiceRequest = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { data: pkg, isLoading } = usePackage(id);
  const { user } = useAuth();
  const createRequest = useCreateServiceRequest();

  const [form, setForm] = useState<FormState>({
    location: [user?.location, user?.region].filter(Boolean).join(", "),
    farmLocation: "",
    farmSize: "",
    cropType: "",
    preferredDate: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [requestId, setRequestId] = useState<string | null>(null);

  if (isLoading) return <QueryState isLoading isError={false}>{null}</QueryState>;
  if (!pkg) return <NotFound />;

  const set = (field: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!form.location.trim()) next.location = t("svc.err_location");
    if (!form.farmLocation.trim()) next.farmLocation = t("svc.err_farm_location");
    if (!form.farmSize.trim()) next.farmSize = t("svc.err_farm_size");
    if (!form.preferredDate) next.preferredDate = t("svc.err_date");
    if (!form.cropType) next.cropType = t("svc.err_crop");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    try {
      const created = await createRequest.mutateAsync({ packageId: pkg.id, ...form });
      setRequestId(created.id);
      toast.success(t("svc.sent"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({ preferredDate: err.field("preferredDate") });
        toast.error(err.message);
      }
    }
  };

  if (requestId) {
    return (
      <div className="animate-fade-in">
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-6 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <CheckCircle2 className="h-9 w-9" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-primary">{t("svc.sent")}</h1>
          <p className="mt-4 text-sm text-muted-foreground">{t("svc.request_no")}</p>
          <p className="text-2xl font-bold tracking-wider">{requestId}</p>
          <p className="mt-4 text-sm text-muted-foreground">{t("svc.service")}</p>
          <p className="font-semibold">{pkg.name}</p>
          <div className="mx-auto mt-4 max-w-xs rounded-xl bg-card p-3 text-sm text-muted-foreground">
            {t("svc.we_will_call")}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <Link
            to="/wasifu?tab=huduma"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 font-bold text-primary-foreground"
          >
            {t("svc.track")} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/huduma"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border px-4 py-4 font-semibold text-foreground"
          >
            <Home className="h-4 w-4" /> {t("svc.back")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title={t("svc.order")} backTo={`/huduma/${pkg.id}`} />

      <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4">
        <div>
          <p className="font-bold">{pkg.name}</p>
          <p className="text-xs text-muted-foreground">
            {pkg.coverage} · {pkg.duration}
          </p>
        </div>
        <span className="whitespace-nowrap rounded-lg bg-accent px-2 py-1 text-sm font-bold text-primary">
          {formatTZS(pkg.price)}
        </span>
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        {user && (
          <div className="rounded-2xl bg-chip px-4 py-3 text-sm">
            <p className="font-semibold">{user.fullName}</p>
            <p className="text-muted-foreground">{prettyPhone(user.phone)}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("svc.location")} error={errors.location}>
            <Input value={form.location} onChange={(e) => set("location")(e.target.value)} placeholder={t("svc.location_ph")} />
          </Field>
          <Field label={t("svc.farm_location")} error={errors.farmLocation}>
            <Input value={form.farmLocation} onChange={(e) => set("farmLocation")(e.target.value)} placeholder={t("svc.farm_location_ph")} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("svc.farm_size")} error={errors.farmSize}>
            <Input value={form.farmSize} onChange={(e) => set("farmSize")(e.target.value)} placeholder={t("svc.farm_size_ph")} />
          </Field>
          <Field label={t("svc.date")} error={errors.preferredDate}>
            <Input
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={form.preferredDate}
              onChange={(e) => set("preferredDate")(e.target.value)}
            />
          </Field>
        </div>

        <Field label={t("svc.crop")} error={errors.cropType}>
          <select
            value={form.cropType}
            onChange={(e) => set("cropType")(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">{t("svc.crop_pick")}</option>
            {cropTypes.map((crop) => (
              <option key={crop} value={crop}>{crop}</option>
            ))}
          </select>
        </Field>

        <Field label={t("svc.notes")} error={errors.notes}>
          <Textarea value={form.notes} onChange={(e) => set("notes")(e.target.value)} placeholder={t("svc.notes_ph")} rows={4} />
        </Field>

        <Button type="submit" disabled={createRequest.isPending} className="w-full rounded-2xl py-5 text-base font-bold">
          {t("svc.order")} <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
        <p className="pb-2 text-center text-xs text-muted-foreground">{t("svc.call_note")}</p>
      </form>
    </div>
  );
};

export default ServiceRequest;
