import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { ArrowLeft, Clock, Menu, MessageSquare, RefreshCw, Send, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageContext";
import type { DashContext } from "@/layouts/DashLayout";

type Role = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  suggestions?: string[];
  createdAt: string;
};

type ApiMessage = {
  id: number;
  role: Role;
  content: string;
  suggestions?: string[];
  createdAt: string;
};

type SessionPayload = {
  id: number | null;
  title?: string;
  language: "sw" | "en";
  articleId: string | null;
  articleTitle: string | null;
  messages: ApiMessage[];
};

type ReplyPayload = {
  sessionId: number;
  title?: string;
  language: "sw" | "en";
  articleId: string | null;
  articleTitle: string | null;
  userMessage: ApiMessage;
  assistantMessage: ApiMessage;
};

type ChatSummary = {
  id: number;
  title: string;
  articleTitle: string | null;
  updatedAt: string;
  messageCount: number;
  active: boolean;
};

const NUMBERED_RE = /^\s*(\d+)[.)]\s+(.*)$/;
const BULLET_RE = /^\s*(?:[-•]|\*(?!\*))\s+(.*)$/;

type Tone = "user" | "assistant";

const safeHref = (url: string): string | null => {
  const trimmed = url.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^www\./i.test(trimmed)) return `https://${trimmed}`;
  return null;
};

const linkClass = (tone: Tone) =>
  tone === "user"
    ? "underline underline-offset-2 break-all"
    : "font-medium text-primary underline decoration-primary/40 underline-offset-2 break-all";

const renderAnchor = (label: string, href: string, key: string, tone: Tone): ReactNode => {
  const className = linkClass(tone);
  if (href.startsWith("/")) {
    return (
      <Link key={key} to={href} className={className}>
        {label}
      </Link>
    );
  }
  let internal: string | null = null;
  try {
    const parsed = new URL(href);
    if (parsed.origin === window.location.origin) {
      internal = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    internal = null;
  }
  if (internal) {
    return (
      <Link key={key} to={internal} className={className}>
        {label}
      </Link>
    );
  }
  return (
    <a key={key} href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {label}
    </a>
  );
};

const renderInline = (text: string, keyBase: string, tone: Tone): ReactNode[] => {
  const nodes: ReactNode[] = [];
  let plain = "";
  let index = 0;
  let seq = 0;
  const pushPlain = () => {
    if (!plain) return;
    nodes.push(plain);
    plain = "";
  };

  while (index < text.length) {
    if (text.startsWith("**", index)) {
      const end = text.indexOf("**", index + 2);
      if (end !== -1) {
        pushPlain();
        const inner = text.slice(index + 2, end);
        nodes.push(
          <strong key={`${keyBase}-b-${seq}`} className="font-semibold">
            {renderInline(inner, `${keyBase}-b-${seq}`, tone)}
          </strong>,
        );
        seq += 1;
        index = end + 2;
        continue;
      }
    }

    const markdown = text.slice(index).match(/^\[([^\]]+)\]\(([^)\s]+)\)/);
    if (markdown) {
      const href = safeHref(markdown[2]);
      if (href) {
        pushPlain();
        nodes.push(renderAnchor(markdown[1], href, `${keyBase}-a-${seq}`, tone));
        seq += 1;
        index += markdown[0].length;
        continue;
      }
    }

    const url = text.slice(index).match(/^(https?:\/\/[^\s<]+|www\.[^\s<]+)/i);
    if (url) {
      let raw = url[1];
      let trail = "";
      while (/[.,;:!?]$/.test(raw)) {
        trail = raw.slice(-1) + trail;
        raw = raw.slice(0, -1);
      }
      if (raw.endsWith(")") && !raw.includes("(")) {
        trail = `)${trail}`;
        raw = raw.slice(0, -1);
      }
      const href = safeHref(raw);
      if (href && raw) {
        pushPlain();
        nodes.push(renderAnchor(raw, href, `${keyBase}-u-${seq}`, tone));
        seq += 1;
        plain += trail;
        index += url[1].length;
        continue;
      }
    }

    plain += text[index];
    index += 1;
  }
  pushPlain();
  return nodes;
};

const toMessage = (message: ApiMessage): ChatMessage => ({
  id: String(message.id),
  role: message.role,
  content: message.content,
  suggestions: message.suggestions?.length ? message.suggestions : undefined,
  createdAt: message.createdAt,
});

