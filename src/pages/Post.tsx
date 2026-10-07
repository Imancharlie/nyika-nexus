import { Link } from "react-router-dom";
import { PenSquare } from "lucide-react";
import PostCard from "@/components/PostCard";
import { useApp } from "@/context/AppContext";

const Post = () => {
  const { posts, toggleLike, toggleSavePost, addComment } = useApp();

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Post</h1>
          <p className="text-sm text-muted-foreground">
            Shiriki uzoefu wako na wakulima wenzako.
          </p>
        </div>
        <Link
          to="/post/unda"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <PenSquare className="h-4 w-4" /> Chapisha
        </Link>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={() => toggleLike(post.id)}
            onSave={() => toggleSavePost(post.id)}
            onComment={(text) => addComment(post.id, text)}
          />
        ))}
      </div>
    </div>
  );
};

export default Post;
