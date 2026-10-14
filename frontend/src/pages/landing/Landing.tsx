import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { normalizePhone } from "@/lib/api";
import { startHeroScene } from "./heroScene";
import "./landing.css";

const Icon = ({ id, style }: { id: string; style?: CSSProperties }) => (
  <svg className="ic" aria-hidden="true" style={style}>
    <use href={`#i-${id}`} />
  </svg>
);

const d = (delay: string) => ({ "--d": delay }) as CSSProperties;

const Sprite = () => (
  <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
    <symbol id="i-cap" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></symbol>
    <symbol id="i-cart" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.6 12.4a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L21 7H6" /></symbol>
    <symbol id="i-box" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5V8z" /><path d="m3 8 9 5 9-5M12 13v8" /></symbol>
    <symbol id="i-list" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="3" width="14" height="18" rx="2.5" /><path d="M9 8h6M9 12h6M9 16h4" /></symbol>
    <symbol id="i-wallet" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="3" /><path d="M2 10h20M6 15h4" /></symbol>
    <symbol id="i-users" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.5-3.5 3.2-5.5 6.5-5.5s6 2 6.5 5.5" /><circle cx="17" cy="9" r="2.5" /><path d="M17.5 14.5c2.2.3 3.6 2 4 5" /></symbol>
    <symbol id="i-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></symbol>
    <symbol id="i-arrow" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></symbol>
    <symbol id="i-check" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></symbol>
    <symbol id="i-shield" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" /><path d="M8.5 12l2.5 2.5L16 9.5" /></symbol>
    <symbol id="i-leaf" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19c0-8 5-14 15-14 0 9-5 15-13 15" /><path d="M5 19c3-5 6-8 10-10" /></symbol>
    <symbol id="i-pin" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></symbol>
    <symbol id="i-thumb" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3zm0 0 4-7c1.5 0 2.5 1 2.5 2.5V10h5a2 2 0 0 1 2 2.3l-1 6a2 2 0 0 1-2 1.7H7" /></symbol>
    <symbol id="i-msg" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16v11H9l-5 4V5z" /></symbol>
    <symbol id="i-eye" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></symbol>
    <symbol id="i-menu" viewBox="0 0 24 24" strokeLinecap="round"><path d="M4 8h16M4 16h16" /></symbol>
    <symbol id="i-x" viewBox="0 0 24 24" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></symbol>
  </svg>
);

const Counter = ({ end }: { end: number }) => {
  const [value, setValue] = useState(() =>
    matchMedia("(prefers-reduced-motion: reduce)").matches ? end : 0,
  );
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = performance.now() + 2500, dur = 1900;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - start) / dur));
      setValue(Math.round(end * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end]);
  return <span>{value.toLocaleString("en-US")}</span>;
};

