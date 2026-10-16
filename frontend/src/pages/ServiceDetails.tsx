import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  MapPin,
  PackageCheck,
  Users,
} from "lucide-react";
import ImagePreview from "@/components/ImagePreview";
import PageHeader from "@/components/PageHeader";
import QueryState from "@/components/QueryState";
import NotFound from "./NotFound";
import { usePackage } from "@/hooks/useApi";
import { formatTZS } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";

const ServiceDetails = () => {
  const { id } = useParams();
  const { data: pkg, isLoading, isError, error } = usePackage(id);
  const { t } = useLanguage();

  if (isLoading || (isError && (error as { status?: number })?.status !== 404))
    return <QueryState isLoading={isLoading} isError={isError}>{null}</QueryState>;
  if (!pkg) return <NotFound />;

  return (
    <div className="animate-fade-in">
      <PageHeader title={t("svc.details")} />

      <div className="overflow-hidden rounded-3xl border border-border/70 bg-card">
        {pkg.image && (
          <div className="relative h-44">
            <ImagePreview src={pkg.image} alt={pkg.name} className="h-full w-full object-cover" />
            <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold text-primary backdrop-blur">
              {pkg.serviceType}
            </span>
          </div>
        )}

        <div className="space-y-4 p-4">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-bold leading-tight">{pkg.name}</h1>
              <span className="whitespace-nowrap rounded-xl bg-accent px-2.5 py-1.5 text-sm font-bold text-primary">
                {formatTZS(pkg.price)}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{pkg.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { icon: Users, label: pkg.coverage },
              { icon: Clock, label: pkg.duration },
              { icon: MapPin, label: pkg.serviceArea.split(",")[0] },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="rounded-xl bg-muted px-2 py-3 text-xs font-medium"
              >
                <Icon className="mx-auto mb-1 h-4 w-4 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-5">
        <h2 className="mb-2 text-base font-bold">{t("svc.benefits")}</h2>
        <ul className="space-y-2">
          {pkg.benefits.map((benefit) => (
            <li
              key={benefit}
              className="flex items-start gap-2 rounded-xl border border-border/70 bg-card p-3 text-sm"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {benefit}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-base font-bold">{t("svc.includes")}</h2>
        <ul className="space-y-2">
          {pkg.includes.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 rounded-xl border border-border/70 bg-card p-3 text-sm"
            >
              <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-base font-bold">{t("svc.requirements")}</h2>
        <ul className="space-y-2">
          {pkg.requirements.map((requirement) => (
            <li
              key={requirement}
              className="flex items-start gap-2 rounded-xl border border-border/70 bg-card p-3 text-sm text-muted-foreground"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {requirement}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">
          {t("svc.area")} {pkg.serviceArea}
        </p>
      </section>

      <div className="sticky bottom-20 z-30 mt-6">
        <Link
          to={`/huduma/${pkg.id}/ombi`}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90"
        >
          <ClipboardList className="h-5 w-5" />
          {t("svc.order")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default ServiceDetails;
