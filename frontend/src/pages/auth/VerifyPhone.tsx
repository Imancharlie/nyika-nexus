import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import AuthShell, { FormError } from "@/components/auth/AuthShell";
import CodeInput from "@/components/auth/CodeInput";
import { useAuth, type AuthPayload, type PendingVerification } from "@/context/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { api, ApiError } from "@/lib/api";

const VerifyPhone = () => {
  const { t } = useLanguage();
  const { user, acceptAuth } = useAuth();
  const navigate = useNavigate();
  const pending = useLocation().state as PendingVerification | null;
  const [code, setCode] = useState("");
  const [wait, setWait] = useState(pending?.resendIn ?? 60);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (wait <= 0) return;
    const id = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);

  if (!pending?.phone) return <Navigate to={user ? "/" : "/ingia"} replace />;

  const confirm = async (value = code) => {
    if (value.length !== 6) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<AuthPayload>("/auth/verify/confirm/", { phone: pending.phone, code: value }, false);
      const user = acceptAuth(res);
      toast.success(`${t("auth.welcome")}, ${user.firstName}!`);
      navigate(user.isStaff ? "/admin" : "/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("auth.err_generic"));
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    try {
      const res = await api.post<{ resendIn: number }>("/auth/verify/request/", { phone: pending.phone }, false);
      setWait(res.resendIn || 60);
      toast.success(t("auth.code_sent"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("auth.err_generic"));
    }
  };

  return (
    <AuthShell
      title={t("auth.verify_title")}
      subtitle={
        <>
          {t("auth.verify_sub")} <b className="text-foreground">{pending.phoneMasked}</b>
        </>
      }
    >
      <div className="space-y-6">
        <FormError message={error} />
        <CodeInput value={code} onChange={setCode} onComplete={confirm} />
        <button type="button" disabled={busy || code.length !== 6} onClick={() => confirm()} className="btn-lime w-full text-base">
          {busy && <Loader2 className="h-5 w-5 animate-spin" />}
          {t("auth.verify_btn")}
        </button>
        <p className="text-center text-sm text-muted-foreground">
          {wait > 0 ? (
            `${t("auth.resend_in")} ${wait}`
          ) : (
            <button type="button" onClick={resend} className="font-semibold text-emerald hover:underline">
              {t("auth.resend")}
            </button>
          )}
        </p>
      </div>
    </AuthShell>
  );
};

export default VerifyPhone;
