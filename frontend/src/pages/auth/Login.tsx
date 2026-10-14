import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AuthShell, { AuthField, FormError, PasswordField } from "@/components/auth/AuthShell";
import { useAuth, type AuthPayload } from "@/context/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { api, ApiError } from "@/lib/api";

const Login = () => {
  const { t } = useLanguage();
  const { acceptAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const errs: typeof errors = {};
    if (!identifier.trim()) errs.identifier = t("auth.err_required");
    if (!password) errs.password = t("auth.err_required");
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const res = await api.post<AuthPayload>("/auth/login/", { identifier: identifier.trim(), password }, false);
      const user = acceptAuth(res);
      navigate(user.isStaff ? "/admin" : from && from !== "/ingia" ? from : "/", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.data?.code === "phone_unverified") {
        navigate("/thibitisha", { state: err.data });
        return;
      }
      if (err instanceof ApiError) setFormError(err.status === 0 ? t("auth.err_network") : err.message);
      else setFormError(t("auth.err_generic"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title={t("auth.login_title")}
      subtitle={t("auth.login_sub")}
      footer={
        <>
          {t("auth.no_account")}{" "}
          <Link to="/jisajili" className="font-semibold text-emerald hover:underline">
            {t("auth.signup_link")}
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <FormError message={formError} />
        <AuthField
          label={t("auth.identifier")}
          name="identifier"
          autoComplete="username"
          autoCapitalize="none"
          placeholder={t("auth.identifier_ph")}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          error={errors.identifier}
        />
        <PasswordField
          label={t("auth.password")}
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <div className="flex justify-end">
          <Link to="/sahau-nenosiri" className="text-sm font-semibold text-emerald hover:underline">
            {t("auth.forgot")}
          </Link>
        </div>
        <button type="submit" disabled={busy} className="btn-lime w-full text-base">
          {busy && <Loader2 className="h-5 w-5 animate-spin" />}
          {t("auth.login_btn")}
        </button>
      </form>
    </AuthShell>
  );
};

export default Login;
