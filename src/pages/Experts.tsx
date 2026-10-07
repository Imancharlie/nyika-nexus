import PageHeader from "@/components/PageHeader";
import ExpertCard from "@/components/ExpertCard";
import { experts } from "@/data/experts";

const Experts = () => (
  <div className="space-y-4 animate-fade-in">
    <div>
      <PageHeader title="Wataalamu" />
      <p className="-mt-2 mb-2 text-sm text-muted-foreground">
        Wataalamu wa kilimo waliothibitishwa wanaokusaidia bure au kwa bei nafuu.
      </p>
    </div>

    <div className="space-y-4">
      {experts.map((expert) => (
        <ExpertCard key={expert.id} expert={expert} />
      ))}
    </div>
  </div>
);

export default Experts;
