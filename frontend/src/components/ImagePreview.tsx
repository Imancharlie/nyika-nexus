import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

type Props = {
  src: string;
  alt?: string;
  className?: string;
};

const ImagePreview = ({ src, alt = "", className }: Props) => {
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="contents"
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          setOpen(true);
        }}
      >
        <img src={src} alt={alt} className={`${className ?? ""} cursor-zoom-in`} loading="lazy" />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            aria-label={lang === "en" ? "Close" : "Funga"}
            onClick={() => setOpen(false)}
            className="absolute right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black"
            style={{ top: "max(16px, env(safe-area-inset-top))" }}
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-h-[88vh] max-w-full rounded-xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default ImagePreview;
