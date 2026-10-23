import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Clock,
  Lightbulb,
  ListChecks,
} from "lucide-react";
import ImagePreview from "@/components/ImagePreview";
import PageHeader from "@/components/PageHeader";
import LearningCard from "@/components/LearningCard";
import QueryState from "@/components/QueryState";
import NotFound from "./NotFound";
import { useArticles, useCategories, useToggleSaveArticle } from "@/hooks/useApi";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import AdvisorFab from "@/components/AdvisorFab";

const LearningDetails = () => {
  const { id } = useParams();
  const { data: articles = [], isLoading } = useArticles();
  const { data: categories = [] } = useCategories();
  const toggleSave = useToggleSaveArticle();
  const toggleSaveArticle = (articleId: string) => toggleSave.mutate(articleId);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [askError, setAskError] = useState<string | null>(null);

  const ask = (event: FormEvent) => {
    event.preventDefault();
    const current = articles.find((item) => item.id === id);
    const text = question.trim();
    if (!current || text.length < 3) {
      setAskError(t("chat.ask_short"));
      return;
    }
    navigate(`/mshauri?article=${encodeURIComponent(current.id)}&q=${encodeURIComponent(text)}&n=${Date.now()}`);
  };

  if (isLoading) return <QueryState isLoading isError={false}>{null}</QueryState>;
  const article = articles.find((item) => item.id === id);
  if (!article) return <NotFound />;

  const category = categories.find((c) => c.id === article.categoryId);
  const saved = article.saved;
  const related = article.relatedIds
    .map((relatedId) => articles.find((item) => item.id === relatedId))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t("learn.article")}
        action={
          <button
            type="button"
            onClick={() => toggleSaveArticle(article.id)}
            aria-label={saved ? t("c.unsave") : t("c.save")}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-card transition-colors hover:bg-accent",
              saved && "text-primary"
            )}
          >
            {saved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
          </button>
        }
      />

      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-accent px-2.5 py-1 font-semibold text-primary">
          {category?.emoji} {category?.name}
        </span>
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> {t("c.minutes")} {article.readTime}
        </span>
        <span className="text-muted-foreground">· {article.author}</span>
      </div>

      <h1 className="text-2xl font-bold leading-tight">{article.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{article.description}</p>

      {article.image && (
        <ImagePreview src={article.image} alt={article.title} className="mt-4 h-52 w-full rounded-2xl object-cover" />
      )}

      <div className="mt-5 space-y-5">
        {article.sections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-1.5 text-base font-bold">{section.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-4">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-primary">
          <ListChecks className="h-4 w-4" /> {t("learn.actions")}
        </h2>
        <ul className="space-y-2">
          {article.actions.map((action) => (
            <li key={action} className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {action}
            </li>
          ))}
        </ul>
      </section>

      {article.expertTip && (
        <section className="mt-4 flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-4">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-bold">{t("learn.tip")}</p>
            <p className="text-sm text-muted-foreground">{article.expertTip}</p>
          </div>
        </section>
      )}

      <form onSubmit={ask} className="mt-4 space-y-3 rounded-3xl border border-primary/30 bg-primary/5 p-4">
        <label htmlFor="makala-swali" className="text-sm font-bold text-primary">
          {t("chat.ask_title")}
        </label>
        <Textarea
          id="makala-swali"
          value={question}
          rows={3}
          placeholder={t("chat.ask_ph")}
          onChange={(event) => {
            setQuestion(event.target.value);
            setAskError(null);
          }}
        />
        {askError && <p className="text-xs font-medium text-destructive">{askError}</p>}
        <Button type="submit" className="w-full rounded-2xl py-5 text-base font-bold">
          {t("chat.ask_send")} <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      {related.length > 0 && (
        <section className="mt-7">
          <h2 className="mb-3 text-base font-bold">{t("learn.related")}</h2>
          <div className="space-y-3">
            {related.map((item) => (
              <LearningCard
                key={item.id}
                article={item}
                saved={item.saved}
                onSave={() => toggleSaveArticle(item.id)}
              />
            ))}
          </div>
        </section>
      )}
      <AdvisorFab />
    </div>
  );
};

export default LearningDetails;
