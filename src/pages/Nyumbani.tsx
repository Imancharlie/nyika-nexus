import { Link } from "react-router-dom";
import {
  ArrowRight,
  Banknote,
  BookOpen,
  ClipboardList,
  Megaphone,
  MessagesSquare,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SectionHeader from "@/components/SectionHeader";
import LearningCard from "@/components/LearningCard";
import PostCard from "@/components/PostCard";
import { currentUser } from "@/data/user";
import { learningArticles } from "@/data/learning";
import { servicePackages } from "@/data/services";
import { formatTZS } from "@/lib/utils";
import { useApp } from "@/context/AppContext";

const quickActions = [
  {
    to: "/ushauri",
    label: "Wasiliana na Mtaalamu",
    icon: MessagesSquare,
  },
  { to: "/jifunze", label: "Jifunze", icon: BookOpen },
  { to: "/mikopo", label: "Mikopo", icon: Banknote },
];

const Nyumbani = () => {
  const { posts, savedArticleIds, toggleSaveArticle, toggleLike, toggleSavePost, addComment } =
    useApp();

  const featured = servicePackages.find((pkg) => pkg.featured) ?? servicePackages[1];
  const tips = learningArticles.slice(0, 2);
  const latestPost = posts[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <section className="relative overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground">
        <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 right-16 h-28 w-28 rounded-full bg-white/10" />
        <p className="text-sm font-medium text-primary-foreground/80">
          Karibu {currentUser.name.split(" ")[0]} 🌱
        </p>
        <h1 className="mt-1 text-2xl font-bold leading-tight">
          Karibu AGRIMIKA
        </h1>
        <p className="mt-1 text-sm text-primary-foreground/85">
          Suluhisho rahisi kwa mkulima wa kisasa.
        </p>
      </section>

      {/* Quick service access */}
      <section>
        <SectionHeader title="Haraka" />
        <Link
          to="/huduma"
          className="flex items-center justify-between gap-3 rounded-2xl border-2 border-primary bg-primary/5 px-4 py-4 transition-colors hover:bg-primary/10"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ClipboardList className="h-6 w-6" />
            </span>
            <div>
              <p className="font-bold">Agiza Huduma</p>
              <p className="text-xs text-muted-foreground">
                Fumigation, uchambuzi wa udongo na zaidi
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
        </Link>

        <div className="mt-3 grid grid-cols-3 gap-3">
          {quickActions.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border/70 bg-card px-2 py-4 text-center transition-colors hover:border-primary/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-medium leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured service */}
      <section>
        <SectionHeader title="Huduma ya Kisasa" moreTo="/huduma" moreLabel="Angalia zote" />
        <Link
          to={`/huduma/${featured.id}`}
          className="block overflow-hidden rounded-3xl border border-border/70 bg-card"
        >
          <div className="relative h-40">
            <img
              src={featured.image}
              alt={featured.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                {featured.serviceType}
              </p>
              <h3 className="text-lg font-bold">Huduma ya Fumigation</h3>
              <p className="text-sm text-white/85">
                Linda mazao yako dhidi ya wadudu na magonjwa.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-bold text-primary">
              Kuanzia {formatTZS(featured.price)}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Angalia Vifurushi <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </Link>
      </section>

      {/* Announcement */}
      <section className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-semibold text-amber-900">Tangazo la AGRIMIKA</p>
          <p className="text-sm text-amber-800/90">
            Kipaumbele cha fumigation kabla ya msimu wa mvua kimefunguliwa — omba
            huduma mapema ili upate tarehe unayotaka.
          </p>
        </div>
      </section>

      {/* Learning content */}
      <section>
        <SectionHeader title="Makala na Vidokezo" moreTo="/jifunze" />
        <div className="space-y-3">
          {tips.map((article) => (
            <LearningCard
              key={article.id}
              article={article}
              saved={savedArticleIds.includes(article.id)}
              onSave={() => toggleSaveArticle(article.id)}
            />
          ))}
        </div>
      </section>

      {/* Community */}
      <section>
        <SectionHeader title="Kutoka kwa Wakulima" moreTo="/post" />
        {latestPost && (
          <PostCard
            post={latestPost}
            onLike={() => toggleLike(latestPost.id)}
            onSave={() => toggleSavePost(latestPost.id)}
            onComment={(text) => addComment(latestPost.id, text)}
          />
        )}
      </section>

      {/* Experts strip */}
      <Card className="border-border/70 bg-accent/50 py-0">
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="font-bold">Je, una tatizo shambani?</p>
            <p className="text-sm text-muted-foreground">
              Uliza mtaalamu wa kilimo bure leo.
            </p>
          </div>
          <Link
            to="/wataalamu"
            className="whitespace-nowrap rounded-xl bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Wataalamu
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Nyumbani;
