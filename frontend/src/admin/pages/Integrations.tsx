import { useState } from "react";
import { CheckCircle2, CircleDashed, KeyRound, Lock, MessageSquareText, Wallet } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { adminApi, fmtDate, useAdminMutation, useAdminQuery } from "../lib";
import { Btn, Card, Field, inputClass, PageTitle, Pill } from "../ui";
import { toast } from "sonner";

type Integration = {
  kind: "sms" | "payment";
  provider: string;
  providerLabel: string;
  enabled: boolean;
  configured: boolean;
  ready: boolean;
  publicFields: string[];
  secretFields: string[];
  requiredFields: string[];
  config: Record<string, string>;
  secrets: Record<string, { set: boolean; masked: string }>;
  updatedAt: string;
};

const LABELS: Record<string, { label: string; hint?: string }> = {
  sender_id: { label: "Sender ID", hint: "The approved sender name in your Beem account, e.g. AGRIMIKA" },
  api_key: { label: "API key" },
  secret_key: { label: "Secret key" },
  provider_name: { label: "Provider name", hint: "e.g. Selcom, AzamPay, ClickPesa" },
  base_url: { label: "API base URL", hint: "From the provider's documentation" },
  merchant_id: { label: "Merchant / vendor ID" },
  callback_url: { label: "Callback URL", hint: "Give this to the provider: https://<your-domain>/api/payments/webhook/" },
  currency: { label: "Currency", hint: "TZS" },
  webhook_secret: { label: "Webhook secret", hint: "Sent by the provider in the X-Webhook-Secret header" },
};

const INFO = {
  sms: {
    icon: MessageSquareText,
    title: "SMS: Beem Africa",
    text: "Paste your Beem API key and secret (Beem dashboard → Profile → Authentication information) and switch it on. Phone verification at sign-up, password reset by SMS and SMS announcements start working immediately.",
  },
  payment: {
    icon: Wallet,
    title: "Payments: gateway (placeholder)",
    text: "No provider chosen yet. Until one is connected, farmers' payment requests appear under Payments for you to confirm manually. When you pick a provider, enter its details here; the request format may need a small code adjustment for that provider.",
  },
};

const IntegrationCard = ({ item }: { item: Integration }) => {
  const [config, setConfig] = useState(item.config);
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [testPhone, setTestPhone] = useState("");
  const info = INFO[item.kind];
  const Icon = info.icon;

  const save = useAdminMutation(
    (body: Record<string, unknown>) => adminApi.put(`/admin/integrations/${item.kind}/`, body),
    "Settings saved (keys are stored encrypted)",
  );
  const test = useAdminMutation(async () => {
    const res = await adminApi.post<{ ok: boolean; detail: string }>(`/admin/integrations/${item.kind}/`, { phone: testPhone });
    if (res.ok) toast.success(item.kind === "sms" ? "Test SMS sent. Check the phone." : res.detail);
    else toast.error(`Test failed: ${res.detail}`);
    return res;
  });

  const submit = async () => {
    await save.mutateAsync({ config, secrets });
    setSecrets({});
  };

  const toggle = useAdminMutation(
    (enabled: boolean) => adminApi.put(`/admin/integrations/${item.kind}/`, { enabled }),
    item.enabled ? "Switched off" : "Switched on",
  );

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl badge-grad text-white"><Icon className="h-5 w-5" /></span>
          <div>
            <h2 className="text-lg font-bold">{info.title}</h2>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {item.ready ? <Pill tone="green"><CheckCircle2 className="mr-1 h-3 w-3" /> Live</Pill> : item.configured ? <Pill tone="amber">Configured, switched off</Pill> : <Pill><CircleDashed className="mr-1 h-3 w-3" /> Not configured</Pill>}
            </div>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <Switch checked={item.enabled} disabled={!item.configured || toggle.isPending} onCheckedChange={(v) => toggle.mutate(v)} /> {item.enabled ? "On" : "Off"}
        </label>
      </div>
      <p className="text-sm text-muted-foreground">{info.text}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {item.publicFields.map((f) => (
          <Field key={f} label={`${LABELS[f]?.label ?? f}${item.requiredFields.includes(f) ? " *" : ""}`} hint={LABELS[f]?.hint}>
            <input className={inputClass} value={config[f] ?? ""} onChange={(e) => setConfig({ ...config, [f]: e.target.value })} />
          </Field>
        ))}
        {item.secretFields.map((f) => (
          <Field key={f} label={`${LABELS[f]?.label ?? f}${item.requiredFields.includes(f) ? " *" : ""}`} hint={item.secrets[f]?.set ? `Saved: ${item.secrets[f].masked}. Leave blank to keep it.` : LABELS[f]?.hint}>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                autoComplete="off"
                className={`${inputClass} pl-9`}
                value={secrets[f] ?? ""}
                placeholder={item.secrets[f]?.set ? "••••••••" : "Paste here"}
                onChange={(e) => setSecrets({ ...secrets, [f]: e.target.value })}
              />
            </div>
          </Field>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t pt-4">
        <Btn onClick={submit} disabled={save.isPending}><KeyRound className="h-4 w-4" /> Save</Btn>
        {item.kind === "sms" ? (
          <>
            <input className={`${inputClass} w-48`} placeholder="Test phone (0712…)" value={testPhone} onChange={(e) => setTestPhone(e.target.value)} />
            <Btn variant="outline" disabled={!item.configured || test.isPending} onClick={() => test.mutate(undefined)}>Send test SMS</Btn>
          </>
        ) : (
          <Btn variant="outline" disabled={!item.configured || test.isPending} onClick={() => test.mutate(undefined)}>Check settings</Btn>
        )}
        <span className="ml-auto text-xs text-muted-foreground">Last updated {fmtDate(item.updatedAt)}</span>
      </div>
    </Card>
  );
};

const Integrations = () => {
  const { data } = useAdminQuery<Integration[]>("/admin/integrations/");
  return (
    <div className="space-y-6">
      <PageTitle title="API settings" subtitle="Connect SMS and payments. Keys are encrypted before they are saved and are never shown again in full." />
      {data?.map((item) => <IntegrationCard key={`${item.kind}-${item.updatedAt}`} item={item} />)}
    </div>
  );
};

export default Integrations;
