import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import AuthShell, { AuthField, FormError, PasswordField } from "@/components/auth/AuthShell";
import CodeInput from "@/components/auth/CodeInput";
import { useAuth, type AuthPayload } from "@/context/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { api, ApiError, normalizePhone } from "@/lib/api";

type Sent = { phone: string; phoneMasked: string; resendIn: number };

const ForgotPassword = () => {
  const { t } = useLanguage();
  const { acceptAuth } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState<Sent | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const id = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);

  const requestCode = async (e?: FormEvent) => {
    e?.preventDefault();
    setFormError(null);
    const normalized = normalizePhone(sent?.phone ?? phone);
    if (!normalized) {
      setErrors({ phone: t("auth.err_phone") });
      return;
    }
    setBusy(true);
    try {
      const res = await api.post<Sent>("/auth/password-reset/request/", { phone: normalized }, false);
      setSent(res);
      setWait(res.resendIn || 60);
      if (sent) toast.success(t("auth.code_sent"));
    } catch (err) {
      if (err instanceof ApiError && err.status === 503) setFormError(t("auth.sms_off"));
      else setFormError(err instanceof ApiError ? err.message : t("auth.err_generic"));
    } finally {
      setBusy(false);
    }
  };

  const reset = async (e: FormEvent) => {
    e.preventDefault();
    if (!sent) return;
    const errs: Record<string, string> = {};
    if (code.length !== 6) errs.code = t("auth.err_required");
    if (password.length < 8) errs.password = t("auth.err_short");
    if (password !== passwordConfirm) errs.passwordConfirm = t("auth.err_match");
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    setFormError(null);
    try {
      const res = await api.post<AuthPayload>(
        "/auth/password-reset/confirm/",
        { phone: sent.phone, code, password, passwordConfirm },
        false,
      );
      const user = acceptAuth(res);
      toast.success(t("auth.reset_done"));
      navigate(user.isStaff ? "/admin" : "/", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({ password: err.field("password"), passwordConfirm: err.field("passwordConfirm") });
        if (!err.field("password") && !err.field("passwordConfirm")) setFormError(err.message);
      } else setFormError(t("auth.err_generic"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title={t("auth.forgot_title")}
      subtitle={sent ? <>{t("auth.verify_sub")} <b className="text-foreground">{sent.phoneMasked}</b></> : t("auth.forgot_sub")}
      footer={
        <Link to="/ingia" className="font-semibold text-emerald hover:underline">
          {t("auth.login_link")}
        </Link>
      }
    >
      {!sent ? (
        <form onSubmit={requestCode} noValidate className="space-y-4">
          <FormError message={formError} />
          <AuthField
            label={t("auth.phone")}
            name="phone"
            type="tel"
            inputMode="tel"
            placeholder="0712 345 678"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setErrors({});
            }}
            error={errors.phone}
          />
          <button type="submit" disabled={busy} className="btn-lime w-full text-base">
            {busy && <Loader2 className="h-5 w-5 animate-spin" />}
            {t("auth.send_code")}
          </button>
        </form>
      ) : (
        <form onSubmit={reset} noValidate className="space-y-5">
          <FormError message={formError} />
          <div className="space-y-2">
            <p className="text-sm font-semibold">{t("auth.code")}</p>
            <CodeInput value={code} onChange={setCode} />
            {errors.code && <p className="text-center text-sm font-medium text-destructive">{errors.code}</p>}
          </div>
          <PasswordField label={t("auth.new_password")} name="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} hint={t("auth.password_hint")} />
          <PasswordField label={t("auth.password_confirm")} name="passwordConfirm" autoComplete="new-password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} error={errors.passwordConfirm} />
          <button type="submit" disabled={busy} className="btn-lime w-full text-base">
            {busy && <Loader2 className="h-5 w-5 animate-spin" />}
            {t("auth.reset_btn")}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            {wait > 0 ? `${t("auth.resend_in")} ${wait}` : (
              <button type="button" onClick={() => requestCode()} className="font-semibold text-emerald hover:underline">
                {t("auth.resend")}
              </button>
            )}
          </p>
        </form>
      )}
    </AuthShell>
  );
};

export default ForgotPassword;
