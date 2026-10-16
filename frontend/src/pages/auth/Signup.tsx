import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AuthShell, { AuthField, FormError, PasswordField } from "@/components/auth/AuthShell";
import { useAuth, type AuthPayload, type PendingVerification } from "@/context/AuthContext";
import { useLanguage, type Lang } from "@/i18n/LanguageContext";
import { api, ApiError, normalizePhone } from "@/lib/api";
import { TZ_REGIONS } from "@/lib/regions";

type Form = {
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  region: string;
  language: Lang;
  password: string;
  passwordConfirm: string;
};

const Signup = () => {
  const { t, lang, setLang } = useLanguage();
  const { acceptAuth } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState<Form>({
    username: "",
    firstName: "",
    lastName: "",
    phone: (params.get("phone") ?? "").replace(/^\+255/, "0"),
    region: "",
    language: lang,
    password: "",
    passwordConfirm: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm((f) => (f.language === lang ? f : { ...f, language: lang }));
  }, [lang]);

  const pickLanguage = (next: Lang) => {
    setLang(next);
    setForm((f) => ({ ...f, language: next }));
  };

  const set = (key: keyof Form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((errs) => ({ ...errs, [key]: undefined }));
  };

  const validate = () => {
    const errs: typeof errors = {};
    if (!/^[A-Za-z0-9_.]{3,30}$/.test(form.username)) errs.username = t("auth.err_username");
    if (!form.firstName.trim()) errs.firstName = t("auth.err_required");
    if (!form.lastName.trim()) errs.lastName = t("auth.err_required");
    if (!normalizePhone(form.phone)) errs.phone = t("auth.err_phone");
    if (form.password.length < 8) errs.password = t("auth.err_short");
    if (form.password !== form.passwordConfirm) errs.passwordConfirm = t("auth.err_match");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setBusy(true);
    try {
      const res = await api.post<AuthPayload | PendingVerification>(
        "/auth/register/",
        { ...form, phone: normalizePhone(form.phone) },
        false,
      );
      if ("requiresVerification" in res && res.requiresVerification) {
        navigate("/thibitisha", { state: res });
        return;
      }
      const user = acceptAuth(res as AuthPayload);
      navigate(user.isStaff ? "/admin" : "/", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldErrors: typeof errors = {};
        (Object.keys(form) as (keyof Form)[]).forEach((k) => {
          const msg = err.field(k);
          if (msg) fieldErrors[k] = msg;
        });
        setErrors(fieldErrors);
        if (!Object.keys(fieldErrors).length)
          setFormError(err.status === 0 ? t("auth.err_network") : err.message || t("auth.err_generic"));
      } else setFormError(t("auth.err_generic"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title={t("auth.signup_title")}
      subtitle={t("auth.signup_sub")}
      footer={
        <>
          {t("auth.have_account")}{" "}
          <Link to="/ingia" className="font-semibold text-emerald hover:underline">
            {t("auth.login_link")}
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <FormError message={formError} />
        <AuthField
          label={t("auth.username")}
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          value={form.username}
          onChange={set("username")}
          error={errors.username}
          hint={t("auth.username_hint")}
        />
        <div className="grid grid-cols-2 gap-3">
          <AuthField label={t("auth.first_name")} name="firstName" autoComplete="given-name" value={form.firstName} onChange={set("firstName")} error={errors.firstName} />
          <AuthField label={t("auth.last_name")} name="lastName" autoComplete="family-name" value={form.lastName} onChange={set("lastName")} error={errors.lastName} />
        </div>
        <AuthField
          label={t("auth.phone")}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="0712 345 678"
          value={form.phone}
          onChange={set("phone")}
          error={errors.phone}
          hint={t("auth.phone_hint")}
        />
        <div className="space-y-1.5">
          <label htmlFor="region" className="text-sm font-semibold">
            {t("auth.region")} <span className="font-normal text-muted-foreground">({t("common.optional")})</span>
          </label>
          <select
            id="region"
            value={form.region}
            onChange={set("region")}
            className="min-h-[52px] w-full rounded-2xl border-[1.5px] border-[#BFE3CB] bg-white px-4 text-base outline-none focus:border-emerald focus:ring-4 focus:ring-emerald/15"
          >
            <option value="">{t("auth.region_pick")}</option>
            {TZ_REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold">{t("auth.language")}</p>
          <div className="grid grid-cols-2 gap-3" role="group" aria-label={t("auth.language")}>
            {(["sw", "en"] as const).map((code) => (
              <button
                key={code}
                type="button"
                aria-pressed={form.language === code}
                onClick={() => pickLanguage(code)}
                className={
                  form.language === code
                    ? "min-h-[52px] rounded-2xl bg-forest text-base font-semibold text-white"
                    : "min-h-[52px] rounded-2xl border-[1.5px] border-[#BFE3CB] bg-white text-base font-semibold text-foreground"
                }
              >
                {code === "sw" ? "Kiswahili" : "English"}
              </button>
            ))}
          </div>
        </div>
        <PasswordField
          label={t("auth.password")}
          name="password"
          autoComplete="new-password"
          value={form.password}
          onChange={set("password")}
          error={errors.password}
          hint={t("auth.password_hint")}
        />
        <PasswordField
          label={t("auth.password_confirm")}
          name="passwordConfirm"
          autoComplete="new-password"
          value={form.passwordConfirm}
          onChange={set("passwordConfirm")}
          error={errors.passwordConfirm}
        />
        <button type="submit" disabled={busy} className="btn-lime mt-2 w-full text-base">
          {busy && <Loader2 className="h-5 w-5 animate-spin" />}
          {t("auth.signup_btn")}
        </button>
      </form>
    </AuthShell>
  );
};

export default Signup;
