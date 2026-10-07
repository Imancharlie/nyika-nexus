import { Landmark } from "lucide-react";
import LoanCard from "@/components/LoanCard";
import { loans } from "@/data/loans";

const Mikopo = () => (
  <div className="space-y-5 animate-fade-in">
    <section className="relative overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground">
      <div className="absolute -right-6 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <p className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/80">
        Mikopo
      </p>
      <h1 className="mt-1 text-xl font-bold leading-snug">
        Pata Fursa ya Mtaji kwa Kilimo
      </h1>
      <p className="mt-1 text-sm text-primary-foreground/85">
        Angalia fursa za mikopo na masharti yake. Ukurasa huu ni taarifa tu —
        maombi ya mkopo hufanyika kwa benki husika.
      </p>
    </section>

    <div className="space-y-4">
      {loans.map((loan) => (
        <LoanCard key={loan.id} loan={loan} />
      ))}
    </div>

    <p className="flex items-start gap-2 rounded-2xl bg-muted p-4 text-xs text-muted-foreground">
      <Landmark className="mt-0.5 h-4 w-4 shrink-0" />
      AGRIMIKA haikopi fedha. Taarifa hizi zinawasilishwa kwa niaba ya
      taasisi zilizotajwa ili kumsaidia mkulima kufahamu fursa zilizopo.
    </p>
  </div>
);

export default Mikopo;
