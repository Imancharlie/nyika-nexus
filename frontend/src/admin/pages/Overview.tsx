import { Link } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, KeyRound } from "lucide-react";
import { useAdminQuery } from "../lib";
import { Card, PageTitle, Stat } from "../ui";
import BrandLoader from "@/components/BrandLoader";
import { formatTZS } from "@/lib/utils";

type Point = { date: string; value: number };
type Metrics = {
  totals: Record<string, number>;
  signups: Point[];
  revenueDaily: Point[];
  ordersDaily: Point[];
  ordersByStatus: { status: string; count: number }[];
  usersByRegion: { region: string; count: number }[];
  topProducts: { name: string; units: number; revenue: number }[];
  sms: { ready: boolean; sent30d: number; failed30d: number };
  paymentsReady: boolean;
};

const COLORS = ["#0B7A43", "#34C16B", "#C8F169", "#0A3D73", "#FFD36A", "#D93A29"];
const shortDay = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const Overview = () => {
  const { data, isLoading } = useAdminQuery<Metrics>("/admin/metrics/");
  const [showLoader, setShowLoader] = useState(false);
  useEffect(() => {
    if (!isLoading) {
      setShowLoader(false);
      return;
    }
    const timer = window.setTimeout(() => setShowLoader(true), 320);
    return () => window.clearTimeout(timer);
  }, [isLoading]);

  if (isLoading || !data)
    return showLoader ? (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-[#f2fbf5] py-20 text-[#3c5a49]">
        <BrandLoader /> Loading metrics...
      </div>
    ) : <div className="min-h-16" />;

  const t = data.totals;
  const todo = [
    { n: t.ordersOpen, label: "open orders", to: "/admin/orders" },
    { n: t.paymentsPending, label: "payments to confirm", to: "/admin/payments" },
    { n: t.orderRequestsNew, label: "new order requests", to: "/admin/orders?tab=requests" },
    { n: t.serviceRequestsPending, label: "service requests waiting", to: "/admin/services" },
    { n: t.consultationsUnanswered, label: "consultations to answer", to: "/admin/consultations" },
    { n: t.ticketsOpen, label: "open support tickets", to: "/admin/support" },
    { n: t.lowStock, label: "products low on stock", to: "/admin/products" },
  ].filter((x) => x.n > 0);

  return (
    <div className="space-y-6">
      <PageTitle title="Overview" subtitle="How AGRIMIKA is doing today." />

      {(!data.sms.ready || !data.paymentsReady) && (
        <Link to="/admin/integrations" className="flex items-center gap-3 rounded-[22px] border border-gold/60 bg-gold/15 p-4 text-sm">
          <KeyRound className="h-5 w-5 shrink-0 text-[#8a5a00]" />
          <span className="flex-1">
            {!data.sms.ready && "SMS (Beem) is not switched on yet, so phone verification and password reset by SMS are off. "}
            {!data.paymentsReady && "No payment gateway configured: payments are confirmed manually."}
          </span>
          <span className="font-semibold text-emerald">Open API settings →</span>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat tone="green" label="Farmers" value={t.users.toLocaleString()} hint={`+${t.newUsers7d} this week · ${t.usersVerified} verified`} />
        <Stat tone="navy" label="Revenue (30 days)" value={formatTZS(t.revenue30d)} hint={`${formatTZS(t.revenue)} all time`} />
        <Stat label="Orders" value={t.orders.toLocaleString()} hint={`${t.ordersOpen} in progress`} />
        <Stat label="Active users (30 days)" value={t.activeUsers30d.toLocaleString()} hint={`${t.posts} posts · ${t.groups} groups`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-bold">New farmers (30 days)</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={data.signups}>
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#34C16B" stopOpacity={0.5} />
                    <stop offset="1" stopColor="#34C16B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3efe7" />
                <XAxis dataKey="date" tickFormatter={shortDay} fontSize={11} interval={4} />
                <YAxis allowDecimals={false} fontSize={11} width={30} />
                <Tooltip labelFormatter={shortDay} />
                <Area type="monotone" dataKey="value" name="Sign-ups" stroke="#0B7A43" strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-bold">Needs attention</h2>
          {todo.length ? (
            <ul className="space-y-2">
              {todo.map((x) => (
                <li key={x.label}>
                  <Link to={x.to} className="flex items-center gap-3 rounded-2xl bg-chip/60 px-3 py-2.5 text-sm hover:bg-chip">
                    <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-emerald px-2 font-bold text-white">{x.n}</span>
                    {x.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-emerald" /> All caught up.
            </p>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-bold">Revenue per day (TSh)</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={data.revenueDaily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3efe7" />
                <XAxis dataKey="date" tickFormatter={shortDay} fontSize={11} interval={4} />
                <YAxis fontSize={11} width={60} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
                <Tooltip labelFormatter={shortDay} formatter={(v: number) => formatTZS(v)} />
                <Bar dataKey="value" name="Revenue" fill="#0A3D73" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-bold">Orders by status</h2>
          {data.ordersByStatus.length ? (
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={data.ordersByStatus} dataKey="count" nameKey="status" innerRadius={50} outerRadius={85} paddingAngle={3}>
                    {data.ordersByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="mb-3 font-bold">Farmers by region</h2>
          {data.usersByRegion.length ? (
            <ul className="space-y-2 text-sm">
              {data.usersByRegion.map((r) => (
                <li key={r.region} className="flex items-center gap-3">
                  <span className="w-28 truncate">{r.region}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-chip">
                    <span className="block h-full rounded-full bg-gradient-to-r from-leaf to-emerald" style={{ width: `${(r.count / data.usersByRegion[0].count) * 100}%` }} />
                  </span>
                  <span className="w-8 text-right tabular-nums text-muted-foreground">{r.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No region data yet.</p>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-bold">Top products</h2>
          {data.topProducts.length ? (
            <ul className="space-y-2 text-sm">
              {data.topProducts.map((p) => (
                <li key={p.name} className="flex justify-between gap-3">
                  <span className="truncate">{p.name}</span>
                  <span className="whitespace-nowrap tabular-nums text-muted-foreground">{p.units} · {formatTZS(p.revenue)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No sales yet.</p>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-bold">SMS (30 days)</h2>
          <div className="flex items-center gap-2 text-sm">
            {data.sms.ready ? (
              <><CheckCircle2 className="h-5 w-5 text-emerald" /> Beem SMS is live</>
            ) : (
              <><AlertTriangle className="h-5 w-5 text-[#B8741A]" /> Not configured</>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-2xl bg-chip/60 p-3">
              <p className="font-display text-2xl font-bold">{data.sms.sent30d}</p>
              <p className="text-xs text-muted-foreground">sent</p>
            </div>
            <div className="rounded-2xl bg-chip/60 p-3">
              <p className="font-display text-2xl font-bold">{data.sms.failed30d}</p>
              <p className="text-xs text-muted-foreground">failed</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
