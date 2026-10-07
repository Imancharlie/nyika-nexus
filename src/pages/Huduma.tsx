import { Link } from "react-router-dom";
import { MessagesSquare, ShieldCheck } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import { servicePackages } from "@/data/services";

const Huduma = () => (
  <div className="space-y-5 animate-fade-in">
    <section>
      <h1 className="text-2xl font-bold tracking-tight">Huduma</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Agiza huduma za kilimo zinazotolewa na Mika Venture.
      </p>
    </section>

    <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <ShieldCheck className="h-5 w-5" />
      </span>
      <div className="text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Si duka la bidhaa</p>
        <p>
          Hapa unaagiza huduma halisi — fumigation, uchambuzi wa udongo na
          ushauri wa kitaalamu kwa shamba lako.
        </p>
      </div>
    </div>

    <div className="space-y-4">
      {servicePackages.map((pkg) => (
        <ServiceCard key={pkg.id} pkg={pkg} />
      ))}
    </div>

    <Link
      to="/ushauri"
      className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/50 bg-primary/5 px-4 py-4 text-sm font-semibold text-primary"
    >
      <MessagesSquare className="h-5 w-5" />
      Je, unahitaji ushauri kwanza? Tuma tatizo lako kwa mtaalamu
    </Link>
  </div>
);

export default Huduma;