const LangToggle = () => {
  const { lang, setLang } = useLanguage();
  return (
    <div className="lang" role="group" aria-label="Language">
      {(["sw", "en"] as const).map((l) => (
        <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

const HowItWorks = () => {
  const { lt } = useLanguage();
  const [cur, setCur] = useState(0);
  const [paid, setPaid] = useState(false);
  const [inView, setInView] = useState(false);
  const [tick, setTick] = useState(0);
  const secRef = useRef<HTMLElement>(null);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const io = new IntersectionObserver((es) => setInView(es[0].isIntersecting), { threshold: 0.35 });
    if (secRef.current) io.observe(secRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    setPaid(false);
    if (cur !== 2) return;
    const id = setTimeout(() => setPaid(true), 1700);
    return () => clearTimeout(id);
  }, [cur, tick]);

  useEffect(() => {
    if (reduce || !inView) return;
    const id = setInterval(() => setCur((c) => (c + 1) % 3), 5500);
    return () => clearInterval(id);
  }, [inView, reduce, tick]);

  const show = (i: number) => {
    setCur(i);
    setTick((t) => t + 1);
  };

  const steps = [
    ["s1_h", "s1_p"],
    ["s2_h", "s2_p"],
    ["s3_h", "s3_p"],
  ] as const;

  return (
    <section className="light" id="jinsi" style={{ padding: "70px 0 100px" }} ref={secRef}>
      <div className="wrap how">
        <div>
          <div className="sec-head">
            <h2>{lt("h_title")}</h2>
            <p>{lt("h_sub")}</p>
          </div>
          <div className="steps">
            {steps.map(([h, p], i) => (
              <button
                key={`${i}-${cur === i ? tick : "x"}`}
                className={`step${cur === i ? " on" : ""}`}
                type="button"
                aria-pressed={cur === i}
                onClick={() => show(i)}
              >
                <span className="n">{i + 1}</span>
                <span>
                  <h3>{lt(h)}</h3>
                  <p>{lt(p)}</p>
                </span>
                <span className="bar"><i /></span>
              </button>
            ))}
          </div>
        </div>
        <div className="stage">
          <svg className="bgsw" viewBox="0 0 400 160" preserveAspectRatio="none" aria-hidden="true"><path d="M0 160V90C70 50 150 36 240 50 150 62 80 104 40 160Z" fill="#C8F169" opacity=".5" /><path d="M60 160C120 90 230 52 360 40 270 72 200 116 160 160Z" fill="#fff" opacity=".35" /><path d="M220 160C270 106 330 72 400 62V160Z" fill="#C8F169" opacity=".45" /></svg>
          <div className={`phone${paid ? " paid" : ""}`} aria-hidden="true">
            <div className={`screen${cur === 0 ? " on" : ""}`}>
              <div className="ph-logo"><img src="/brand/mark-color.png" alt="" /><span>AGRIMIKA</span></div>
              <div className="ph-h">{lt("ph_welcome")}</div>
              <div className="ph-lbl">{lt("ph_label")}</div>
              <div className="ph-field"><b>+255</b><span>712 345 678</span></div>
              <div className="ph-btn">{lt("ph_btn")}</div>
              <div className="ph-art"><svg viewBox="0 0 400 120" preserveAspectRatio="none"><path d="M0 120V60C70 30 150 20 240 32 150 42 80 74 40 120Z" fill="#06301A" opacity=".5" /><path d="M60 120C120 64 230 34 360 26 270 50 200 84 150 120Z" fill="#fff" opacity=".35" /><path d="M220 120C270 76 330 48 400 40V120Z" fill="#06301A" opacity=".55" /></svg><span>Kilimo ni Maisha</span></div>
            </div>
            <div className={`screen${cur === 1 ? " on" : ""}`}>
              <div className="ph-logo"><img src="/brand/mark-color.png" alt="" /><span>AGRIMIKA</span></div>
              <div className="ph-search">{lt("ph_search")}</div>
              <div className="ph-grid">
                <div className="ph-app"><i style={{ background: "#0B7A43" }}><Icon id="cap" /></i><span>Agri-Learn</span></div>
                <div className="ph-app"><i style={{ background: "#E8801F" }}><Icon id="cart" /></i><span>{lt("ph_a2")}</span></div>
                <div className="ph-app"><i style={{ background: "#1F6FD0" }}><Icon id="list" /></i><span>{lt("ph_a3")}</span></div>
                <div className="ph-app"><i style={{ background: "#7A4FC4" }}><Icon id="wallet" /></i><span>{lt("ph_a4")}</span></div>
                <div className="ph-app"><i style={{ background: "#12A05A" }}><Icon id="leaf" /></i><span>{lt("ph_a5")}</span></div>
                <div className="ph-app"><i style={{ background: "#0E8F8F" }}><Icon id="users" /></i><span>{lt("ph_a6")}</span></div>
              </div>
              <div className="ph-post"><div className="pic" /><div>{lt("p1_h")}</div></div>
            </div>
            <div className={`screen${cur === 2 ? " on" : ""}`}>
              <div className="ph-logo"><img src="/brand/mark-color.png" alt="" /><span>AGRIMIKA</span></div>
              <div className="ph-order">
                <div><b>{lt("ph_order")}</b><br /><small>{lt("ph_item")}</small></div>
                <div className="ph-trk"><i /><u /><i /><u className="o" /><i className="o" /><u className="o" /><i className="o" /></div>
                <div className="ph-tot"><span>{lt("ph_total")}</span><span>TSh 85,000</span></div>
              </div>
              <div className="ph-pay"><span className="a">{lt("ph_pay")}</span><span className="b"><Icon id="check" /><span>{lt("paid")}</span></span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const POSTS = [
  {
    tag: "tg1", who: "Asha Msugu", av: "#0B7A43", time: "t2", h: "p1_h", p: "p1_p", eng: ["48", "12", "1.2k"],
    bg: "linear-gradient(160deg,#D9F57A,#5FB85A)",
    art: <svg viewBox="0 0 300 158" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="M150 158C104 112 104 56 150 14c46 42 46 98 0 144z" fill="#2E9B55" /><path d="M118 158c-10-42 8-72 32-86-10 30-10 56 0 86z" fill="#1F7F45" /><path d="M182 158c10-42-8-72-32-86 10 30 10 56 0 86z" fill="#1F7F45" /><ellipse cx="150" cy="82" rx="27" ry="54" fill="#F6C634" /><g stroke="#D9A515" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="1 9"><path d="M137 44v76M150 34v96M163 44v76" /></g></svg>,
  },
  {
    tag: "tg2", who: "Juma Kilimo", av: "#0A3D73", time: "t4", h: "p2_h", p: "p2_p", eng: ["62", "18", "2.4k"],
    bg: "linear-gradient(160deg,#FFC9A6,#7BC96A)",
    art: <svg viewBox="0 0 300 158" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="M0 158C60 112 120 120 170 158z" fill="#2E9B55" opacity=".85" /><path d="M130 158C190 108 250 116 300 150V158z" fill="#1F7F45" opacity=".85" /><circle cx="96" cy="98" r="35" fill="#E8432F" /><circle cx="166" cy="86" r="40" fill="#F0523A" /><circle cx="224" cy="108" r="30" fill="#D93A29" /><ellipse cx="84" cy="86" rx="8" ry="5" fill="#fff" opacity=".35" transform="rotate(-30 84 86)" /><ellipse cx="152" cy="72" rx="9" ry="5" fill="#fff" opacity=".35" transform="rotate(-30 152 72)" /><path d="M166 46l-9 11 11-2 4 9 5-9 11 2-9-11z" fill="#2A8A46" /><path d="M96 63l-7 9 9-1 3 7 4-7 9 1-7-9z" fill="#2A8A46" /></svg>,
  },
  {
    tag: "tg3", who: "Mariamu Fresh", av: "#B8741A", time: "t6", h: "p3_h", p: "p3_p", eng: ["37", "9", "980"],
    bg: "linear-gradient(160deg,#FFE9A0,#9BD66A)",
    art: <svg viewBox="0 0 300 158" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFC83D" /><stop offset="1" stopColor="#F2602F" /></linearGradient></defs><path d="M0 158C70 120 140 130 300 112V158z" fill="#2E9B55" opacity=".8" /><path d="M150 46c32 0 50 25 44 54-5 25-23 42-44 42s-39-17-44-42c-6-29 12-54 44-54z" fill="url(#cg)" /><path d="M148 48c-15-6-19-23-9-32 11-8 32-4 38 8 4 9-6 13-15 11-6-1-8 6-14 13z" fill="#6E5C4A" /><ellipse cx="132" cy="84" rx="9" ry="14" fill="#fff" opacity=".25" transform="rotate(20 132 84)" /></svg>,
  },
  {
    tag: "tg4", who: "Kassim Mnena", av: "#6B4FA0", time: "t8", h: "p4_h", p: "p4_p", eng: ["54", "14", "1.6k"],
    bg: "linear-gradient(180deg,#CDEFD6,#86CC84)",
    art: <svg viewBox="0 0 300 158" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="M0 100C60 72 112 92 170 74S260 82 300 70V158H0z" fill="#46A055" /><path d="M0 126C70 104 140 122 300 102V158H0z" fill="#2B7F3F" /><g fill="#1E2B24"><ellipse cx="92" cy="106" rx="27" ry="13" /><ellipse cx="124" cy="98" rx="10" ry="8" /><rect x="74" y="112" width="5" height="16" rx="2" /><rect x="104" y="112" width="5" height="16" rx="2" /><ellipse cx="206" cy="124" rx="30" ry="14" /><ellipse cx="240" cy="116" rx="11" ry="9" /><rect x="186" y="130" width="5" height="16" rx="2" /><rect x="220" y="130" width="5" height="16" rx="2" /></g></svg>,
  },
] as const;

const Landing = () => {
  const { lt } = useLanguage();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState<{ kind: "err"; text: string } | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLCanvasElement>(null);
  const droneRef = useRef<HTMLCanvasElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    document.title = "AGRIMIKA — Kilimo ni Maisha";
    const onScroll = () => setScrolled(window.scrollY > 40);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!heroRef.current || !sceneRef.current || !droneRef.current) return;
    return startHeroScene(heroRef.current, sceneRef.current, droneRef.current, hintRef.current);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhone(phone);
    if (!normalized) {
      setMsg({ kind: "err", text: lt("err") });
      return;
    }
    navigate(`/jisajili?phone=${encodeURIComponent(normalized)}`);
  };

  return (
    <div className="lp">
      <Sprite />
      <a className="skip" href="#main">{lt("skip")}</a>

      <header className={`nav${scrolled ? " scrolled" : ""}${menuOpen ? " open" : ""}`}>
        <div className="nav-in">
          <a className="brand" href="#top" aria-label="AGRIMIKA">
            <img className="mark" src="/brand/mark-light.png" alt="" />
            <img className="word" src="/brand/wordmark-light.png" alt="AGRIMIKA" />
          </a>
          <nav className="nav-links" aria-label="Main">
            <a href="#sifa">{lt("n_feat")}</a>
            <a href="#jinsi">{lt("n_how")}</a>
            <a href="#jamii">{lt("n_comm")}</a>
          </nav>
          <div className="nav-right">
            <LangToggle />
            <Link className="login" to="/ingia">{lt("n_login")}</Link>
            <Link className="btn btn-solid btn-sm" to="/jisajili">{lt("n_signup")}</Link>
            <button
              className="menu-btn"
              type="button"
              aria-expanded={menuOpen}
              aria-label={lt("menu")}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <Icon id={menuOpen ? "x" : "menu"} />
            </button>
          </div>
        </div>
        <div className="mobile-panel">
          <a href="#sifa" onClick={closeMenu}>{lt("n_feat")}</a>
          <a href="#jinsi" onClick={closeMenu}>{lt("n_how")}</a>
          <a href="#jamii" onClick={closeMenu}>{lt("n_comm")}</a>
          <Link to="/ingia">{lt("n_login")}</Link>
          <Link className="btn btn-solid" to="/jisajili">{lt("n_signup")}</Link>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="top" ref={heroRef}>
          <canvas id="scene" ref={sceneRef} aria-hidden="true" />
          <canvas id="droneLayer" ref={droneRef} aria-hidden="true" />
          <div className="hero-fade" />
          <div className="hero-inner">
            <h1 className="h1">
              <span className="ln"><span style={d("1.05s")}>{lt("h1a")}</span></span>
              <span className="ln"><span style={d("1.2s")}>{lt("h1b")}</span></span>
              <span className="ln"><span style={d("1.35s")}>{lt("h1c")}</span></span>
            </h1>
            <p className="lead" style={d("1.9s")}>{lt("hero_sub")}</p>
            <div className="cta-row" style={d("2.1s")}>
              <Link className="btn btn-solid" to="/jisajili"><span>{lt("cta1")}</span><Icon id="arrow" /></Link>
              <a className="btn btn-ghost" href="#jinsi"><Icon id="play" style={{ fill: "currentColor", stroke: "none" }} /><span>{lt("cta2")}</span></a>
            </div>
            <div className="hero-foot">
              <div className="stats" style={d("2.5s")}>
                <div className="stat"><Icon id="leaf" /><div><b><Counter end={11500} />+</b><small>{lt("st1")}</small></div></div>
                <div className="stat"><Icon id="box" /><div><b><Counter end={2500} />+</b><small>{lt("st2")}</small></div></div>
                <div className="stat"><Icon id="pin" /><div><b>{lt("st3v")}</b><small>{lt("st3")}</small></div></div>
              </div>
              <p className="hint" ref={hintRef} style={d("3s")}>{lt("hint")}</p>
            </div>
          </div>
        </section>

        <section className="light sheet" id="sifa">
          <div className="wrap">
            <div className="sec-head">
              <h2>{lt("f_title")}</h2>
              <p>{lt("f_sub")}</p>
            </div>
            <div className="bento">
              <article className="tile t-learn">
                <div className="badge"><Icon id="cap" /></div>
                <div><h3>Agri-Learn</h3><p style={{ marginTop: 8 }}>{lt("learn_p")}</p></div>
                <div className="vid" aria-hidden="true">
                  <svg className="sw" viewBox="0 0 400 150" preserveAspectRatio="none"><path d="M0 150V92C70 52 150 40 230 54 150 64 80 104 40 150Z" fill="#0B7A43" opacity=".55" /><path d="M60 150C120 84 220 48 340 40 260 70 190 112 150 150Z" fill="#06301A" opacity=".6" /><path d="M200 150C250 100 320 64 400 54V150Z" fill="#04210F" opacity=".7" /></svg>
                  <div className="play"><Icon id="play" /></div>
                  <div className="cap">{lt("l1")}</div>
                </div>
                <div className="lessons">
                  {([["l1", 80], ["l2", 45], ["l3", 12]] as const).map(([k, p]) => (
                    <div key={k} className="lesson" style={{ "--p": `${p}%` } as CSSProperties}>
                      <span>{lt(k)}</span><em>{p}%</em><i />
                    </div>
                  ))}
                </div>
              </article>

              <article className="tile t-shop">
                <div className="badge"><Icon id="box" /></div>
                <div><h3>{lt("shop_h")}</h3><p style={{ marginTop: 8 }}>{lt("shop_p")}</p></div>
                <div className="chips">
                  {(["c1", "c2", "c3", "c4", "c5"] as const).map((k) => <span key={k} className="chip">{lt(k)}</span>)}
                </div>
              </article>

              <article className="tile t-req">
                <div className="badge"><Icon id="cart" /></div>
                <div><h3>{lt("req_h")}</h3><p style={{ marginTop: 8 }}>{lt("req_p")}</p></div>
                <div className="req-card" aria-hidden="true">
                  <div><b>{lt("req_m")}</b><span>{lt("req_s")}</span></div>
                  <div className="mini">{lt("req_b")}</div>
                </div>
              </article>

              <article className="tile t-ord">
                <div className="badge"><Icon id="list" /></div>
                <div><h3>{lt("ord_h")}</h3><p style={{ marginTop: 8 }}>{lt("ord_p")}</p></div>
                <div className="track" aria-hidden="true">
                  <div className="trk done"><i><Icon id="check" style={{ strokeWidth: 3 }} /></i><span>{lt("o1")}</span></div>
                  <div className="trk done"><i><Icon id="check" style={{ strokeWidth: 3 }} /></i><span>{lt("o2")}</span></div>
                  <div className="trk now"><i /><span>{lt("o3")}</span></div>
                  <div className="trk"><i /><span>{lt("o4")}</span></div>
                </div>
              </article>

              <article className="tile t-pay">
                <div className="badge"><Icon id="wallet" /></div>
                <div><h3>{lt("pay_h")}</h3><p style={{ marginTop: 8 }}>{lt("pay_p")}</p></div>
                <div className="pays" aria-hidden="true">
                  <div className="pay"><div><b>{lt("pr1")}</b><small>DAP · 50 kg</small></div><div className="amt">TSh 85,000<small className="ok">{lt("paid")}</small></div></div>
                  <div className="pay"><div><b>{lt("pr2")}</b><small>25 kg</small></div><div className="amt">TSh 42,000<small className="wait">{lt("pending")}</small></div></div>
                </div>
              </article>

              <article className="tile t-com">
                <div className="badge"><Icon id="users" /></div>
                <div className="com-line"><div><b>{lt("g_h")}</b><span>{lt("g_p")}</span></div></div>
                <div className="com-line"><div><b>{lt("fr_h")}</b><span>{lt("fr_p")}</span></div></div>
                <div className="grp" aria-hidden="true">
                  <div className="avs">
                    <span className="av" style={{ background: "#0B7A43" }}>A</span>
                    <span className="av" style={{ background: "#0A3D73" }}>J</span>
                    <span className="av" style={{ background: "#B8741A" }}>M</span>
                    <span className="av" style={{ background: "#6B4FA0" }}>K</span>
                  </div>
                  <div><b>{lt("grp_n")}</b><small>{lt("grp_s")}</small></div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <HowItWorks />

        <section className="light" id="jamii" style={{ padding: "40px 0 20px" }}>
          <div className="wrap">
            <div className="comm-head">
              <div className="sec-head"><h2>{lt("c_title")}</h2><p>{lt("c_sub")}</p></div>
              <Link className="see-all" to="/jisajili"><span>{lt("c_all")}</span><Icon id="arrow" /></Link>
            </div>
            <div className="posts">
              {POSTS.map((post) => (
                <article key={post.h} className="post">
                  <div className="art" style={{ background: post.bg }}>
                    {post.art}
                    <span className="tag">{lt(post.tag)}</span>
                  </div>
                  <div className="body">
                    <div className="who">
                      <span className="av" style={{ background: post.av }}>{post.who[0]}</span>
                      <div><b>{post.who}</b><small>{lt(post.time)}</small></div>
                    </div>
                    <h3>{lt(post.h)}</h3>
                    <p>{lt(post.p)}</p>
                    <div className="eng">
                      <span><Icon id="thumb" />{post.eng[0]}</span>
                      <span><Icon id="msg" />{post.eng[1]}</span>
                      <span><Icon id="eye" />{post.eng[2]}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="light final" id="jisajili">
          <div className="wrap">
            <div className="cta-box">
              <svg className="sw" viewBox="0 0 400 160" aria-hidden="true"><path d="M0 160C30 108 130 52 240 50 150 62 80 104 40 160Z" fill="#fff" /><path d="M60 160C120 90 230 52 360 40 270 72 200 116 160 160Z" fill="#C8F169" /><path d="M220 160C270 106 330 72 400 62V160Z" fill="#fff" /></svg>
              <h2>{lt("cta_h")}</h2>
              <p>{lt("cta_p")}</p>
              <form className="signup" onSubmit={submit} noValidate>
                <label>
                  <span className="cc">+255</span>
                  <span className="sr">{lt("cta_lbl")}</span>
                  <input
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder={lt("cta_ph")}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setMsg(null);
                    }}
                    aria-invalid={msg ? true : undefined}
                    aria-describedby="formMsg"
                  />
                </label>
                <button className="btn btn-solid" type="submit"><span>{lt("cta_btn")}</span><Icon id="arrow" /></button>
              </form>
              <Link className="btn btn-solid cta-mobile" to="/jisajili"><span>{lt("cta_btn")}</span><Icon id="arrow" /></Link>
              <p className={`msg${msg ? " err" : ""}`} id="formMsg" role="status" aria-live="polite">{msg?.text}</p>
              <span className="safe"><Icon id="shield" /><span>{lt("cta_note")}</span></span>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <a className="brand" href="#top" aria-label="AGRIMIKA">
                <img className="mark" src="/brand/mark-light.png" alt="" />
                <img className="word" src="/brand/wordmark-light.png" alt="AGRIMIKA" />
              </a>
              <p className="about">{lt("f_about")}</p>
            </div>
            <div>
              <h4>{lt("f_links")}</h4>
              <ul>
                <li><a href="#sifa">{lt("n_feat")}</a></li>
                <li><a href="#jinsi">{lt("n_how")}</a></li>
                <li><a href="#jamii">{lt("n_comm")}</a></li>
                <li><Link to="/jisajili">{lt("n_signup")}</Link></li>
              </ul>
            </div>
            <div>
              <h4>{lt("f_follow")}</h4>
              <ul>
                {["WhatsApp", "Facebook", "Instagram", "YouTube", "X"].map((s) => <li key={s}><a href="#">{s}</a></li>)}
              </ul>
            </div>
            <div>
              <h4>{lt("f_contact")}</h4>
              <ul>
                <li>{lt("f_where")}</li>
                <li>+255 7XX XXX XXX</li>
                <li>hello@agrimika.example</li>
              </ul>
            </div>
          </div>
          <div className="giant" aria-hidden="true">Kilimo ni Maisha</div>
          <div className="foot-bottom">{lt("f_copy")}</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
