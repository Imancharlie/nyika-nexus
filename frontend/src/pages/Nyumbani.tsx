import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import {
  ArrowRight,
  Banknote,
  Bell,
  Calendar,
  Clock,
  GraduationCap,
  LayoutGrid,
  LifeBuoy,
  ListOrdered,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Package,
  Play,
  ShoppingCart,
  Sprout,
  UserPlus,
  Users,
  Wallet,
  Wrench,
  Check,
  type LucideIcon,
} from "lucide-react";
import { useAuth, type PendingVerification } from "@/context/AuthContext";
import type { DashContext } from "@/layouts/DashLayout";
import { useArticles, usePosts, useProducts } from "@/hooks/useApi";
import { useLanguage } from "@/i18n/LanguageContext";
import type { StringKey } from "@/i18n/strings";
import { api, ApiError, normalizePhone } from "@/lib/api";
import { formatTZS, timeAgo } from "@/lib/utils";
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
const ALERT = "agrimika-price-alert";

type Tile = {
  to: string;
  icon: LucideIcon;
  title: StringKey;
  text: StringKey;
  navy?: boolean;
  more?: boolean;
};

const TILES: Tile[] = [
  { to: "/bidhaa", icon: Package, title: "dash.app_shop", text: "home.p_shop" },
  { to: "/omba-oda", icon: ShoppingCart, title: "dash.app_request", text: "home.p_request" },
  { to: "/oda", icon: ListOrdered, title: "dash.app_orders", text: "home.p_orders" },
  { to: "/lipia", icon: Wallet, title: "dash.app_pay", text: "home.p_pay", navy: true },
  { to: "/vikundi", icon: Users, title: "dash.app_groups", text: "home.p_groups" },
  { to: "/huduma", icon: Wrench, title: "dash.app_services", text: "home.p_services" },
  { to: "/ushauri", icon: MessageSquare, title: "dash.app_experts", text: "home.p_experts" },
  { to: "/mikopo", icon: Banknote, title: "dash.app_loans", text: "home.p_loans", navy: true },
  { to: "/post", icon: UserPlus, title: "dash.app_community", text: "home.p_community" },
  { to: "/msaada", icon: LifeBuoy, title: "dash.app_help", text: "home.p_help" },
  { to: "/utafutaji", icon: MoreHorizontal, title: "dash.app_more", text: "home.p_more", more: true },
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

const Go = () => (
  <span className="go" aria-hidden="true"><ArrowRight className="ic" /></span>
);

const Nyumbani = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const { query } = useOutletContext<DashContext>();
  const heroRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLCanvasElement>(null);
  const droneRef = useRef<HTMLCanvasElement>(null);
  const { data: products = [] } = useProducts();
  const { data: posts = [] } = usePosts();
  const { data: articles = [] } = useArticles();

  const [steps, setSteps] = useState<boolean[]>(readSteps);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [verifyMsg, setVerifyMsg] = useState("");
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [alertOn, setAlertOn] = useState(() => localStorage.getItem(ALERT) === "1");
  const celebrated = useRef(false);

  const phoneDone = Boolean(user?.phoneVerified);
  const profileDone = steps[1] || Boolean(user?.region || user?.location);
  const done = [phoneDone, profileDone, steps[2], steps[3]];
  const doneCount = done.filter(Boolean).length;
  const lesson = articles[0];
  const market = products.slice(0, 3);
  const feed = posts.slice(0, 3);
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

  const toggle = (index: number) => {
    if (index === 0) return;
    const next = [...steps];
    next[index] = !next[index];
    saveSteps(next);
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

  const toggleAlert = () => {
    const next = !alertOn;
    setAlertOn(next);
    localStorage.setItem(ALERT, next ? "1" : "0");
  };

  const visible = (label: string) => !needle || label.toLocaleLowerCase().includes(needle);
  const learnLabel = `Agri-Learn ${t("home.sv_learn_p")}`;
  const shownTiles = TILES.filter((tile) => visible(`${t(tile.title)} ${t(tile.text)}`));
  const showLearn = visible(learnLabel);
  const none = !showLearn && shownTiles.length === 0;

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
            <p className="lead rise" style={{ ["--d" as string]: ".9s" }}>{t("home.hero_p")}</p>
            <div className="cta rise" style={{ ["--d" as string]: "1.1s" }}>
              <a className="btn btn-solid" href="#huduma">
                {t("home.hero_cta")} <ArrowRight className="ic" />
              </a>
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

      <div className="row2">
        <section className="panel" aria-labelledby="tdH">
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
              <button className="tick" type="button" disabled aria-hidden="true" tabIndex={-1}>
                <Check className="ic" strokeWidth={3} />
              </button>
              <div>
                <h3>{t("home.td1_h")}</h3>
                <p>{phoneDone && user?.phone ? user.phone : t("home.td1_p")}</p>
              </div>
              <button
                className={phoneDone ? "btn btn-line btn-sm td-act" : "btn btn-solid btn-sm td-act"}
                type="button"
                disabled={phoneDone}
                aria-expanded={verifyOpen}
                onClick={() => setVerifyOpen((v) => !v)}
              >
                {phoneDone ? t("home.td_done") : t("home.td1_b")}
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
              action={profileDone ? t("home.td_done") : t("home.td2_b")}
              onTick={() => toggle(1)}
              onAct={() => finish(1, "/wasifu")}
            />
            <Todo
              done={steps[2]}
              title={t("home.td3_h")}
              text={t("home.td3_p")}
              action={steps[2] ? t("home.td_done") : t("home.td3_b")}
              onTick={() => toggle(2)}
              onAct={() => finish(2, "/jifunze")}
            />
            <Todo
              done={steps[3]}
              title={t("home.td4_h")}
              text={t("home.td4_p")}
              action={steps[3] ? t("home.td_done") : t("home.td4_b")}
              onTick={() => toggle(3)}
              onAct={() => finish(3, "/vikundi")}
            />
          </ul>
          {doneCount === 4 && <p className="done-msg" role="status">{t("home.td_all")}</p>}
        </section>

        <section className="panel mkp" id="soko" aria-labelledby="mkH">
          <div className="ph">
            <div>
              <h2 id="mkH">{t("home.mk_h")}</h2>
              <p><span className="tagchip">{t("home.mk_chip")}</span></p>
            </div>
            <Link className="link" to="/bidhaa">
              {t("home.mk_all")} <ArrowRight className="ic" />
            </Link>
          </div>
          <div className="mk">
            {market.length === 0 && <p style={{ color: "var(--muted)" }}>{t("home.mk_empty")}</p>}
            {market.map((item) => (
              <Link className="mrow" to="/bidhaa" key={item.id}>
                <div className="crop">
                  {item.image ? <img src={item.image} alt="" /> : <Sprout className="ic" style={{ fontSize: 26, color: "#0B7A43" }} />}
                </div>
                <div>
                  <b>{item.name}</b>
                  <small>{item.unit} · {t("home.mk_unit")}</small>
                </div>
                <div className="pr">
                  {formatTZS(item.price)}
                  <small>{t("home.mk_chip")}</small>
                </div>
              </Link>
            ))}
          </div>
          <div className="alert">
            <span className="badge" aria-hidden="true"><Bell className="ic" /></span>
            <div>
              <b>{t("home.al_h")}</b>
              <p>{t("home.al_p")}</p>
            </div>
            <button className="btn btn-line btn-sm" type="button" aria-pressed={alertOn} onClick={toggleAlert}>
              {alertOn ? t("home.al_on") : t("home.al_off")}
            </button>
          </div>
        </section>
      </div>

      <section id="huduma" aria-labelledby="svH">
        <div className="sec-h">
          <div>
            <h2 id="svH">{t("home.sv_h")}</h2>
            <p>{t("home.sv_sub")}</p>
          </div>
          <Link className="link" to="/huduma">
            {t("home.sv_all")} <ArrowRight className="ic" />
          </Link>
        </div>
        {none ? (
          <p className="empty" role="status">{t("home.sv_none")}</p>
        ) : (
          <div className={needle ? "svcs filtering" : "svcs"}>
            {showLearn && (
              <Link className="svc s-learn" id="agri-learn" to={lesson ? `/jifunze/${lesson.id}` : "/jifunze"}>
                <svg className="sw" viewBox="0 0 400 160" aria-hidden="true">
                  <path d="M0 160C30 108 130 52 240 50 150 62 80 104 40 160Z" fill="#fff" />
                  <path d="M60 160C120 90 230 52 360 40 270 72 200 116 160 160Z" fill="#C8F169" />
                  <path d="M220 160C270 106 330 72 400 62V160Z" fill="#fff" />
                </svg>
                <span className="badge"><GraduationCap className="ic" /></span>
                <Go />
                <h3>Agri-Learn</h3>
                <p>{t("home.sv_learn_p")}</p>
                <span className="course">
                  <span className="pl"><Play className="ic" fill="currentColor" /></span>
                  <b>{lesson?.title || t("dash.app_learn")}</b>
                  <i />
                  <span className="btn btn-solid btn-sm">{t("home.resume")}</span>
                </span>
              </Link>
            )}
            {shownTiles.map((tile) => (
              <Link key={tile.to} className={tile.navy ? "svc s-navy" : tile.more ? "svc s-more" : "svc"} to={tile.to}>
                <span className="badge"><tile.icon className="ic" /></span>
                <Go />
                <h3>{t(tile.title)}</h3>
                <p>{t(tile.text)}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section id="jamii" aria-labelledby="cmH">
        <div className="sec-h">
          <div>
            <h2 id="cmH">{t("home.cm_h")}</h2>
            <p>{t("home.cm_sub")}</p>
          </div>
          <Link className="link" to="/post">
            {t("home.cm_all")} <ArrowRight className="ic" />
          </Link>
        </div>
        {feed.length === 0 ? (
          <p className="empty">{t("home.cm_empty")}</p>
        ) : (
          <div className="posts">
            {feed.map((post) => (
              <Link className="post" to="/post" key={post.id}>
                <div className="who">
                  <span className="av">
                    {post.avatar ? <img src={post.avatar} alt="" /> : post.author.slice(0, 1)}
                  </span>
                  <div>
                    <b>{post.author}</b>
                    <small>{post.createdAt ? timeAgo(post.createdAt, lang) : post.time}</small>
                  </div>
                </div>
                <h3>{post.text.slice(0, 72)}</h3>
                <p>{post.text}</p>
                {post.location && <span className="tagchip">{post.location}</span>}
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="foot">
        <span>{t("home.f1")}</span>
        <span>{t("home.f2")}</span>
      </div>
    </>
  );
};

const Todo = ({
  done,
  title,
  text,
  action,
  onTick,
  onAct,
}: {
  done: boolean;
  title: string;
  text: string;
  action: string;
  onTick: () => void;
  onAct: () => void;
}) => (
  <li className={done ? "todo done" : "todo"}>
    <button className="tick" type="button" aria-pressed={done} aria-label={title} onClick={onTick}>
      <Check className="ic" strokeWidth={3} />
    </button>
    <div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
    <button className="btn btn-line btn-sm td-act" type="button" disabled={done} onClick={onAct}>
      {action}
    </button>
  </li>
);

export default Nyumbani;
