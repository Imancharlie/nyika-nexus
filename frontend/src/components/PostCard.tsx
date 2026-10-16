import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Bookmark,
  Flag,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pause,
  Play,
  Send,
  Share2,
  Trash2,
} from "lucide-react";
import ImagePreview from "@/components/ImagePreview";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { usePostActions } from "@/hooks/useApi";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn, timeAgo } from "@/lib/utils";
import type { Post } from "@/types";

const clock = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const PostVideo = ({ src }: { src: string }) => {
  const { lang } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playLabel = lang === "en" ? "Play video" : "Cheza video";

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="relative mx-4 mb-3 overflow-hidden rounded-2xl bg-[#03160d]">
      <video
        ref={videoRef}
        src={src}
        playsInline
        preload="metadata"
        className="max-h-96 w-full bg-[#03160d] object-contain"
        onClick={toggle}
        onTimeUpdate={() => setTime(videoRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />
      {!playing && (
        <button
          type="button"
          onClick={toggle}
          aria-label={playLabel}
          className="absolute inset-0 grid place-items-center bg-gradient-to-t from-[#03160d]/75 via-[#03160d]/15 to-[#03160d]/25"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-[#F6E6C4] text-[#04210f] shadow-[0_12px_30px_rgba(0,0,0,.35)]">
            <Play className="ml-1 h-7 w-7 fill-current" />
          </span>
        </button>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-[#03160d]/85 to-transparent px-3 pb-2.5 pt-8">
        <button type="button" onClick={toggle} aria-label={playLabel} className="pointer-events-auto text-[#F6E6C4]">
          {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
        </button>
        <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
          <span className="block h-full rounded-full bg-[#C8F169]" style={{ width: `${duration ? (time / duration) * 100 : 0}%` }} />
        </span>
        <span className="text-[11px] font-medium tabular-nums text-white/90">{clock(time)} / {clock(duration)}</span>
      </div>
    </div>
  );
};

type PostCardProps = {
  post: Post;
  onLike: () => void;
  onSave: () => void;
  onComment: (text: string) => void;
};

const PostCard = ({ post, onLike, onSave, onComment }: PostCardProps) => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { remove, removeComment } = usePostActions();
  const mine = user?.id === post.authorId;
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const profileTo = user?.id === post.authorId ? "/wasifu" : `/watu/${post.authorId}`;

  useEffect(() => {
    setLiked(post.liked);
    setLikes(post.likes);
  }, [post.id, post.liked, post.likes]);

  const tapLike = () => {
    setLiked((value) => {
      setLikes((count) => count + (value ? -1 : 1));
      return !value;
    });
    onLike();
  };

  const share = async () => {
    const url = `${window.location.origin}/post`;
    const text = post.text.slice(0, 180);
    try {
      if (navigator.share) {
        await navigator.share({ title: "AGRIMIKA", text, url });
        return;
      }
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success(t("c.copied"));
    } catch {
      toast.error(t("c.share_failed"));
    }
  };

  const submitComment = () => {
    const text = commentText.trim();
    if (!text) return;
    onComment(text);
    setCommentText("");
  };

  return (
    <article className="rounded-2xl border border-border/70 bg-card">
      <div className="flex items-center justify-between gap-2 p-4 pb-3">
        <Link to={profileTo} className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={post.avatar} alt={post.author} />
            <AvatarFallback>{post.author.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <p className="text-sm font-semibold">{post.author}</p>
            <p className="text-xs text-muted-foreground">
              {post.location} · {timeAgo(post.createdAt, lang)}
            </p>
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onSave}>
              <Bookmark className="mr-2 h-4 w-4" />
              {post.saved ? t("c.unsave") : t("c.save_post")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={share}>
              <Share2 className="mr-2 h-4 w-4" />
              {t("c.share")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success(t("c.reported"))}>
              <Flag className="mr-2 h-4 w-4" />
              {t("c.report")}
            </DropdownMenuItem>
            {mine && (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  if (!window.confirm(t("c.delete_post_q"))) return;
                  remove.mutate(post.id);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("c.delete_post")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="whitespace-pre-line px-4 pb-3 text-[15px] leading-relaxed">
        {post.text}
      </p>

      {post.image && (
        <ImagePreview src={post.image} className="max-h-96 w-full object-cover" />
      )}
      {post.video && <PostVideo src={post.video} />}

      <div className="flex items-center gap-1 border-t px-2 py-1.5">
        <button
          type="button"
          onClick={tapLike}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors",
            liked ? "text-red-500" : "text-muted-foreground hover:bg-accent"
          )}
        >
          <Heart className={cn("h-5 w-5", liked && "fill-current")} />
          {likes}
        </button>
        <button
          type="button"
          onClick={() => setCommentsOpen(true)}
          className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
        >
          <MessageCircle className="h-5 w-5" />
          {post.comments.length}
        </button>
        <button
          type="button"
          onClick={share}
          className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
        >
          <Share2 className="h-5 w-5" />
          {t("c.share")}
        </button>
        <button
          type="button"
          onClick={onSave}
          aria-label={t("c.save")}
          className={cn(
            "ml-auto flex items-center gap-1.5 rounded-full px-3 py-2 transition-colors hover:bg-accent",
            post.saved ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Bookmark className={cn("h-5 w-5", post.saved && "fill-current")} />
        </button>
      </div>

      <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
        <DialogContent className="max-w-md gap-0 rounded-t-2xl sm:rounded-2xl">
          <DialogHeader className="border-b pb-3">
            <DialogTitle>{t("c.comments")} ({post.comments.length})</DialogTitle>
          </DialogHeader>

          <div className="max-h-[45vh] space-y-4 overflow-y-auto py-4">
            {post.comments.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">{t("c.no_comments")}</p>
            )}
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8 border">
                  <AvatarImage src={comment.avatar} alt={comment.author} />
                  <AvatarFallback>{comment.author.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-muted px-3 py-2">
                  <p className="text-xs font-semibold">
                    {comment.author}{" "}
                    <span className="font-normal text-muted-foreground">
                      · {comment.createdAt ? timeAgo(comment.createdAt, lang) : comment.time}
                    </span>
                  </p>
                  <p className="text-sm">{comment.text}</p>
                  {user?.id === comment.authorId && (
                    <button
                      type="button"
                      className="mt-1 text-xs font-semibold text-destructive"
                      onClick={() => removeComment.mutate({ postId: post.id, commentId: comment.id })}
                    >
                      {t("c.delete_comment")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 border-t pt-3">
            <Input
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && submitComment()}
              placeholder={t("c.comment_ph")}
              className="rounded-full"
            />
            <Button
              size="icon"
              onClick={submitComment}
              disabled={!commentText.trim()}
              className="h-10 w-10 shrink-0 rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
};

export default PostCard;
