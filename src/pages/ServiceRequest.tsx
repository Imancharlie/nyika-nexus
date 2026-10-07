import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Home } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import NotFound from "./NotFound";
import { cropTypes, currentUser } from "@/data/user";
import { findPackage } from "@/data/services";
import { formatTZS } from "@/lib/utils";
import { useApp } from "@/context/AppContext";

type FormState = {
  name: string;
  phone: string;
  location: string;
  farmLocation: string;
  farmSize: string;
  cropType: string;
  preferredDate: string;
  notes: string;
};

const ServiceRequest = () => {
  const { id } = useParams();
  const pkg = findPackage(id);
  const { createServiceRequest } = useApp();

  const [form, setForm] = useState<FormState>({
    name: currentUser.name,
    phone: currentUser.phone,
    location: currentUser.location,
    farmLocation: "",
    farmSize: "",
    cropType: "",
    preferredDate: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [requestId, setRequestId] = useState<string | null>(null);

  if (!pkg) return <NotFound />;

  const set = (field: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Jina linahitajika";
    if (!form.phone.trim()) next.phone = "Namba ya simu inahitajika";
    else if (!/^[+\d][\d\s-]{6,}$/.test(form.phone.trim()))
      next.phone = "Weka namba sahihi ya simu";
    if (!form.location.trim()) next.location = "Mahali linahitajika";
    if (!form.farmLocation.trim()) next.farmLocation = "Mahali pa shamba linahitajika";
    if (!form.farmSize.trim()) next.farmSize = "Ukubwa wa shamba unahitajika";
    if (!form.cropType) next.cropType = "Chagua aina ya zao";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    const newId = createServiceRequest({ package: pkg, ...form });
    setRequestId(newId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (requestId) {
    return (
      <div className="animate-fade-in">
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-6 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <CheckCircle2 className="h-9 w-9" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-primary">
            ✓ Ombi lako limetumwa!
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">Namba ya Ombi:</p>
          <p className="text-2xl font-bold tracking-wider">{requestId}</p>
          <p className="mt-4 text-sm text-muted-foreground">Huduma:</p>
          <p className="font-semibold">{pkg.name}</p>
          <div className="mx-auto mt-4 max-w-xs rounded-xl bg-card p-3 text-sm text-muted-foreground">
            Tutawasiliana nawe kuendelea na hatua zinazofuata.
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <Link
            to="/wasifu?tab=huduma"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 font-bold text-primary-foreground"
          >
            Fuatilia Ombi Langu <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/huduma"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border px-4 py-4 font-semibold text-foreground"
          >
            <Home className="h-4 w-4" /> Rudi kwenye Huduma
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Agiza Huduma" backTo={`/huduma/${pkg.id}`} />

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
        <Field label="Jina lako" error={errors.name}>
          <Input
            value={form.name}
            onChange={(event) => set("name")(event.target.value)}
            placeholder="Mfano: Juma Hassan"
          />
        </Field>

        <Field label="Namba ya simu" error={errors.phone}>
          <Input
            type="tel"
            value={form.phone}
            onChange={(event) => set("phone")(event.target.value)}
            placeholder="+255 7XX XXX XXX"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Mahali" error={errors.location}>
            <Input
              value={form.location}
              onChange={(event) => set("location")(event.target.value)}
              placeholder="Mkoa / Wilaya"
            />
          </Field>
          <Field label="Mahali pa shamba" error={errors.farmLocation}>
            <Input
              value={form.farmLocation}
              onChange={(event) => set("farmLocation")(event.target.value)}
              placeholder="Kijiji / Kata"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Ukubwa wa shamba" error={errors.farmSize}>
            <Input
              value={form.farmSize}
              onChange={(event) => set("farmSize")(event.target.value)}
              placeholder="Mfano: 2 acres"
            />
          </Field>
          <Field label="Tarehe inayopendelea" error={errors.preferredDate}>
            <Input
              type="date"
              value={form.preferredDate}
              onChange={(event) => set("preferredDate")(event.target.value)}
            />
          </Field>
        </div>

        <Field label="Aina ya zao" error={errors.cropType}>
          <select
            value={form.cropType}
            onChange={(event) => set("cropType")(event.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Chagua zao...</option>
            {cropTypes.map((crop) => (
              <option key={crop} value={crop}>
                {crop}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Taarifa za ziada" error={errors.notes}>
          <Textarea
            value={form.notes}
            onChange={(event) => set("notes")(event.target.value)}
            placeholder="Eleza kwa ufupi hali ya shamba lako (hiari)..."
            rows={4}
          />
        </Field>

        <Button type="submit" className="w-full rounded-2xl py-5 text-base font-bold">
          Agiza Huduma <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
        <p className="pb-2 text-center text-xs text-muted-foreground">
          Baada ya kuomba, tutakupigia simu kuthibitisha maelezo yako.
        </p>
      </form>
    </div>
  );
};

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label className="text-sm">{label}</Label>
    {children}
    {error && <p className="text-xs font-medium text-destructive">{error}</p>}
  </div>
);

export default ServiceRequest;
