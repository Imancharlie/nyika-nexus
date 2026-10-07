import { Link } from "react-router-dom";
import { ArrowRight, Bookmark, BookmarkCheck, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { categoryEmoji, categoryName } from "@/data/learning";
import { cn } from "@/lib/utils";
import type { LearningArticle } from "@/types";

type LearningCardProps = {
  article: LearningArticle;
  saved?: boolean;
  onSave?: () => void;
};

const LearningCard = ({ article, saved, onSave }: LearningCardProps) => (
  <Card className="overflow-hidden border-border/70 py-0">
    <Link to={`/jifunze/${article.id}`} className="block">
      <div className="relative h-32 w-full overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">
          {categoryEmoji(article.categoryId)} {categoryName(article.categoryId)}
        </span>
      </div>
    </Link>
    <CardContent className="space-y-2 p-4">
      <Link to={`/jifunze/${article.id}`}>
        <h3 className="text-base font-bold leading-snug">{article.title}</h3>
        <p className="text-sm text-muted-foreground">{article.description}</p>
      </Link>
      <div className="flex items-center justify-between pt-1">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> Dakika {article.readTime}
        </span>
        <div className="flex items-center gap-2">
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              aria-label={saved ? "Ondoa kuhifadhi" : "Hifadhi"}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                saved ? "text-primary" : "text-muted-foreground hover:bg-accent"
              )}
            >
              {saved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
            </button>
          )}
          <Link
            to={`/jifunze/${article.id}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
          >
            Soma <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default LearningCard;
