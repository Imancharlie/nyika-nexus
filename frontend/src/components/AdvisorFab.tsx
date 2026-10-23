import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

/** Floating entry to the farming advisor, shown on AgriLearn. */
const AdvisorFab = () => {
  const { t } = useLanguage();
  return (
    <Link to="/mshauri" className="advisor-fab" aria-label={t("chat.fab_aria")}>
      <Sparkles className="h-5 w-5" />
      <span>{t("chat.fab")}</span>
    </Link>
  );
};

export default AdvisorFab;
