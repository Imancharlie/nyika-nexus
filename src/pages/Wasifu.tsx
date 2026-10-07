import { Link, useSearchParams } from "react-router-dom";
import {
  Bell,
  Bookmark,
  ChevronRight,
  ClipboardList,
  MapPin,
  PenSquare,
  Settings,
  Sprout,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "@/components/StatusBadge";
import LearningCard from "@/components/LearningCard";
import { currentUser } from "@/data/user";
import { findArticle } from "@/data/learning";
import { formatTZS } from "@/lib/utils";
import { useApp } from "@/context/AppContext";

const Wasifu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") ?? "machapisho";
  const {
    posts,
    serviceRequests,
    consultations,
    savedArticleIds,
    toggleSaveArticle,
    unreadCount,
  } = useApp();

  const myPosts = posts.filter((post) => post.author === currentUser.name);
  const savedArticles = savedArticleIds
    .map((id) => findArticle(id))
    .filter((article): article is NonNullable<typeof article> => Boolean(article));

  const changeTab = (value: string) => setSearchParams({ tab: value });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Profile header */}
      <section className="rounded-3xl border border-border/70 bg-card p-5 text-center">
        <Avatar className="mx-auto h-20 w-20 border-2 border-primary/30">
          <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
          <AvatarFallback>{currentUser.name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <h1 className="mt-3 text-xl font-bold">{currentUser.name}</h1>
        <p className="mt-0.5 flex items-center justify-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {currentUser.location}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{currentUser.bio}</p>
        <Badge variant="outline" className="mt-3 border-primary/40 text-primary">
          <Sprout className="mr-1 h-3.5 w-3.5" /> Mkoa wa Morogoro
        </Badge>
      </section>

      <Tabs value={tab} onValueChange={changeTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="machapisho" className="px-1 text-xs">
            Machapisho
          </TabsTrigger>
          <TabsTrigger value="huduma" className="px-1 text-xs">
            Huduma
          </TabsTrigger>
          <TabsTrigger value="ushauri" className="px-1 text-xs">
            Ushauri
          </TabsTrigger>
          <TabsTrigger value="mafunzo" className="px-1 text-xs">
            Mafunzo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="machapisho" className="mt-4 space-y-4">
          {myPosts.length === 0 ? (
            <EmptyState
              text="Bado hujachapisha chochote. Anza kwa kushiriki uzoefu wako."
              action={
                <Link
                  to="/post/unda"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  <PenSquare className="h-4 w-4" /> Chapisha
                </Link>
              }
            />
          ) : (
            myPosts.map((post) => (
              <article
                key={post.id}
                className="rounded-2xl border border-border/70 bg-card p-4"
              >
                <p className="text-xs text-muted-foreground">
                  {post.location} · {post.time}
                </p>
                <p className="mt-1 whitespace-pre-line text-sm">{post.text}</p>
                {post.image && (
                  <img
                    src={post.image}
                    alt=""
                    className="mt-2 max-h-60 w-full rounded-xl object-cover"
                  />
                )}
                <p className="mt-2 text-xs font-medium text-muted-foreground">
                  ❤️ {post.likes} · 💬 {post.comments.length}
                </p>
              </article>
            ))
          )}
        </TabsContent>

        <TabsContent value="huduma" className="mt-4 space-y-3">
          {serviceRequests.length === 0 ? (
            <EmptyState text="Bado hujaagiza huduma yoyote." />
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
                      {request.id} · {request.createdAt}
                    </p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>Bei: {formatTZS(request.price)}</span>
                  <span>Tarehe: {request.preferredDate}</span>
                  <span>Shamba: {request.farmLocation}, {request.location}</span>
                  <span>Ukubwa: {request.farmSize}</span>
                </div>
              </article>
            ))
          )}
        </TabsContent>

        <TabsContent value="ushauri" className="mt-4 space-y-3">
          {consultations.length === 0 ? (
            <EmptyState
              text="Bado hujauliza swali kwa mtaalamu."
              action={
                <Link
                  to="/ushauri"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Omba Ushauri
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
                    {item.status === "inajibiwa" ? "Imejibiwa" : "Inasubiri"}
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

        <TabsContent value="mafunzo" className="mt-4 space-y-3">
          {savedArticles.length === 0 ? (
            <EmptyState
              text="Hujahifadhi makala yoyote bado."
              action={
                <Link
                  to="/jifunze"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Nenda Jifunze
                </Link>
              }
            />
          ) : (
            savedArticles.map((article) => (
              <LearningCard
                key={article.id}
                article={article}
                saved
                onSave={() => toggleSaveArticle(article.id)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Menu */}
      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card">
        <MenuLink to="/taarifa" icon={<Bell className="h-5 w-5" />} label="Taarifa">
          {unreadCount > 0 && (
            <Badge className="mr-2 bg-destructive text-destructive-foreground">
              {unreadCount}
            </Badge>
          )}
        </MenuLink>
        <MenuLink
          to="/mipangilio"
          icon={<Settings className="h-5 w-5" />}
          label="Mipangilio"
        />
        <MenuLink to="/huduma" icon={<ClipboardList className="h-5 w-5" />} label="Agiza Huduma" />
        <MenuLink to="/jifunze" icon={<Bookmark className="h-5 w-5" />} label="Mafunzo Yote" />
      </section>
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
