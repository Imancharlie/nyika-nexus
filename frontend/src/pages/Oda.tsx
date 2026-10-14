import { useState } from "react";
import { Check, MapPin } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import PayDialog from "@/components/PayDialog";
import QueryState from "@/components/QueryState";
import { useOrderActions, useOrders } from "@/hooks/useApi";
import { useLanguage } from "@/i18n/LanguageContext";
import type { StringKey } from "@/i18n/strings";
import { ApiError } from "@/lib/api";
import { cn, formatDate, formatTZS } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const TRACK: OrderStatus[] = ["imepokelewa", "inaandaliwa", "njiani", "imefika"];

export const PaymentPill = ({ status }: { status: Order["paymentStatus"] }) => {
  const { t } = useLanguage();
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        status === "imelipwa" && "bg-emerald/10 text-emerald",
        status === "inasubiri" && "bg-gold/25 text-[#8a5a00]",
        status === "imeshindikana" && "bg-destructive/10 text-destructive",
      )}
    >
      {t(`pay.${status}` as StringKey)}
    </span>
  );
};

const Tracker = ({ status }: { status: OrderStatus }) => {
  const { t } = useLanguage();
  const idx = TRACK.indexOf(status);
  return (
    <ol className="space-y-0">
      {TRACK.map((s, i) => {
        const done = i < idx || (i === idx && s === "imefika");
        const now = i === idx && s !== "imefika";
        return (
          <li key={s} className={cn("relative flex items-center gap-3 py-1.5 text-sm", done || now ? "font-semibold" : "text-muted-foreground")}>
            {i > 0 && (
              <span className={cn("absolute left-[11px] top-[-50%] h-full w-[3px]", i <= idx ? "bg-gradient-to-b from-leaf to-emerald" : "bg-border")} />
            )}
            <span
              className={cn(
                "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-card",
                done && "border-emerald bg-emerald text-white",
                now && "border-leaf ring-4 ring-leaf/25",
              )}
            >
              {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
            </span>
            {t(`order.${s}` as StringKey)}
          </li>
        );
      })}
    </ol>
  );
};

const Oda = () => {
  const { t, lang } = useLanguage();
  const { data: orders = [], isLoading, isError, refetch } = useOrders();
  const { cancel } = useOrderActions();
  const [paying, setPaying] = useState<Order | null>(null);

  const cancelOrder = async (order: Order) => {
    try {
      await cancel.mutateAsync(order.id);
      toast.success(t("orders.cancelled"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("auth.err_generic"));
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title={t("orders.title")} />
      <p className="-mt-2 text-sm text-muted-foreground">{t("orders.sub")}</p>

      <QueryState isLoading={isLoading} isError={isError} onRetry={refetch} empty={!orders.length} emptyText={t("orders.none")}>
        <div className="space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="space-y-3 rounded-[24px] border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold">{order.code}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("orders.placed")} {formatDate(order.createdAt, lang)}
                  </p>
                </div>
                <PaymentPill status={order.paymentStatus} />
              </div>

              <ul className="space-y-1 text-sm">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3">
                    <span className="truncate">{item.quantity} × {item.name}</span>
                    <span className="tabular-nums text-muted-foreground">{formatTZS(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between border-t border-dashed pt-2 font-bold">
                <span>{t("shop.total")}</span>
                <span className="tabular-nums">{formatTZS(order.total)}</span>
              </div>

              {order.status === "imeghairiwa" ? (
                <p className="text-sm font-semibold text-destructive">{t("order.imeghairiwa")}</p>
              ) : (
                <Tracker status={order.status} />
              )}

              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {t("orders.deliver_to")}: {order.deliveryLocation}
              </p>

              {order.status !== "imeghairiwa" && order.paymentStatus !== "imelipwa" && (
                <div className="flex gap-2">
                  <button type="button" onClick={() => setPaying(order)} className="btn-lime flex-1 text-sm">
                    {t("orders.pay")}
                  </button>
                  {order.status === "imepokelewa" && (
                    <button
                      type="button"
                      onClick={() => cancelOrder(order)}
                      className="rounded-full border px-4 text-sm font-semibold text-muted-foreground hover:text-destructive"
                    >
                      {t("orders.cancel")}
                    </button>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      </QueryState>

      <PayDialog order={paying} onClose={() => setPaying(null)} />
    </div>
  );
};

export default Oda;
