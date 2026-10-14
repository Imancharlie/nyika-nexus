import { useState, type FormEvent } from "react";
import { Bell, Globe, Info, KeyRound, Phone, Shield, UserRound } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LanguageSwitch } from "@/components/auth/AuthShell";
import { useAuth, type AuthPayload, type User } from "@/context/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { api, ApiError, prettyPhone } from "@/lib/api";
import { TZ_REGIONS } from "@/lib/regions";

const settings = [
  { id: "huduma", label: "set.alert_services", description: "set.alert_services_d" },
  { id: "ushauri", label: "set.alert_advice", description: "set.alert_advice_d" },
  { id: "mafunzo", label: "set.alert_learning", description: "set.alert_learning_d" },
  { id: "mikopo", label: "set.alert_loans", description: "set.alert_loans_d" },
] as const;

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-2xl border border-border/70 bg-card">
    <p className="border-b border-border/60 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {title}
    </p>
    {children}
  </section>
);

const Mipangilio = () => {
  const { t } = useLanguage();
  const { user, setUser, acceptAuth } = useAuth();
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    huduma: true,
    ushauri: true,
    mafunzo: true,
    mikopo: false,
  });
  const [profile, setProfile] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    region: user?.region ?? "",
    location: user?.location ?? "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  if (!user) return null;

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      setUser(await api.patch<User>("/auth/me/", profile));
      toast.success(t("set.saved"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("set.save_failed"));
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      acceptAuth(await api.post<AuthPayload>("/auth/change-password/", passwords));
      setPasswords({ currentPassword: "", newPassword: "" });
      toast.success(t("set.password_changed"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("set.password_failed"));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title={t("set.title")} />

      <Section title={t("set.profile")}>
        <form onSubmit={saveProfile} className="space-y-3 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <UserRound className="h-5 w-5 text-primary" /> @{user.username}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} placeholder={t("set.first_name")} />
            <Input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} placeholder={t("set.last_name")} />
          </div>
          <select
            value={profile.region}
            onChange={(e) => setProfile({ ...profile, region: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">{t("set.region_pick")}</option>
            {TZ_REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <Input value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} placeholder={t("set.location_ph")} />
          <Button type="submit" disabled={savingProfile} className="w-full rounded-xl">{t("common.save")}</Button>
        </form>
      </Section>

      <Section title={t("set.alerts")}>
        {settings.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3.5 last:border-b-0">
            <div>
              <p className="text-sm font-medium">{t(item.label)}</p>
              <p className="text-xs text-muted-foreground">{t(item.description)}</p>
            </div>
            <Switch
              checked={enabled[item.id]}
              onCheckedChange={(checked) => setEnabled((prev) => ({ ...prev, [item.id]: checked }))}
            />
          </div>
        ))}
      </Section>

      <Section title={t("set.general")}>
        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3.5">
          <Globe className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">{t("set.language")}</p>
            <p className="text-xs text-muted-foreground">Kiswahili · English</p>
          </div>
          <LanguageSwitch />
        </div>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Phone className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">{t("set.contact")}</p>
            <p className="text-xs text-muted-foreground">
              {prettyPhone(user.phone)} {user.phoneVerified ? `· ${t("set.verified")}` : ""}
            </p>
          </div>
        </div>
      </Section>

      <Section title={t("set.password")}>
        <form onSubmit={changePassword} className="space-y-3 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <KeyRound className="h-5 w-5 text-primary" /> {t("set.change_password")}
          </div>
          <Input type="password" autoComplete="current-password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} placeholder={t("set.current_password")} />
          <Input type="password" autoComplete="new-password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} placeholder={t("set.new_password")} />
          <Button type="submit" variant="outline" disabled={savingPassword || !passwords.currentPassword || passwords.newPassword.length < 8} className="w-full rounded-xl">
            {t("set.change")}
          </Button>
        </form>
      </Section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <p className="text-sm font-medium">{t("set.privacy")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Info className="h-5 w-5 text-primary" />
          <p className="text-sm font-medium">{t("set.about")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-primary" />
          <p className="text-sm font-medium">{t("set.version")}: 1.0.0</p>
        </div>
      </section>
    </div>
  );
};

export default Mipangilio;
