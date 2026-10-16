import { Navigate, useParams } from "react-router-dom";
import { Phone, Sprout } from "lucide-react";
import PostCard from "@/components/PostCard";
import QueryState from "@/components/QueryState";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { usePostActions, usePosts, usePublicUser } from "@/hooks/useApi";
import { useLanguage } from "@/i18n/LanguageContext";
import { prettyPhone } from "@/lib/api";

const Watu = () => {
  const { id } = useParams();
  const authorId = Number(id);
  const { user } = useAuth();
  const { t } = useLanguage();
  const profile = usePublicUser(authorId);
  const posts = usePosts({ author: authorId });
  const { like, save, comment } = usePostActions();

  if (user && user.id === authorId) return <Navigate to="/wasifu" replace />;

  const person = profile.data;

  return (
    <div className="space-y-5 animate-fade-in">
      <QueryState isLoading={profile.isLoading} isError={profile.isError} onRetry={() => profile.refetch()}>
        {person && (
          <section className="rounded-3xl border border-border/70 bg-card p-5 text-center">
            <Avatar className="mx-auto h-20 w-20 border-2 border-primary/30">
              <AvatarImage src={person.avatar} alt={person.fullName} />
              <AvatarFallback>{person.fullName.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <h1 className="mt-3 text-xl font-bold">{person.fullName}</h1>
            <p className="text-sm text-muted-foreground">@{person.username}</p>
            {person.phone && (
              <a
                href={`tel:${person.phone}`}
                className="mt-1 flex items-center justify-center gap-1 text-sm text-primary"
              >
                <Phone className="h-3.5 w-3.5" /> {prettyPhone(person.phone)}
              </a>
            )}
            {person.region && (
              <Badge variant="outline" className="mt-3 border-primary/40 text-primary">
                <Sprout className="mr-1 h-3.5 w-3.5" /> {t("prof.region")} {person.region}
              </Badge>
            )}
          </section>
        )}
      </QueryState>

      <h2 className="text-lg font-bold">{t("prof.tab_posts")}</h2>
      <QueryState
        isLoading={posts.isLoading}
        isError={posts.isError}
        onRetry={() => posts.refetch()}
        empty={!posts.data?.length}
        emptyText={t("prof.no_user_posts")}
      >
        <div className="space-y-4">
          {posts.data?.map((post) => (
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

export default Watu;
