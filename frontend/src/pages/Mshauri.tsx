import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { ArrowLeft, Menu, RefreshCw, Send } from "lucide-react";
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
  language: "sw" | "en";
  articleId: string | null;
  articleTitle: string | null;
  messages: ApiMessage[];
};

type ReplyPayload = {
  sessionId: number;
  language: "sw" | "en";
  articleId: string | null;
  articleTitle: string | null;
  userMessage: ApiMessage;
  assistantMessage: ApiMessage;
};

const NUMBERED_RE = /^\s*(\d+)[.)]\s+(.*)$/;
const BULLET_RE = /^\s*[-•*]\s+(.*)$/;

const toMessage = (message: ApiMessage): ChatMessage => ({
  id: String(message.id),
  role: message.role,
  content: message.content,
  suggestions: message.suggestions?.length ? message.suggestions : undefined,
  createdAt: message.createdAt,
});

const renderRichText = (content: string): ReactNode[] => {
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
              <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">{item.text}</span>
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
              <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">{item.text}</span>
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
        {line}
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [articleTitle, setArticleTitle] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
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

  useEffect(() => {
    let ignore = false;
    setLoadingHistory(true);
    api
      .get<SessionPayload>("/advisor/")
      .then((data) => {
        if (ignore) return;
        setMessages(data.messages.map(toMessage));
        setArticleId(data.articleId);
        setArticleTitle(data.articleTitle);
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

  const send = async (text: string, nextArticleId?: string | null) => {
    const trimmed = text.trim();
    if (!trimmed || sending.current) return;
    sending.current = true;
    setLoading(true);
    setIsTyping(true);
    setInput("");
    const localId = `local-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: localId, role: "user", content: trimmed, createdAt: new Date().toISOString() },
    ]);
    textareaRef.current?.focus();
    try {
      const data = await api.post<ReplyPayload>("/advisor/messages/", {
        content: trimmed,
        articleId: nextArticleId || undefined,
        language: langRef.current,
      });
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
    const fromArticle = searchParams.get("article");
    navigate("/mshauri", { replace: true });
    void send(question, fromArticle);
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
    setArticleId(null);
    setArticleTitle(null);
    setGeneration((value) => value + 1);
  };

  const last = messages[messages.length - 1];
  const showChips = Boolean(
    last?.role === "assistant" && !loading && !input.trim() && last.suggestions?.length,
  );

  return (
    <div className="advisor-chat">
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
            {articleId && (
              <Link
                to={`/jifunze/${articleId}`}
                className="block truncate text-xs font-medium text-primary underline decoration-primary/30 underline-offset-2"
              >
                {t("chat.from_article")}: {articleTitle}
              </Link>
            )}
          </div>
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
                    {renderRichText(message.content)}
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
