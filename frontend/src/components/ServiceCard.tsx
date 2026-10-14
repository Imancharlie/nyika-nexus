import { Link } from "react-router-dom";
import { ArrowRight, Clock, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatTZS } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import type { ServicePackage } from "@/types";

const ServiceCard = ({ pkg }: { pkg: ServicePackage }) => {
  const { t } = useLanguage();
  return (
  <Card className="overflow-hidden border-border/70 py-0">
    {pkg.image && (
      <div className="relative h-36 w-full overflow-hidden">
        <img
          src={pkg.image}
          alt={pkg.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold text-primary backdrop-blur">
          {pkg.serviceType}
        </span>
      </div>
    )}
    <CardContent className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold">{pkg.name}</h3>
          <p className="text-sm text-muted-foreground">{pkg.description}</p>
        </div>
        <span className="whitespace-nowrap rounded-lg bg-accent px-2 py-1 text-sm font-bold text-primary">
          {formatTZS(pkg.price)}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Users className="h-3.5 w-3.5" /> {pkg.coverage}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {pkg.duration}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {pkg.serviceArea.split(",")[0]}
        </span>
      </div>

      <ul className="space-y-1 text-sm text-muted-foreground">
        {pkg.includes.slice(0, 3).map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
            {item}
          </li>
        ))}
      </ul>

      <Link
        to={`/huduma/${pkg.id}`}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        {t("c.view_package")} <ArrowRight className="h-4 w-4" />
      </Link>
    </CardContent>
  </Card>
  );
};

export default ServiceCard;
