import { Link } from "react-router-dom";
import { PenSquare, Users } from "lucide-react";
import PostCard from "@/components/PostCard";
import QueryState from "@/components/QueryState";
import { usePostActions, usePosts } from "@/hooks/useApi";
import { useLanguage } from "@/i18n/LanguageContext";

const Post = () => {
  const { t } = useLanguage();
  const { data: posts, isLoading, isError, refetch } = usePosts();
  const { like, save, comment } = usePostActions();

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("post.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("post.sub")}</p>
        </div>
        <Link
          to="/post/unda"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <PenSquare className="h-4 w-4" /> {t("post.publish")}
        </Link>
      </div>

      <Link
        to="/vikundi"
        className="flex items-center gap-3 rounded-2xl border border-border/70 bg-gradient-to-br from-chip to-card p-4"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0E8F8F] text-white">
          <Users className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="font-semibold">{t("groups.title")}</p>
          <p className="text-xs text-muted-foreground">{t("groups.sub")}</p>
        </div>
      </Link>

      <QueryState isLoading={isLoading} isError={isError} onRetry={refetch}>
        <div className="space-y-4">
          {posts?.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => like.mutate(post.id)}
              onSave={() => save.mutate(post.id)}
              onComment={(text) => comment.mutate({ id: post.id, text })}
            />
          ))}
        </div>
      </QueryState>
    </div>
  );
};

export default Post;
