import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ImagePreview from "@/components/ImagePreview";
import {
  Bell,
  Bookmark,
  ChevronRight,
  ClipboardList,
  Heart,
  LifeBuoy,
  ListOrdered,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  PenSquare,
  Phone,
  Send,
  Settings,
  ShoppingCart,
  Sprout,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "@/components/StatusBadge";
import { cn, formatDate, formatTZS, timeAgo } from "@/lib/utils";
import { prettyPhone } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Post } from "@/types";
import {
  useConsultations,
  usePostActions,
  usePosts,
  useServiceRequests,
  useUnreadCount,
} from "@/hooks/useApi";

const ProfilePost = ({ post }: { post: Post }) => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { like, comment, remove, removeComment } = usePostActions();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);

  useEffect(() => {
    setLiked(post.liked);
    setLikes(post.likes);
  }, [post.id, post.liked, post.likes]);

  const tapLike = () => {
    setLiked((value) => {
      setLikes((count) => count + (value ? -1 : 1));
      return !value;
    });
    like.mutate(post.id);
  };

  const send = () => {
    const body = text.trim();
    if (!body) return;
    comment.mutate({ id: post.id, text: body });
    setText("");
    setOpen(true);
  };

  return (
    <article className="rounded-2xl border border-border/70 bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt, lang)}</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="mt-1 whitespace-pre-line text-sm">{post.text}</p>
      {post.image && (
        <ImagePreview src={post.image} className="mt-2 max-h-60 w-full rounded-xl object-cover" />
      )}
      {post.video && (
        <video src={post.video} controls playsInline className="mt-2 max-h-60 w-full rounded-xl bg-black" />
      )}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={tapLike}
          className={cn("inline-flex items-center gap-1.5 text-base font-semibold", liked ? "text-red-500" : "text-foreground")}
        >
          <Heart className={cn("h-7 w-7", liked && "fill-current")} />
          {likes}
        </button>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center gap-1.5 text-base font-semibold"
        >
          <MessageCircle className="h-7 w-7" />
          {post.comments.length}
        </button>
      </div>
      {open && (
        <div className="mt-3 space-y-3 border-t pt-3">
          {post.comments.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("c.no_comments")}</p>
          )}
          {post.comments.map((item) => (
            <div key={item.id} className="flex gap-2">
              <Avatar className="h-8 w-8 border">
                <AvatarImage src={item.avatar} alt={item.author} />
                <AvatarFallback>{item.author.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-semibold">{item.author}</span> {item.text}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.createdAt ? timeAgo(item.createdAt, lang) : item.time}
                  {user?.id === item.authorId && (
                    <button
                      type="button"
                      className="ml-3 font-semibold text-destructive"
                      onClick={() => removeComment.mutate({ postId: post.id, commentId: item.id })}
                    >
                      {t("c.delete_comment")}
                    </button>
                  )}
                </p>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && send()}
              placeholder={t("c.comment_ph")}
              className="rounded-full"
            />
            <Button size="icon" className="h-10 w-10 shrink-0 rounded-full" onClick={send} disabled={!text.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </article>
  );
};

const Wasifu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") ?? "machapisho";
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, lang } = useLanguage();
  const { data: myPosts = [] } = usePosts({ mine: true });
  const { data: serviceRequests = [] } = useServiceRequests();
  const { data: consultations = [] } = useConsultations();
  const unreadCount = useUnreadCount();
  const activeTab = tab === "huduma" || tab === "ushauri" ? tab : "machapisho";

  const changeTab = (value: string) => setSearchParams({ tab: value });
  const showActions = () => {
    document.getElementById("profile-actions")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const signOut = () => {
    logout();
    navigate("/", { replace: true });
  };

  if (!user) return null;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Profile header */}
      <section className="rounded-3xl border border-border/70 bg-card p-5 text-center">
        <Avatar className="mx-auto h-20 w-20 border-2 border-primary/30">
          <AvatarImage src={user.avatar} alt={user.fullName} />
          <AvatarFallback>{user.fullName.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <h1 className="mt-3 text-xl font-bold">{user.fullName}</h1>
        <p className="text-sm text-muted-foreground">@{user.username}</p>
        <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground">
          <Phone className="h-3.5 w-3.5" /> {prettyPhone(user.phone)}
        </p>
        {user.region && (
          <Badge variant="outline" className="mt-3 border-primary/40 text-primary">
            <Sprout className="mr-1 h-3.5 w-3.5" /> {t("prof.region")} {user.region}
          </Badge>
        )}
      </section>

      <Tabs value={activeTab} onValueChange={changeTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="machapisho" className="px-1 text-xs">
            {t("prof.tab_posts")}{myPosts.length > 1 ? ` (${myPosts.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="huduma" className="px-1 text-xs">{t("prof.tab_services")}</TabsTrigger>
          <TabsTrigger value="ushauri" className="px-1 text-xs">{t("prof.tab_advice")}</TabsTrigger>
          <button
            type="button"
            onClick={showActions}
            className="inline-flex items-center justify-center rounded-sm px-1 py-1.5 text-xs font-medium text-muted-foreground"
          >
            {t("prof.tab_more")}
          </button>
        </TabsList>

        <TabsContent value="machapisho" className="mt-4 space-y-4">
          {myPosts.length === 0 ? (
            <EmptyState
              text={t("prof.no_posts")}
              action={
                <Link
                  to="/post/unda"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  <PenSquare className="h-4 w-4" /> {t("post.publish")}
                </Link>
              }
            />
          ) : (
            myPosts.map((post) => <ProfilePost key={post.id} post={post} />)
          )}
        </TabsContent>

        <TabsContent value="huduma" className="mt-4 space-y-3">
          {serviceRequests.length === 0 ? (
            <EmptyState text={t("prof.no_services")} />
          ) : (
            serviceRequests.map((request) => (
              <article
                key={request.id}
                className="rounded-2xl border border-border/70 bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{request.packageName}</p>
                    <p className="text-xs text-muted-foreground">
                      {request.id} · {formatDate(request.createdAt, lang)}
                    </p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>{t("prof.price")}: {formatTZS(request.price)}</span>
                  <span>{t("prof.date")}: {formatDate(request.preferredDate, lang)}</span>
                  <span>{t("prof.farm")}: {request.farmLocation}, {request.location}</span>
                  <span>{t("prof.size")}: {request.farmSize}</span>
                </div>
              </article>
            ))
          )}
        </TabsContent>

        <TabsContent value="ushauri" className="mt-4 space-y-3">
          {consultations.length === 0 ? (
            <EmptyState
              text={t("prof.no_advice")}
              action={
                <Link
                  to="/ushauri"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  {t("prof.ask")}
                </Link>
              }
            />
          ) : (
            consultations.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-border/70 bg-card p-4"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-primary">
                    {item.cropType}
                  </span>
                  <span
                    className={
                      item.status === "inajibiwa"
                        ? "text-xs font-medium text-primary"
                        : "text-xs font-medium text-amber-600"
                    }
                  >
                    {item.status === "inajibiwa" ? t("prof.answered") : t("prof.waiting")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{item.problem}</p>
                {item.reply && (
                  <div className="mt-2 rounded-xl bg-primary/5 p-3 text-sm">
                    <p className="mb-1 text-xs font-bold text-primary">
                      {item.expertName}
                    </p>
                    {item.reply}
                  </div>
                )}
              </article>
            ))
          )}
        </TabsContent>

      </Tabs>

      <section
        id="profile-actions"
        className="overflow-hidden rounded-2xl border border-border/70 bg-card"
        style={{ scrollMarginTop: 88, scrollMarginBottom: 120 }}
      >
        <MenuLink to="/taarifa" icon={<Bell className="h-5 w-5" />} label={t("notif.title")}>
          {unreadCount > 0 && (
            <Badge className="mr-2 bg-destructive text-destructive-foreground">
              {unreadCount}
            </Badge>
          )}
        </MenuLink>
        <MenuLink
          to="/mipangilio"
          icon={<Settings className="h-5 w-5" />}
          label={t("prof.settings")}
        />
        <MenuLink to="/oda" icon={<ListOrdered className="h-5 w-5" />} label={t("orders.title")} />
        <MenuLink to="/lipia" icon={<Wallet className="h-5 w-5" />} label={t("pay.title")} />
        <MenuLink to="/omba-oda" icon={<ShoppingCart className="h-5 w-5" />} label={t("req.title")} />
        <MenuLink to="/vikundi" icon={<Users className="h-5 w-5" />} label={t("groups.title")} />
        <MenuLink to="/huduma" icon={<ClipboardList className="h-5 w-5" />} label={t("prof.order_service")} />
        <MenuLink to="/jifunze" icon={<Bookmark className="h-5 w-5" />} label={t("prof.all_learning")} />
        <MenuLink to="/msaada" icon={<LifeBuoy className="h-5 w-5" />} label={t("help.title")} />
      </section>

      <button
        type="button"
        onClick={signOut}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 px-4 py-3.5 text-sm font-semibold text-destructive hover:bg-destructive/5"
      >
        <LogOut className="h-4 w-4" /> {t("common.logout")}
      </button>
    </div>
  );
};

const EmptyState = ({ text, action }: { text: string; action?: React.ReactNode }) => (
  <div className="rounded-2xl border border-dashed border-border p-6 text-center">
    <p className="text-sm text-muted-foreground">{text}</p>
    {action}
  </div>
);

const MenuLink = ({
  to,
  icon,
  label,
  children,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  children?: React.ReactNode;
}) => (
  <Link
    to={to}
    className="flex items-center gap-3 border-b border-border/60 px-4 py-3.5 last:border-b-0 hover:bg-accent/50"
  >
    <span className="text-primary">{icon}</span>
    <span className="flex-1 text-sm font-medium">{label}</span>
    {children}
    <ChevronRight className="h-4 w-4 text-muted-foreground" />
  </Link>
);

export default Wasifu;
