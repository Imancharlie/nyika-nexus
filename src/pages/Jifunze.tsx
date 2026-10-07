import { useMemo, useState } from "react";
import LearningCard from "@/components/LearningCard";
import CategoryChip from "@/components/CategoryChip";
import { learningArticles, learningCategories } from "@/data/learning";
import { useApp } from "@/context/AppContext";

const Jifunze = () => {
  const { savedArticleIds, toggleSaveArticle } = useApp();
  const [active, setActive] = useState<string>("zote");

  const articles = useMemo(
    () =>
      active === "zote"
        ? learningArticles
        : learningArticles.filter((article) => article.categoryId === active),
    [active]
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jifunze</h1>
        <p className="text-sm text-muted-foreground">
          Elimu ya kilimo kwa lugha rahisi — makala, miongozo na vidokezo.
        </p>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        <CategoryChip
          label="Zote"
          emoji="📚"
          active={active === "zote"}
          onClick={() => setActive("zote")}
        />
        {learningCategories.map((category) => (
          <CategoryChip
            key={category.id}
            label={category.name}
            emoji={category.emoji}
            active={active === category.id}
            onClick={() => setActive(category.id)}
          />
        ))}
      </div>

      <div className="space-y-3">
        {articles.map((article) => (
          <LearningCard
            key={article.id}
            article={article}
            saved={savedArticleIds.includes(article.id)}
            onSave={() => toggleSaveArticle(article.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Jifunze;
