import { Phone, MapPin, Clock3 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Expert } from "@/types";
import { useLanguage } from "@/i18n/LanguageContext";

const ExpertCard = ({ expert }: { expert: Expert }) => {
  const { t } = useLanguage();
  return (
  <Card className="border-border/70 py-0">
    <CardContent className="space-y-3 p-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-14 w-14 border">
          <AvatarImage src={expert.avatar} alt={expert.name} />
          <AvatarFallback>{expert.name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold leading-tight">{expert.name}</h3>
          <p className="text-sm text-muted-foreground">{expert.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {expert.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" /> {expert.experience}
            </span>
          </div>
        </div>
        <Badge
          variant="outline"
          className="shrink-0 border-transparent bg-primary/10 text-primary"
        >
          {expert.availability}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">{expert.bio}</p>

      <div className="flex flex-wrap gap-1.5">
        {expert.specialties.map((specialty) => (
          <span
            key={specialty}
            className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
          >
            {specialty}
          </span>
        ))}
      </div>

      <a
        href={`tel:${expert.phone.replace(/\s/g, "")}`}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        <Phone className="h-4 w-4" /> {t("c.contact_expert")}
      </a>
    </CardContent>
  </Card>
  );
};

export default ExpertCard;
