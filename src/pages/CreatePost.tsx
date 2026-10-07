import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ImagePlus, PenLine, Send, Video, X } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { currentUser } from "@/data/user";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";

const modes = [
  { id: "andika", label: "Andika", icon: PenLine },
  { id: "picha", label: "Picha", icon: ImagePlus },
  { id: "video", label: "Video", icon: Video },
] as const;

const CreatePost = () => {
  const navigate = useNavigate();
  const { addPost } = useApp();
  const [mode, setMode] = useState<(typeof modes)[number]["id"]>("andika");
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const selectMode = (next: (typeof modes)[number]["id"]) => {
    setMode(next);
    if (next === "video") {
      toast.info("Kupakia video kitakuja hivi karibuni — tumia picha kwa sasa.");
      setMode("andika");
      return;
    }
    if (next === "picha") {
      document.getElementById("post-image-input")?.click();
    }
  };

  const pickImage = (file?: File) => {
    if (!file) return;
    setImage(URL.createObjectURL(file));
    setMode("picha");
  };

  const publish = (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim() && !image) {
      setError("Andika ujumbe au ongeza picha kabla ya kuchapisha.");
      return;
    }
    addPost(text.trim() || "📸 Picha yangu ya shamba", image);
    toast.success("Chapisho lako limechapishwa!");
    navigate("/post");
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Chapisho Jipya" backTo="/post" />

      <form onSubmit={publish} className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <p className="text-sm font-semibold">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground">{currentUser.location}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card p-4">
          <p className="mb-3 text-sm font-semibold text-muted-foreground">
            Unataka kushirikisha nini?
          </p>
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
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>

          <Textarea
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setError(null);
            }}
            placeholder="Andika ujumbe..."
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
                alt="Picha iliyochaguliwa"
                className="max-h-72 w-full rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(undefined);
                  setMode("andika");
                }}
                aria-label="Ondoa picha"
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

        <Button type="submit" className="w-full rounded-2xl py-5 text-base font-bold">
          <Send className="mr-2 h-4 w-4" /> Chapisha
        </Button>
      </form>
    </div>
  );
};

export default CreatePost;
