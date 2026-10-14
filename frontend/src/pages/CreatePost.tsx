import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ImagePlus, PenLine, Send, Video, X } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useCreatePost } from "@/hooks/useApi";
import { ApiError } from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageContext";

const modes = [
  { id: "andika", label: "post.mode_write", icon: PenLine },
  { id: "picha", label: "post.mode_photo", icon: ImagePlus },
  { id: "video", label: "post.mode_video", icon: Video },
] as const;

const CreatePost = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const groupId = params.get("group");
  const backTo = groupId ? `/vikundi/${groupId}` : "/post";
  const { user } = useAuth();
  const createPost = useCreatePost();
  const [mode, setMode] = useState<(typeof modes)[number]["id"]>("andika");
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [error, setError] = useState<string | null>(null);

  const selectMode = (next: (typeof modes)[number]["id"]) => {
    setMode(next);
    if (next === "video") {
      toast.info(t("post.video_soon"));
      setMode("andika");
      return;
    }
    if (next === "picha") {
      document.getElementById("post-image-input")?.click();
    }
  };

  const pickImage = (file?: File) => {
    if (!file) return;
    setImageFile(file);
    setImage(URL.createObjectURL(file));
    setMode("picha");
  };

  const publish = async (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim() && !imageFile) {
      setError(t("post.err_empty"));
      return;
    }
    const body = new FormData();
    body.append("text", text.trim() || "📸 Picha yangu ya shamba");
    if (imageFile) body.append("imageFile", imageFile);
    if (groupId) body.append("groupId", groupId);
    try {
      await createPost.mutateAsync(body);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("post.err_send"));
      return;
    }
    toast.success(t("post.published"));
    navigate(backTo);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title={t("post.new")} backTo={backTo} />

      <form onSubmit={publish} className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={user?.avatar} alt={user?.fullName} />
            <AvatarFallback>{user?.fullName.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <p className="text-sm font-semibold">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground">{user?.region || user?.location}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card p-4">
          <p className="mb-3 text-sm font-semibold text-muted-foreground">{t("post.what")}</p>
          <div className="mb-3 flex gap-2">
            {modes.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => selectMode(id)}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                  mode === id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/40"
                )}
              >
                <Icon className="h-4 w-4" /> {t(label)}
              </button>
            ))}
          </div>

          <Textarea
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setError(null);
            }}
            placeholder={t("post.write_ph")}
            rows={6}
            className="resize-none border-none p-0 shadow-none focus-visible:ring-0"
          />

          <input
            id="post-image-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => pickImage(event.target.files?.[0])}
          />

          {image && (
            <div className="relative mt-3">
              <img
                src={image}
                alt=""
                className="max-h-72 w-full rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(undefined);
                  setImageFile(undefined);
                  setMode("andika");
                }}
                aria-label={t("cons.remove_photo")}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {error && (
            <p className="mt-2 text-xs font-medium text-destructive">{error}</p>
          )}
        </div>

        <Button type="submit" disabled={createPost.isPending} className="w-full rounded-2xl py-5 text-base font-bold">
          <Send className="mr-2 h-4 w-4" /> {t("post.publish")}
        </Button>
      </form>
    </div>
  );
};

export default CreatePost;
