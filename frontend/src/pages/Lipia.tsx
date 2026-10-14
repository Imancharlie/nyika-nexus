import { useState } from "react";
import { Wallet } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PayDialog from "@/components/PayDialog";
import QueryState from "@/components/QueryState";
import { useOrders, usePayments } from "@/hooks/useApi";
import { useLanguage } from "@/i18n/LanguageContext";
import type { StringKey } from "@/i18n/strings";
import { cn, formatDate, formatTZS } from "@/lib/utils";
import type { Order } from "@/types";

const Lipia = () => {
  const { t, lang } = useLanguage();
  const { data: orders = [] } = useOrders();
  const { data: payments = [], isLoading, isError, refetch } = usePayments();
  const [paying, setPaying] = useState<Order | null>(null);

  const due = orders.filter((o) => o.status !== "imeghairiwa" && o.paymentStatus !== "imelipwa");
  const totalPaid = payments.filter((p) => p.status === "imelipwa").reduce((n, p) => n + p.amount, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title={t("pay.title")} />

      <section className="rounded-[28px] bg-navy p-5 text-white">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
          <Wallet className="h-6 w-6" />
        </span>
        <p className="mt-4 text-sm text-white/75">{t("pay.total_paid")}</p>
        <p className="font-display text-3xl font-bold tabular-nums">{formatTZS(totalPaid)}</p>
        <p className="mt-1 text-sm text-white/75">{t("pay.sub")}</p>
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold">{t("pay.due")}</h2>
        {due.length ? (
          <div className="space-y-2">
            {due.map((order) => (
              <div key={order.id} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{order.code}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {order.items.map((i) => i.name).join(", ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold tabular-nums">{formatTZS(order.total)}</p>
                  <button type="button" onClick={() => setPaying(order)} className="mt-1 rounded-full bg-emerald px-3 py-1.5 text-xs font-semibold text-white">
                    {t("orders.pay")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed p-4 text-center text-sm text-muted-foreground">{t("pay.none_due")}</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold">{t("pay.history")}</h2>
        <QueryState isLoading={isLoading} isError={isError} onRetry={refetch} empty={!payments.length} emptyText={t("pay.none")}>
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.reference} · {formatDate(p.paidAt ?? p.createdAt, lang)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold tabular-nums">{formatTZS(p.amount)}</p>
                  <p
                    className={cn(
                      "text-xs font-semibold",
                      p.status === "imelipwa" && "text-emerald",
                      p.status === "inasubiri" && "text-[#B8741A]",
                      p.status === "imeshindikana" && "text-destructive",
                    )}
                  >
                    {t(`pay.${p.status}` as StringKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </QueryState>
      </section>

      <PayDialog order={paying} onClose={() => setPaying(null)} />
    </div>
  );
};

export default Lipia;
