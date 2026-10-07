import { useState } from "react";
import { toast } from "sonner";
import {
  Bookmark,
  Flag,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { Post } from "@/types";

type PostCardProps = {
  post: Post;
  onLike: () => void;
  onSave: () => void;
  onComment: (text: string) => void;
};

const PostCard = ({ post, onLike, onSave, onComment }: PostCardProps) => {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");

  const share = async () => {
    const data = { title: "AGRIMIKA", text: post.text.slice(0, 120) };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(post.text);
      toast.success("Ujumbe umenakiliwa — ushiriki na wenzako");
    } catch {
      toast.error("Imeshindikana kushiriki");
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
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={post.avatar} alt={post.author} />
            <AvatarFallback>{post.author.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <p className="text-sm font-semibold">{post.author}</p>
            <p className="text-xs text-muted-foreground">
              {post.location} · {post.time}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onSave}>
              <Bookmark className="mr-2 h-4 w-4" />
              {post.saved ? "Ondoa kuhifadhi" : "Hifadhi chapisho"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={share}>
              <Share2 className="mr-2 h-4 w-4" />
              Shiriki
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toast.success("Ripoti yako imepokelewa. Asante.")}
            >
              <Flag className="mr-2 h-4 w-4" />
              Ripoti
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="whitespace-pre-line px-4 pb-3 text-[15px] leading-relaxed">
        {post.text}
      </p>

      {post.image && (
        <img
          src={post.image}
          alt=""
          className="max-h-96 w-full object-cover"
          loading="lazy"
        />
      )}

      <div className="flex items-center gap-1 border-t px-2 py-1.5">
        <button
          type="button"
          onClick={onLike}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors",
            post.liked ? "text-red-500" : "text-muted-foreground hover:bg-accent"
          )}
        >
          <Heart className={cn("h-5 w-5", post.liked && "fill-current")} />
          {post.likes}
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
          Shiriki
        </button>
        <button
          type="button"
          onClick={onSave}
          aria-label="Hifadhi"
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
            <DialogTitle>Maoni ({post.comments.length})</DialogTitle>
          </DialogHeader>

          <div className="max-h-[45vh] space-y-4 overflow-y-auto py-4">
            {post.comments.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">
                Hakuna maoni bado. Kuwa wa kwanza kuandika!
              </p>
            )}
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8 border">
                  <AvatarImage src={comment.avatar} alt={comment.author} />
                  <AvatarFallback>{comment.author.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="rounded-2xl rounded-tl-sm bg-muted px-3 py-2">
                  <p className="text-xs font-semibold">
                    {comment.author}{" "}
                    <span className="font-normal text-muted-foreground">
                      · {comment.time}
                    </span>
                  </p>
                  <p className="text-sm">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 border-t pt-3">
            <Input
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && submitComment()}
              placeholder="Toa maoni..."
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
