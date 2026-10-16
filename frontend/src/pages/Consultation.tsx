import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock3, ImagePlus, Sprout, X } from "lucide-react";
import { toast } from "sonner";
import ImagePreview from "@/components/ImagePreview";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CategoryChip from "@/components/CategoryChip";
import { cn, cropTypes } from "@/lib/utils";
import { useConsultations, useCreateConsultation } from "@/hooks/useApi";
import { ApiError } from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageContext";

const Consultation = () => {
  const { t } = useLanguage();
  const { data: consultations = [] } = useConsultations();
  const createConsultation = useCreateConsultation();
  const [problem, setProblem] = useState("");
  const [cropType, setCropType] = useState("");
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [image, setImage] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const pickImage = (file?: File) => {
    if (!file) return;
    setImageFile(file);
    setImage(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImage(undefined);
    setImageFile(undefined);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (problem.trim().length < 10) {
      setError(t("cons.err_short"));
      return;
    }
    const body = new FormData();
    body.append("problem", problem.trim());
    body.append("cropType", cropType || "Mazao mengine");
    if (imageFile) body.append("imageFile", imageFile);
    try {
      await createConsultation.mutateAsync(body);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("cons.err_send");
      setError(message);
      toast.error(message);
      return;
    }
    setProblem("");
    setCropType("");
    clearImage();
    setError(null);
    setSent(true);
    toast.success(t("cons.sent"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title={t("cons.title")} />

      {sent && (
        <div className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-semibold text-primary">{t("cons.sent")}</p>
            <p className="text-sm text-muted-foreground">{t("cons.sent_text")}</p>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="space-y-2 rounded-3xl border border-border/70 bg-card p-4">
          <Label htmlFor="tatizo" className="text-base">
            {t("cons.problem")}
          </Label>
          <Textarea
            id="tatizo"
            value={problem}
            onChange={(event) => {
              setProblem(event.target.value);
              setError(null);
            }}
            placeholder={t("cons.problem_ph")}
            rows={5}
          />
          {error && <p className="text-xs font-medium text-destructive">{error}</p>}

          <div className="flex items-center gap-3 pt-1">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-primary/50 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5">
              <ImagePlus className="h-4 w-4" />
              {t("cons.add_photo")}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => pickImage(event.target.files?.[0])}
              />
            </label>
            {image && (
              <div className="relative">
                <img
                  src={image}
                  alt=""
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  aria-label={t("cons.remove_photo")}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-base">{t("svc.crop")}</Label>
          <div className="flex flex-wrap gap-2">
            {cropTypes.map((crop) => (
              <CategoryChip
                key={crop}
                label={crop}
                active={cropType === crop}
                onClick={() => setCropType(cropType === crop ? "" : crop)}
              />
            ))}
          </div>
        </div>

        <Button type="submit" disabled={createConsultation.isPending} className="w-full rounded-2xl py-5 text-base font-bold">
          {t("cons.send")}
        </Button>
      </form>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
          <Sprout className="h-5 w-5 text-primary" /> {t("cons.mine")}
        </h2>
        <div className="space-y-3">
          {consultations.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              {t("cons.none")}
            </p>
          )}
          {consultations.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-primary">
                  {item.cropType}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-xs font-medium",
                    item.status === "inajibiwa" ? "text-primary" : "text-amber-600"
                  )}
                >
                  <Clock3 className="h-3.5 w-3.5" />
                  {item.status === "inajibiwa"
                    ? `${t("cons.answered_by")} ${item.expertName ?? t("cons.expert")}`
                    : t("cons.waiting")}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.problem}</p>
              {item.image && (
                <ImagePreview src={item.image} className="mt-3 max-h-48 w-full rounded-xl object-cover" />
              )}
              {item.reply && (
                <div className="mt-3 rounded-xl bg-primary/5 p-3">
                  <p className="mb-1 text-xs font-bold text-primary">
                    {item.expertName}
                  </p>
                  <p className="text-sm leading-relaxed">{item.reply}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <Link
        to="/wataalamu"
        className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/50 bg-primary/5 px-4 py-4 text-sm font-semibold text-primary"
      >
        {t("cons.all_experts")}
      </Link>
    </div>
  );
};

export default Consultation;
