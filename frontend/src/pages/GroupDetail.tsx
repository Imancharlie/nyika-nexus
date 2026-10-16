import { Link, useParams } from "react-router-dom";
import { PenSquare } from "lucide-react";
import ImagePreview from "@/components/ImagePreview";
import PageHeader from "@/components/PageHeader";
import PostCard from "@/components/PostCard";
import QueryState from "@/components/QueryState";
import NotFound from "./NotFound";
import { useGroup, useGroupActions, usePostActions, usePosts } from "@/hooks/useApi";
import { useLanguage } from "@/i18n/LanguageContext";

const GroupDetail = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { data: group, isLoading, isError } = useGroup(id);
  const { data: posts = [], isLoading: postsLoading } = usePosts({ group: Number(id) });
  const { join, leave } = useGroupActions();
  const { like, save, comment } = usePostActions();

  if (isLoading) return <QueryState isLoading isError={false}>{null}</QueryState>;
  if (isError || !group) return <NotFound />;

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title={group.name} backTo="/vikundi" />

      <section className="overflow-hidden rounded-[24px] border bg-card">
        <div className="h-28 bg-gradient-to-br from-lime via-leaf to-emerald">
          {group.image && <ImagePreview src={group.image} className="h-full w-full object-cover" />}
        </div>
        <div className="space-y-3 p-4">
          <p className="text-sm text-muted-foreground">{group.description}</p>
          <p className="text-xs text-muted-foreground">
            {group.membersCount} {t("groups.members")} {group.region && `· ${group.region}`} {group.crop && `· ${group.crop}`}
          </p>
          {group.isMember ? (
            <div className="flex gap-2">
              <Link to={`/post/unda?group=${group.id}`} className="btn-lime flex-1 text-sm">
                <PenSquare className="h-4 w-4" /> {t("groups.write")}
              </Link>
              <button type="button" onClick={() => leave.mutate(group.id)} className="rounded-full border px-4 text-sm font-semibold text-muted-foreground">
                {t("groups.leave")}
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => join.mutate(group.id)} disabled={join.isPending} className="btn-lime w-full text-sm">
              {t("groups.join")}
            </button>
          )}
        </div>
      </section>

      <h2 className="text-base font-bold">{t("groups.posts")}</h2>
      <QueryState isLoading={postsLoading} isError={false} empty={!posts.length} emptyText={group.isMember ? t("groups.no_posts") : t("groups.join_to_post")}>
        <div className="space-y-4">
          {posts.map((post) => (
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

export default GroupDetail;