const renderRichText = (content: string, tone: Tone = "assistant"): ReactNode[] => {
  const nodes: ReactNode[] = [];
  const lines = (content || "").split("\n");
  let numbered: { key: string; marker: string; text: string }[] = [];
  let bullets: { key: string; text: string }[] = [];
  let block = 0;

  const flush = () => {
    if (numbered.length) {
      nodes.push(
        <ol key={`ol-${block++}`} className="my-1.5 space-y-1.5">
          {numbered.map((item) => (
            <li key={item.key} className="flex gap-2">
              <span className="shrink-0 font-semibold tabular-nums opacity-80">{item.marker}.</span>
              <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">{renderInline(item.text, item.key, tone)}</span>
            </li>
          ))}
        </ol>,
      );
      numbered = [];
    }
    if (bullets.length) {
      nodes.push(
        <ul key={`ul-${block++}`} className="my-1.5 space-y-1.5">
          {bullets.map((item) => (
            <li key={item.key} className="flex gap-2">
              <span className="shrink-0 opacity-70">•</span>
              <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">{renderInline(item.text, item.key, tone)}</span>
            </li>
          ))}
        </ul>,
      );
      bullets = [];
    }
  };

  lines.forEach((line, index) => {
    const numberedLine = line.match(NUMBERED_RE);
    if (numberedLine) {
      if (bullets.length) flush();
      numbered.push({ key: `n-${index}`, marker: numberedLine[1], text: numberedLine[2] });
      return;
    }
    const bulletLine = line.match(BULLET_RE);
    if (bulletLine) {
      if (numbered.length) flush();
      bullets.push({ key: `b-${index}`, text: bulletLine[1] });
      return;
    }
    flush();
    if (line.trim() === "") {
      if (nodes.length) nodes.push(<div key={`sp-${index}`} className="h-2" />);
      return;
    }
    nodes.push(
      <p key={`p-${index}`} className="whitespace-pre-wrap break-words">
        {renderInline(line, `p-${index}`, tone)}
      </p>,
    );
  });
  flush();
  return nodes.length ? nodes : [<p key="empty">{content}</p>];
};

const Typing = () => (
  <div className="flex justify-start">
    <div className="rounded-2xl rounded-bl-none border border-primary/10 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-1.5">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-2 w-2 animate-bounce rounded-full bg-primary"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  </div>
);

