import { Banknote, CheckCircle2, FileText, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { Loan } from "@/types";

const LoanCard = ({ loan }: { loan: Loan }) => (
  <Card className="border-border/70 py-0">
    <CardContent className="space-y-3 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
          <Landmark className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {loan.loanType}
          </p>
          <h3 className="font-bold leading-snug">{loan.institution}</h3>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
        <Banknote className="h-4 w-4 shrink-0" />
        {loan.amount}
      </div>

      <div className="space-y-1.5 text-sm text-muted-foreground">
        <p className="flex items-start gap-2">
          <FileText className="mt-0.5 h-4 w-4 shrink-0" />
          {loan.repayment}
        </p>
        <p className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {loan.requirements[0]} ({loan.requirements.length} masharti)
        </p>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          className="flex-1 rounded-xl"
          onClick={() => toast.info(loan.howToApply)}
        >
          Jifunze Zaidi
        </Button>
        {loan.cta === "omba" && (
          <Button
            className="flex-1 rounded-xl"
            onClick={() =>
              toast.success(`Ombi la ${loan.loanType} limeandikwa — tutakupigia simu`)
            }
          >
            Omba Mkopo
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

export default LoanCard;
