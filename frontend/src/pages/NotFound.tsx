import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const NotFound = () => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <span className="text-6xl">🌾</span>
      <h1 className="mt-4 text-2xl font-bold">{t("nf.title")}</h1>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">{t("nf.text")}</p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 font-semibold text-primary-foreground"
      >
        <Home className="h-4 w-4" /> {t("nf.home")}
      </Link>
    </div>
  );
};

export default NotFound;
