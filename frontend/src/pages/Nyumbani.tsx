import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import {
  Banknote,
  Calendar,
  Check,
  Clock,
  LayoutGrid,
  ListOrdered,
  MapPin,
  Package,
  PenLine,
  Sprout,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import PostCard from "@/components/PostCard";
import QueryState from "@/components/QueryState";
import { useAuth, type PendingVerification } from "@/context/AuthContext";
import type { DashContext } from "@/layouts/DashLayout";
import { usePostActions, usePosts } from "@/hooks/useApi";
import { useLanguage } from "@/i18n/LanguageContext";
import type { StringKey } from "@/i18n/strings";
import { api, ApiError, normalizePhone } from "@/lib/api";
import { startHeroScene } from "@/pages/landing/heroScene";

const DAYS = {
  sw: ["Jumapili", "Jumatatu", "Jumanne", "Jumatano", "Alhamisi", "Ijumaa", "Jumamosi"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};
const MONTHS = {
  sw: ["Januari", "Februari", "Machi", "Aprili", "Mei", "Juni", "Julai", "Agosti", "Septemba", "Oktoba", "Novemba", "Desemba"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

const STORE = "agrimika-onboard";

const QUICK: { to: string; icon: LucideIcon; label: StringKey }[] = [
  { to: "/bidhaa", icon: Package, label: "dash.app_shop" },
  { to: "/oda", icon: ListOrdered, label: "dash.app_orders" },
  { to: "/lipia", icon: Wallet, label: "dash.app_pay" },
  { to: "/vikundi", icon: Users, label: "dash.app_groups" },
  { to: "/mikopo", icon: Banknote, label: "dash.app_loans" },
];

const readSteps = (): boolean[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) || "[]");
    if (Array.isArray(raw)) return [false, Boolean(raw[1]), Boolean(raw[2]), Boolean(raw[3])];
  } catch {
    /* ignore */
  }
  return [false, false, false, false];
};

const Nyumbani = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const { query } = useOutletContext<DashContext>();
  const heroRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLCanvasElement>(null);
  const droneRef = useRef<HTMLCanvasElement>(null);
  const { data: posts, isLoading: postsLoading, isError: postsError, refetch: refetchPosts } = usePosts();
  const { like, save, comment } = usePostActions();

  const [steps, setSteps] = useState<boolean[]>(readSteps);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [verifyMsg, setVerifyMsg] = useState("");
  const [verifyBusy, setVerifyBusy] = useState(false);
  const celebrated = useRef(false);

  const phoneDone = Boolean(user?.phoneVerified);
  const profileDone = steps[1] || Boolean(user?.region || user?.location);
  const done = [phoneDone, profileDone, steps[2], steps[3]];
  const doneCount = done.filter(Boolean).length;
  const needle = query.trim().toLocaleLowerCase();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("dash.greeting_morning");
    if (hour < 16) return t("dash.greeting_afternoon");
    if (hour < 19) return t("dash.greeting_evening");
    return t("home.g_night");
  };

  const today = useMemo(() => {
    const now = new Date();
    return `${DAYS[lang][now.getDay()]}, ${now.getDate()} ${MONTHS[lang][now.getMonth()]} ${now.getFullYear()}`;
  }, [lang]);

  useEffect(() => {
    const hero = heroRef.current;
    const scene = sceneRef.current;
    const drone = droneRef.current;
    if (!hero || !scene || !drone) return;
    return startHeroScene(hero, scene, drone, null, { compact: true });
  }, []);

  useEffect(() => {
    if (doneCount === 4 && !celebrated.current) {
      celebrated.current = true;
      window.dispatchEvent(new Event("agrimika:pulse"));
    }
    if (doneCount < 4) celebrated.current = false;
  }, [doneCount]);

  const saveSteps = (next: boolean[]) => {
    setSteps(next);
    localStorage.setItem(STORE, JSON.stringify(next));
  };

  const finish = (index: number, to?: string) => {
    const next = [...steps];
    next[index] = true;
    saveSteps(next);
    if (to) navigate(to);
  };

  const submitPhone = async (e: FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhone(phone);
    if (!normalized) {
      setVerifyMsg(t("home.vf_err"));
      return;
    }
    setVerifyBusy(true);
    setVerifyMsg("");
    try {
      const res = await api.post<{ resendIn: number }>("/auth/verify/request/", { phone: normalized }, false);
      const pending: PendingVerification = {
        phone: normalized,
        phoneMasked: `+255 ${normalized.slice(4, 7)} *** ${normalized.slice(-3)}`,
        resendIn: res.resendIn,
      };
      navigate("/thibitisha", { state: pending });
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0;
      setVerifyMsg(status === 503 ? t("home.sms_off") : err instanceof ApiError ? err.message : t("home.vf_err"));
    } finally {
      setVerifyBusy(false);
    }
  };

  const visible = (label: string) => !needle || label.toLocaleLowerCase().includes(needle);
  const feed = (posts ?? []).filter((post) => visible(`${post.author} ${post.text} ${post.location ?? ""}`));

  return (
    <>
      <section className="hero dark-zone" id="muhtasari" ref={heroRef}>
        <canvas id="dscene" ref={sceneRef} aria-hidden="true" />
        <canvas id="ddrone" ref={droneRef} aria-hidden="true" />
        <div className="hero-fade" />
        <div className="hero-in">
          <div>
            <span className="pill rise" style={{ ["--d" as string]: ".5s" }}>
              <Calendar className="ic" />
              <span>{today}</span>
            </span>
            <h1 className="rise" style={{ ["--d" as string]: ".7s" }}>
              {greeting()}, {user?.firstName || user?.username}.
            </h1>
            <p className="lead rise" style={{ ["--d" as string]: ".9s" }}>
              {lang === "en" ? (
                <>Welcome to your farming hub. Modern <b>Farming</b> is more than a business. It <b>is</b> <b>Life</b>.</>
              ) : (
                <>Karibu kwenye kituo chako cha kilimo. <b>Kilimo</b> Bora ni zaidi ya biashara <b>ni</b> <b>Maisha</b>.</>
              )}
            </p>
            <div className="cta rise" style={{ ["--d" as string]: "1.1s" }}>
              <Link className="btn btn-solid" to="/huduma">
                <Sprout className="ic" /> Agrimika
              </Link>
              <a className="btn btn-ghost" href="#soko">{t("home.hero_cta2")}</a>
            </div>
          </div>
          <div className="hero-row">
            <div className="hstats rise" style={{ ["--d" as string]: "1.4s" }}>
              <div className="hs">
                <LayoutGrid className="ic" />
                <div><b>12</b><small>{t("home.hs1")}</small></div>
              </div>
              <div className="hs">
                <Clock className="ic" />
                <div><b>24/7</b><small>{t("home.hs2")}</small></div>
              </div>
              <div className="hs">
                <MapPin className="ic" />
                <div><b>{t("home.hs3v")}</b><small>{t("home.hs3")}</small></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <nav className="qacts" aria-label={t("home.sv_h")}>
        {QUICK.map((item) => (
          <Link className="qact" to={item.to} key={item.to}>
            <span><item.icon className="ic" /></span>
            {t(item.label)}
          </Link>
        ))}
      </nav>

      <Link className="composer" to="/post/unda">
        <span className="av" aria-hidden="true">{(user?.firstName || user?.username || "A").slice(0, 1).toUpperCase()}</span>
        <TypeLine phrases={WRITE.map((key) => t(key))} />
        <PenLine className="ic" />
      </Link>

      {doneCount < 4 && (
        <section className="panel start" aria-labelledby="tdH">
          <div className="ph">
            <div>
              <h2 id="tdH">{t("home.td_h")}</h2>
              <p>{t("home.td_sub")}</p>
            </div>
            <div className="ring" role="img" aria-label={`${doneCount}/4`}>
              <svg viewBox="0 0 64 64" aria-hidden="true">
                <circle className="bg" cx="32" cy="32" r="26" />
                <circle className="fg" cx="32" cy="32" r="26" style={{ strokeDashoffset: 163.4 * (1 - doneCount / 4) }} />
              </svg>
              <b>{doneCount}/4</b>
            </div>
          </div>
          <ul className="todos">
            <li className={phoneDone ? "todo done" : "todo"}>
              <button
                className="todo-hit"
                type="button"
                disabled={phoneDone}
                aria-expanded={verifyOpen}
                onClick={() => setVerifyOpen((v) => !v)}
              >
                <span className="tick" aria-hidden="true"><Check className="ic" strokeWidth={3} /></span>
                <span>
                  <h3>{t("home.td1_h")}</h3>
                  <p>{phoneDone && user?.phone ? user.phone : t("home.td1_p")}</p>
                </span>
              </button>
              <div className={verifyOpen && !phoneDone ? "verify open" : "verify"}>
                <form className="vf" onSubmit={submitPhone}>
                  <label>
                    <span className="cc">+255</span>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      placeholder="712 345 678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      aria-label={t("auth.phone")}
                    />
                  </label>
                  <button className="btn btn-solid" type="submit" disabled={verifyBusy}>{t("home.vf_btn")}</button>
                </form>
                {verifyMsg && <p className="vmsg" role="status">{verifyMsg}</p>}
              </div>
            </li>
            <Todo
              done={profileDone}
              title={t("home.td2_h")}
              text={t("home.td2_p")}
              onAct={() => finish(1, "/wasifu")}
            />
            <Todo
              done={steps[2]}
              title={t("home.td3_h")}
              text={t("home.td3_p")}
              onAct={() => finish(2, "/jifunze")}
            />
            <Todo
              done={steps[3]}
              title={t("home.td4_h")}
              text={t("home.td4_p")}
              onAct={() => finish(3, "/vikundi")}
            />
          </ul>
        </section>
      )}

      <section aria-labelledby="cmH">
        <div className="sec-h">
          <h2 id="cmH">{t("home.cm_h")}</h2>
        </div>
        <QueryState
          isLoading={postsLoading}
          isError={postsError}
          onRetry={() => refetchPosts()}
          empty={!postsLoading && feed.length === 0}
          emptyText={t("home.cm_empty")}
        >
          <div className="feed">
            {feed.map((post) => (
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
      </section>

      <div className="foot">
        <span>{t("home.f1")}</span>
        <span>{t("home.f2")}</span>
      </div>
    </>
  );
};

const WRITE = ["home.w1", "home.w2", "home.w3", "home.w4", "home.w5"] as const;

const TypeLine = ({ phrases }: { phrases: string[] }) => {
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const text = phrases[index] ?? "";

  useEffect(() => {
    if (!text) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(text.length);
      return;
    }
    let i = 0;
    let timer = 0;
    const tick = () => {
      if (i >= text.length) {
        timer = window.setTimeout(() => {
          setIndex((n) => (n + 1) % phrases.length);
          setCount(0);
        }, 2400);
        return;
      }
      i += 1;
      setCount(i);
      timer = window.setTimeout(tick, 105);
    };
    timer = window.setTimeout(tick, 500);
    return () => window.clearTimeout(timer);
  }, [text, phrases.length]);

  return (
    <span className="type" aria-label={phrases.join(". ")}>
      {text.slice(0, count)}
    </span>
  );
};

const Todo = ({
  done,
  title,
  text,
  onAct,
}: {
  done: boolean;
  title: string;
  text: string;
  onAct: () => void;
}) => (
  <li className={done ? "todo done" : "todo"}>
    <button className="todo-hit" type="button" onClick={onAct}>
      <span className="tick" aria-hidden="true"><Check className="ic" strokeWidth={3} /></span>
      <span>
        <h3>{title}</h3>
        <p>{text}</p>
      </span>
    </button>
  </li>
);

export default Nyumbani;
