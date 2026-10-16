import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Package, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ImagePreview from "@/components/ImagePreview";
import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useOrderActions } from "@/hooks/useApi";
import { useLanguage } from "@/i18n/LanguageContext";
import { ApiError, normalizePhone } from "@/lib/api";
import { formatTZS } from "@/lib/utils";

const Kikapu = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { lines, total, setQuantity, remove, clear } = useCart();
  const { create } = useOrderActions();
  const [delivery, setDelivery] = useState([user?.location, user?.region].filter(Boolean).join(", "));
  const [phone, setPhone] = useState(user?.phone.replace(/^\+255/, "0") ?? "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!delivery.trim()) return setError(`${t("shop.delivery")}: ${t("auth.err_required")}`);
    const normalized = normalizePhone(phone);
    if (!normalized) return setError(t("auth.err_phone"));
    try {
      await create.mutateAsync({
        items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
        deliveryLocation: delivery.trim(),
        phone: normalized,
        notes,
      });
      clear();
      toast.success(t("shop.order_placed"));
      navigate("/lipia");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("auth.err_generic");
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title={t("shop.cart")} backTo="/bidhaa" />

      {!lines.length ? (
        <div className="rounded-3xl border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">{t("shop.cart_empty")}</p>
          <Link to="/bidhaa" className="btn-lime mt-4">{t("dash.shop_now")}</Link>
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {lines.map(({ product, quantity }) => (
              <li key={product.id} className="flex items-center gap-3 rounded-2xl border bg-card p-3">
                {product.image ? (
                  <ImagePreview src={product.image} className="h-16 w-16 rounded-xl object-cover" />
                ) : (
                  <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-chip"><Package className="h-6 w-6 text-emerald" /></span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.unit} · {formatTZS(product.price)}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <button type="button" onClick={() => setQuantity(product.id, quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-full bg-chip"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-6 text-center text-sm font-bold tabular-nums">{quantity}</span>
                    <button type="button" disabled={quantity >= product.stock} onClick={() => setQuantity(product.id, quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald text-white disabled:opacity-40"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-sm font-bold tabular-nums">{formatTZS(product.price * quantity)}</p>
                  <button type="button" onClick={() => remove(product.id)} aria-label="Ondoa" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between rounded-2xl bg-chip px-4 py-3 font-display text-lg font-bold">
            <span>{t("shop.total")}</span>
            <span className="tabular-nums">{formatTZS(total)}</span>
          </div>

          <form onSubmit={submit} className="space-y-3 rounded-3xl border bg-card p-4" noValidate>
            <h2 className="text-base font-bold">{t("shop.checkout")}</h2>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("shop.delivery")}</label>
              <Input value={delivery} onChange={(e) => setDelivery(e.target.value)} placeholder={t("shop.delivery_ph")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("shop.pay_phone")}</label>
              <Input type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("shop.notes")}</label>
              <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <button type="submit" disabled={create.isPending} className="btn-lime w-full text-base">
              {t("shop.place_order")} · {formatTZS(total)}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default Kikapu;
