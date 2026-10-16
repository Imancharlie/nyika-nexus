import { useState } from "react";
import { CheckCircle2, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useOrderActions, type PayResult } from "@/hooks/useApi";
import { useLanguage } from "@/i18n/LanguageContext";
import { ApiError, normalizePhone } from "@/lib/api";
import { formatTZS } from "@/lib/utils";
import type { Order } from "@/types";

type Props = { order: Order | null; onClose: () => void };

const PayDialog = ({ order, onClose }: Props) => {
  const { t } = useLanguage();
  const { pay } = useOrderActions();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PayResult | null>(null);

  const close = () => {
    setResult(null);
    setError(null);
    setPhone("");
    onClose();
  };

  const confirm = async () => {
    if (!order) return;
    const normalized = phone ? normalizePhone(phone) : order.phone;
    if (!normalized) return setError(t("auth.err_phone"));
    setError(null);
    try {
      const paid = await pay.mutateAsync({ id: order.id, phone: normalized });
      setResult(paid);
      const note = paid.gateway === "failed" ? t("pay.failed_msg") : paid.gateway === "manual" ? t("pay.manual_msg") : t("pay.pending_msg");
      if (paid.gateway === "failed") toast.error(note);
      else toast.success(note);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("auth.err_generic");
      setError(message);
      toast.error(message);
    }
  };

  const message = result
    ? result.gateway === "pending_confirmation"
      ? t("pay.pending_msg")
      : result.gateway === "manual"
        ? t("pay.manual_msg")
        : t("pay.failed_msg")
    : null;

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle>{t("pay.confirm_title")}</DialogTitle>
        </DialogHeader>
        {order && !result && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-navy p-4 text-white">
              <p className="text-sm text-white/75">{order.code}</p>
              <p className="font-display text-3xl font-bold tabular-nums">{formatTZS(order.total)}</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("pay.phone")}</label>
              <Input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={order.phone.replace(/^\+255/, "0")}
              />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <button type="button" onClick={confirm} disabled={pay.isPending} className="btn-lime w-full">
              {pay.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Smartphone className="h-5 w-5" />}
              {t("pay.confirm")}
            </button>
          </div>
        )}
        {result && (
          <div className="space-y-4 text-center">
            <CheckCircle2 className={`mx-auto h-14 w-14 ${result.gateway === "failed" ? "text-destructive" : "text-emerald"}`} />
            <p className="text-sm">{message}</p>
            <p className="text-xs text-muted-foreground">{result.payment.reference}</p>
            <button type="button" onClick={close} className="btn-lime w-full">OK</button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PayDialog;