const Mshauri = () => {
  const { t, lang } = useLanguage();
  const { openMenu } = useOutletContext<DashContext>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const arrivingFromArticle = Boolean(searchParams.get("q")?.trim() && searchParams.get("n"));
  const pendingArticle = useRef(arrivingFromArticle);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionTitle, setSessionTitle] = useState("");
  const [articleId, setArticleId] = useState<string | null>(null);
  const [articleTitle, setArticleTitle] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(!arrivingFromArticle);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<ChatSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(() => window.visualViewport?.height ?? window.innerHeight);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const sending = useRef(false);
  const seeded = useRef<string | null>(null);
  const langRef = useRef(lang);
  langRef.current = lang;

  const suggestions = [t("chat.sug1"), t("chat.sug2"), t("chat.sug3")];
  const incomingQuestion = Boolean(searchParams.get("q")?.trim() && searchParams.get("n"));
  const showWelcome = !loadingHistory && messages.length === 0 && !incomingQuestion && !loading;

  useEffect(() => {
    const chat = document.querySelector(".advisor-chat") as HTMLElement | null;
    const dash = document.querySelector(".dash") as HTMLElement | null;
    let timers: number[] = [];
    const update = () => {
      const vv = window.visualViewport;
      const height = vv?.height ?? window.innerHeight;
      const top = vv?.offsetTop ?? 0;
      setViewportHeight(height);
      if (!chat) return;
      const narrow = window.matchMedia("(max-width: 900px)").matches;
      const side = narrow || !dash
        ? 0
        : parseFloat(getComputedStyle(dash).getPropertyValue("--side")) || 268;
      chat.style.position = "fixed";
      chat.style.top = `${top}px`;
      chat.style.left = `${side}px`;
      chat.style.width = `calc(100% - ${side}px)`;
      chat.style.height = `${height}px`;
      chat.style.zIndex = "30";
    };
    const schedule = () => {
      update();
      timers.forEach((id) => window.clearTimeout(id));
      timers = [80, 280, 600].map((delay) => window.setTimeout(update, delay));
    };
    update();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", schedule);
    vv?.addEventListener("scroll", update);
    window.addEventListener("resize", schedule);
    const input = textareaRef.current;
    input?.addEventListener("focus", schedule);
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      vv?.removeEventListener("resize", schedule);
      vv?.removeEventListener("scroll", update);
      window.removeEventListener("resize", schedule);
      input?.removeEventListener("focus", schedule);
      if (!chat) return;
      chat.style.position = "";
      chat.style.top = "";
      chat.style.left = "";
      chat.style.width = "";
      chat.style.height = "";
      chat.style.zIndex = "";
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping, showWelcome, viewportHeight]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, window.innerHeight * 0.3)}px`;
  }, [input]);

  const applySession = (data: SessionPayload) => {
    setSessionId(data.id);
    setSessionTitle(data.title || "");
    setMessages(data.messages.map(toMessage));
    setArticleId(data.articleId);
    setArticleTitle(data.articleTitle);
  };

  useEffect(() => {
    if (pendingArticle.current) {
      setLoadingHistory(false);
      return;
    }
    let ignore = false;
    setLoadingHistory(true);
    api
      .get<SessionPayload>("/advisor/")
      .then((data) => {
        if (ignore) return;
        applySession(data);
      })
      .catch(() => {
        if (!ignore) {
          setMessages([{
            id: "load-error",
            role: "assistant",
            content: t("chat.error"),
            createdAt: new Date().toISOString(),
          }]);
        }
      })
      .finally(() => {
        if (!ignore) setLoadingHistory(false);
      });
    return () => {
      ignore = true;
    };
    // Reload only when a new conversation is started. `t` is read once for a failed load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generation]);

  const send = async (text: string, nextArticleId?: string | null, fresh = false) => {
    const trimmed = text.trim();
    if (!trimmed || sending.current) return;
    sending.current = true;
    setLoading(true);
    setIsTyping(true);
    setInput("");
    const localId = `local-${Date.now()}`;
    if (fresh) {
      setSessionId(null);
      setSessionTitle("");
      setArticleTitle(null);
    }
    setMessages((prev) => [
      ...(fresh ? [] : prev),
      { id: localId, role: "user", content: trimmed, createdAt: new Date().toISOString() },
    ]);
    textareaRef.current?.focus();
    try {
      const data = await api.post<ReplyPayload>("/advisor/messages/", {
        content: trimmed,
        articleId: nextArticleId || undefined,
        language: langRef.current,
        sessionId: fresh ? undefined : sessionId ?? undefined,
        fresh: fresh || undefined,
      });
      setSessionId(data.sessionId);
      setSessionTitle(data.title || "");
      setArticleId(data.articleId);
      setArticleTitle(data.articleTitle);
      setMessages((prev) => [
        ...prev.map((message) => (message.id === localId ? toMessage(data.userMessage) : message)),
        toMessage(data.assistantMessage),
      ]);
    } catch (error) {
      const message = error instanceof ApiError && error.message && error.message !== "network"
        ? error.message
        : t("chat.error");
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: "assistant", content: message, createdAt: new Date().toISOString() },
      ]);
    } finally {
      sending.current = false;
      setLoading(false);
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (loadingHistory) return;
    const question = searchParams.get("q")?.trim();
    const nonce = searchParams.get("n");
    if (!question || !nonce || seeded.current === nonce) return;
    seeded.current = nonce;
    pendingArticle.current = false;
    const fromArticle = searchParams.get("article");
    navigate("/mshauri", { replace: true });
    setSessionId(null);
    setSessionTitle("");
    setArticleId(fromArticle);
    setArticleTitle(null);
    void send(question, fromArticle, true);
    // `send` closes over the latest setters; the nonce guard stops a second post.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingHistory, searchParams, navigate]);

  const startNew = async () => {
    if (loading) return;
    setInput("");
    try {
      await api.post("/advisor/reset/");
    } catch {
      /* The next load shows an empty thread even if the reset call fails. */
    }
    setMessages([]);
    setSessionId(null);
    setSessionTitle("");
    setArticleId(null);
    setArticleTitle(null);
    setGeneration((value) => value + 1);
  };

  const showHistory = async () => {
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const data = await api.get<{ sessions: ChatSummary[] }>("/advisor/sessions/");
      setHistory(data.sessions);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const openChat = async (id: number) => {
    if (loading || id === sessionId) {
      setHistoryOpen(false);
      return;
    }
    setHistoryOpen(false);
    setLoadingHistory(true);
    try {
      const data = await api.get<SessionPayload>(`/advisor/sessions/${id}/`);
      applySession(data);
    } catch {
      setMessages([{
        id: "load-error",
        role: "assistant",
        content: t("chat.error"),
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const last = messages[messages.length - 1];
  const showChips = Boolean(
    last?.role === "assistant" && !loading && !input.trim() && last.suggestions?.length,
  );

  return (
    <div className="advisor-chat relative">
        <header className="chat-bar flex shrink-0 items-center gap-1 border-b border-border bg-white px-2">
          <button
            type="button"
            className="chat-menu h-10 w-10 place-items-center rounded-full text-deep"
            aria-label={t("shell.menu")}
            onClick={openMenu}
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full text-deep"
            aria-label={t("c.back")}
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1 px-1">
            <p className="truncate text-base font-bold text-deep">{t("chat.title")}</p>
            {articleId ? (
              <Link
                to={`/jifunze/${articleId}`}
                className="block truncate text-xs font-medium text-primary underline decoration-primary/30 underline-offset-2"
              >
                {t("chat.from_article")}: {articleTitle}
              </Link>
            ) : sessionTitle ? (
              <p className="truncate text-xs font-medium text-muted-foreground">{sessionTitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => void showHistory()}
            disabled={loadingHistory}
            aria-label={t("chat.history")}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold text-deep disabled:opacity-50"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">{t("chat.history")}</span>
          </button>
          <button
            type="button"
            onClick={() => void startNew()}
            disabled={loading || loadingHistory}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-primary disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingHistory ? "animate-spin" : ""}`} />
            {t("chat.new")}
          </button>
        </header>

        <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-chip/80 to-white p-4 sm:p-5">
          {loadingHistory ? (
            <div className="flex h-full items-center">
              <Typing />
            </div>
          ) : showWelcome ? (
            <div className="flex justify-start">
              <div className="flex max-w-[92%] flex-col items-start gap-2 sm:max-w-[80%]">
                <div className="rounded-2xl rounded-bl-none border border-primary/10 bg-white px-4 py-3 text-sm leading-relaxed text-foreground shadow-sm">
                  {renderRichText(t("chat.intro"))}
                </div>
                <SuggestionRow items={suggestions} disabled={loading} onPick={(item) => void send(item, articleId)} />
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[88%] flex-col gap-2 sm:max-w-[78%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      message.role === "user"
                        ? "rounded-br-none bg-gradient-to-br from-emerald to-deep text-white"
                        : "rounded-bl-none border border-primary/10 bg-white text-foreground"
                    }`}
                  >
                    {renderRichText(message.content, message.role)}
                  </div>
                  {showChips && message.id === last?.id && (
                    <SuggestionRow
                      items={message.suggestions || []}
                      disabled={loading}
                      onPick={(item) => void send(item, articleId)}
                    />
                  )}
                </div>
              </div>
            ))
          )}
          {isTyping && <Typing />}
        </div>

        <form
          className="chat-form shrink-0 border-t border-border bg-white px-3 pt-2"
          onSubmit={(event) => {
            event.preventDefault();
            void send(input, articleId);
          }}
        >
          <div className="flex items-end gap-2.5">
            <div className="chat-composer flex-1 rounded-2xl border border-border bg-chip/40 px-4 py-1">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send(input, articleId);
                  }
                }}
                placeholder={t("chat.placeholder")}
                className="chat-input max-h-[30vh] min-h-[40px] w-full resize-none border-0 bg-transparent py-1 text-sm outline-none focus:outline-none focus:ring-0"
              />
            </div>
            <button
              type="submit"
              disabled={loading || loadingHistory || !input.trim()}
              aria-label={t("chat.ask_send")}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald to-deep text-white shadow-md transition-opacity disabled:opacity-40"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>

        {historyOpen && (
          <div className="absolute inset-0 z-20 bg-black/25" onClick={() => setHistoryOpen(false)}>
            <div
              className="absolute right-0 top-0 flex h-full w-[min(20rem,88%)] flex-col bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="text-base font-semibold text-deep">{t("chat.history")}</h2>
                <button
                  type="button"
                  onClick={() => setHistoryOpen(false)}
                  aria-label={t("c.back")}
                  className="grid h-8 w-8 place-items-center rounded-full text-deep"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                {historyLoading ? (
                  <div className="py-8">
                    <Typing />
                  </div>
                ) : history.length === 0 ? (
                  <div className="px-2 py-10 text-center text-sm text-muted-foreground">
                    <MessageSquare className="mx-auto mb-3 h-10 w-10 opacity-30" />
                    <p className="font-medium text-deep">{t("chat.history_empty")}</p>
                    <p className="mt-1">{t("chat.history_hint")}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => void openChat(item.id)}
                        className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                          item.id === sessionId
                            ? "border-primary bg-chip text-primary"
                            : "border-border bg-white hover:bg-chip/60"
                        }`}
                      >
                        <p className="truncate text-sm font-semibold">
                          {item.title || t("chat.untitled")}
                        </p>
                        {item.articleTitle && (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.articleTitle}</p>
                        )}
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(item.updatedAt).toLocaleDateString(lang === "sw" ? "sw-TZ" : "en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                          <span aria-hidden="true">·</span>
                          {item.messageCount} {t("chat.messages")}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

const SuggestionRow = ({
  items,
  disabled,
  onPick,
}: {
  items: string[];
  disabled: boolean;
  onPick: (item: string) => void;
}) => (
  <div className="flex flex-wrap gap-2">
    {items.map((item) => (
      <button
        key={item}
        type="button"
        disabled={disabled}
        onClick={() => onPick(item)}
        className="rounded-full border border-primary/30 bg-white px-3 py-1.5 text-left text-xs font-medium text-primary transition-colors hover:bg-chip disabled:opacity-50"
      >
        {item}
      </button>
    ))}
  </div>
);

export default Mshauri;
