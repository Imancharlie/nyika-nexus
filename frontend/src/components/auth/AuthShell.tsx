import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

export const LanguageSwitch = ({ dark = false }: { dark?: boolean }) => {
  const { lang, setLang } = useLanguage();
  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        "flex rounded-full border p-[3px]",
        dark ? "border-white/15 bg-white/10" : "border-border bg-white",
      )}
    >
      {(["sw", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={cn(
            "min-h-[34px] min-w-[40px] rounded-full text-[13px] font-semibold tracking-wide transition-colors",
            lang === l
              ? dark
                ? "bg-white text-forest"
                : "bg-forest text-white"
              : dark
                ? "text-white/75"
                : "text-muted-foreground",
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

type ShellProps = { title: string; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode };

const AuthShell = ({ title, subtitle, children, footer }: ShellProps) => {
  const { t, lt } = useLanguage();
  return (
    <div className="min-h-screen bg-forest lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-hero p-12 text-white lg:flex lg:flex-col">
        <svg className="absolute inset-x-0 bottom-0 w-full opacity-30" viewBox="0 0 400 160" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 160V90C70 50 150 36 240 50 150 62 80 104 40 160Z" fill="#C8F169" opacity=".5" />
          <path d="M60 160C120 90 230 52 360 40 270 72 200 116 160 160Z" fill="#fff" opacity=".35" />
          <path d="M220 160C270 106 330 72 400 62V160Z" fill="#C8F169" opacity=".45" />
        </svg>
        <Link to="/" className="relative flex items-center gap-3">
          <img src="/brand/mark-light.png" alt="" className="h-10 w-auto" />
          <img src="/brand/wordmark-light.png" alt="AGRIMIKA" className="h-4 w-auto" />
        </Link>
        <div className="relative mt-auto max-w-md">
          <h2 className="font-display text-6xl font-bold leading-[.95] tracking-[-.04em]">
            {lt("h1a")}
            <br />
            {lt("h1b")}
            <br />
            {lt("h1c")}
          </h2>
          <p className="mt-6 text-lg text-white/85">{lt("hero_sub")}</p>
          <p className="mt-8 inline-flex items-center gap-2 text-white/85">
            <ShieldCheck className="h-5 w-5 text-lime" /> {t("auth.free")}
          </p>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between gap-3 px-5 pb-6 pt-[max(1rem,env(safe-area-inset-top))] lg:px-10 lg:pt-8">
          <Link to="/" className="flex items-center gap-2 text-white/80 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <img src="/brand/mark-light.png" alt="" className="h-8 w-auto lg:hidden" />
            <span className="hidden text-sm font-medium lg:inline">{t("auth.back_home")}</span>
          </Link>
          <LanguageSwitch dark />
        </header>

        <div className="flex flex-1 flex-col rounded-t-[36px] bg-background px-5 pb-10 pt-8 sm:px-8 lg:mx-10 lg:mb-10 lg:flex-none lg:rounded-[36px] lg:px-12 lg:py-12">
          <div className="mx-auto w-full max-w-md">
            <h1 className="font-display text-[34px] font-bold leading-tight tracking-[-.03em] text-foreground">{title}</h1>
            {subtitle && <p className="mt-2 text-[15px] text-muted-foreground">{subtitle}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 text-center text-[15px] text-muted-foreground">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthShell;

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  prefix?: ReactNode;
};

export const AuthField = ({ label, error, hint, prefix, id, className, ...props }: FieldProps) => {
  const inputId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-foreground">
        {label}
      </label>
      <div
        className={cn(
          "flex min-h-[52px] items-center gap-2 rounded-2xl border-[1.5px] bg-white px-4 transition-shadow focus-within:border-emerald focus-within:ring-4 focus-within:ring-emerald/15",
          error ? "border-destructive" : "border-[#BFE3CB]",
        )}
      >
        {prefix && <span className="font-semibold text-emerald">{prefix}</span>}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={cn("min-w-0 flex-1 bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground/60", className)}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-sm font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
};

export const PasswordField = (props: Omit<FieldProps, "type" | "prefix">) => {
  const [show, setShow] = useState(false);
  const { t } = useLanguage();
  return (
    <div className="relative">
      <AuthField {...props} type={show ? "text" : "password"} className="pr-16" />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? t("auth.hide") : t("auth.show")}
        className="absolute right-3 top-[34px] flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
};

export const FormError = ({ message }: { message?: string | null }) =>
  message ? (
    <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
      {message}
    </div>
  ) : null;
