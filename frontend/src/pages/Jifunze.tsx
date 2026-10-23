import { useMemo, useState } from "react";
import LearningCard from "@/components/LearningCard";
import CategoryChip from "@/components/CategoryChip";
import QueryState from "@/components/QueryState";
import { useArticles, useCategories, useToggleSaveArticle } from "@/hooks/useApi";
import { useLanguage } from "@/i18n/LanguageContext";
import AdvisorFab from "@/components/AdvisorFab";

const Jifunze = () => {
  const { data: allArticles = [], isLoading, isError, refetch } = useArticles();
  const { data: categories = [] } = useCategories();
  const toggleSave = useToggleSaveArticle();
  const [active, setActive] = useState<string>("zote");
  const { t } = useLanguage();

  const articles = useMemo(
    () => (active === "zote" ? allArticles : allArticles.filter((article) => article.categoryId === active)),
    [active, allArticles],
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("learn.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("learn.sub")}</p>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        <CategoryChip label={t("learn.all")} emoji="📚" active={active === "zote"} onClick={() => setActive("zote")} />
        {categories.map((category) => (
          <CategoryChip
            key={category.id}
            label={category.name}
            emoji={category.emoji}
            active={active === category.id}
            onClick={() => setActive(category.id)}
          />
        ))}
      </div>

      <QueryState isLoading={isLoading} isError={isError} onRetry={refetch} empty={!articles.length} emptyText={t("learn.empty")}>
        <div className="space-y-3">
          {articles.map((article) => (
            <LearningCard
              key={article.id}
              article={article}
              saved={article.saved}
              onSave={() => toggleSave.mutate(article.id)}
            />
          ))}
        </div>
      </QueryState>
      <AdvisorFab />
    </div>
  );
};

export default Jifunze;
