import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Clock,
  Lightbulb,
  ListChecks,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import LearningCard from "@/components/LearningCard";
import NotFound from "./NotFound";
import {
  categoryEmoji,
  categoryName,
  findArticle,
  learningArticles,
} from "@/data/learning";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";

const LearningDetails = () => {
  const { id } = useParams();
  const article = findArticle(id);
  const { savedArticleIds, toggleSaveArticle } = useApp();

  if (!article) return <NotFound />;

  const saved = savedArticleIds.includes(article.id);
  const related = article.relatedIds
    .map((relatedId) => learningArticles.find((item) => item.id === relatedId))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Makala"
        action={
          <button
            type="button"
            onClick={() => toggleSaveArticle(article.id)}
            aria-label={saved ? "Ondoa kuhifadhi" : "Hifadhi"}
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
          {categoryEmoji(article.categoryId)} {categoryName(article.categoryId)}
        </span>
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> Dakika {article.readTime}
        </span>
        <span className="text-muted-foreground">· {article.author}</span>
      </div>

      <h1 className="text-2xl font-bold leading-tight">{article.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{article.description}</p>

      {article.image && (
        <img
          src={article.image}
          alt={article.title}
          className="mt-4 h-52 w-full rounded-2xl object-cover"
        />
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
          <ListChecks className="h-4 w-4" /> Hatua za kuchukua
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
            <p className="text-sm font-bold">Ushauri wa mtaalamu</p>
            <p className="text-sm text-muted-foreground">{article.expertTip}</p>
          </div>
        </section>
      )}

      <Link
        to="/ushauri"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 font-bold text-primary-foreground"
      >
        Uliza mtaalamu kuhusu hili <ArrowRight className="h-4 w-4" />
      </Link>

      {related.length > 0 && (
        <section className="mt-7">
          <h2 className="mb-3 text-base font-bold">Makala zinazohusiana</h2>
          <div className="space-y-3">
            {related.map((item) => (
              <LearningCard
                key={item.id}
                article={item}
                saved={savedArticleIds.includes(item.id)}
                onSave={() => toggleSaveArticle(item.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default LearningDetails;
