import { useState, type FormEvent, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { EyeOff, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { adminApi, fmtDate, linesToList, listToLines, useAdminList, useAdminMutation } from "../lib";
import { Btn, Field, inputClass, PageTitle, Pill, SearchBox, Table, Td } from "../ui";
import { cn } from "@/lib/utils";
import type { Expert, Group, LearningArticle, LearningCategory, Loan } from "@/types";

const Editor = ({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: ReactNode }) => (
  <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl">
      <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
);

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);

// ---------- articles ----------
const sectionsToText = (sections: { title: string; body: string }[]) => sections.map((s) => `## ${s.title}\n${s.body}`).join("\n\n");
const textToSections = (text: string) =>
  text.split(/^## /m).map((chunk) => chunk.trim()).filter(Boolean).map((chunk) => {
    const [title, ...rest] = chunk.split("\n");
    return { title: title.trim(), body: rest.join("\n").trim() };
  });

type ArticleDraft = { isNew: boolean; id: string; title: string; categoryId: string; description: string; readTime: number; imageUrl: string; author: string; sections: string; actions: string; expertTip: string };

const ArticleForm = ({ draft, categories, onDone }: { draft: ArticleDraft; categories: LearningCategory[]; onDone: () => void }) => {
  const [f, setF] = useState(draft);
  const save = useAdminMutation(async (d: ArticleDraft) => {
    const body = {
      id: d.id || slugify(d.title), title: d.title, categoryId: d.categoryId, description: d.description, readTime: Number(d.readTime),
      imageUrl: d.imageUrl, author: d.author, sections: textToSections(d.sections), actions: linesToList(d.actions), expertTip: d.expertTip,
    };
    return d.isNew ? adminApi.post("/admin/articles/", body) : adminApi.patch(`/admin/articles/${d.id}/`, body);
  }, draft.isNew ? "Article published — farmers were notified" : "Article saved");
  const set = (k: keyof ArticleDraft) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const submit = async (e: FormEvent) => { e.preventDefault(); await save.mutateAsync(f); onDone(); };
  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Title"><input required className={inputClass} value={f.title} onChange={set("title")} /></Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Category">
          <select className={inputClass} value={f.categoryId} onChange={set("categoryId")}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
          </select>
        </Field>
        <Field label="Author"><input required className={inputClass} value={f.author} onChange={set("author")} /></Field>
        <Field label="Read time (min)"><input type="number" min={1} className={inputClass} value={f.readTime} onChange={set("readTime")} /></Field>
      </div>
      <Field label="Short description"><textarea required rows={2} className={inputClass} value={f.description} onChange={set("description")} /></Field>
      <Field label="Image link"><input className={inputClass} value={f.imageUrl} onChange={set("imageUrl")} placeholder="https://…" /></Field>
      <Field label="Sections" hint='Start each section with "## Section title" on its own line, then the text.'>
        <textarea rows={10} className={cn(inputClass, "font-mono text-xs")} value={f.sections} onChange={set("sections")} placeholder={"## Utangulizi\nMaelezo...\n\n## Hatua ya kwanza\nMaelezo..."} />
      </Field>
      <Field label="Action steps" hint="One per line"><textarea rows={4} className={inputClass} value={f.actions} onChange={set("actions")} /></Field>
      <Field label="Expert tip"><textarea rows={2} className={inputClass} value={f.expertTip} onChange={set("expertTip")} /></Field>
      <Btn type="submit" disabled={save.isPending} className="w-full">{f.isNew ? "Publish article" : "Save article"}</Btn>
    </form>
  );
};

const ArticlesTab = () => {
  const { data, isLoading } = useAdminList<LearningArticle>("/admin/articles/");
  const { data: cats } = useAdminList<LearningCategory>("/admin/categories/");
  const [editing, setEditing] = useState<ArticleDraft | null>(null);
  const remove = useAdminMutation((id: string) => adminApi.delete(`/admin/articles/${id}/`), "Article deleted");
  const categories = cats?.results ?? [];
  const blank = (): ArticleDraft => ({ isNew: true, id: "", title: "", categoryId: categories[0]?.id ?? "", description: "", readTime: 5, imageUrl: "", author: "", sections: "", actions: "", expertTip: "" });
  return (
    <>
      <div className="mb-4 flex justify-end"><Btn onClick={() => setEditing(blank())}><Plus className="h-4 w-4" /> New article</Btn></div>
      <Table head={["Article", "Category", "Author", ""]} loading={isLoading} empty={!data?.results.length}>
        {data?.results.map((a) => (
          <tr key={a.id} className="hover:bg-chip/30">
            <Td><p className="font-semibold">{a.title}</p><p className="line-clamp-1 text-xs text-muted-foreground">{a.description}</p></Td>
            <Td>{categories.find((c) => c.id === a.categoryId)?.name ?? a.categoryId}</Td>
            <Td>{a.author}</Td>
            <Td>
              <div className="flex gap-1">
                <Btn variant="ghost" onClick={() => setEditing({ isNew: false, id: a.id, title: a.title, categoryId: a.categoryId, description: a.description, readTime: a.readTime, imageUrl: a.image ?? "", author: a.author, sections: sectionsToText(a.sections), actions: listToLines(a.actions), expertTip: a.expertTip ?? "" })}><Pencil className="h-4 w-4" /></Btn>
                <Btn variant="ghost" onClick={() => confirm(`Delete "${a.title}"?`) && remove.mutate(a.id)}><Trash2 className="h-4 w-4" /></Btn>
              </div>
            </Td>
          </tr>
        ))}
      </Table>
      <Editor title={editing?.isNew ? "New article" : "Edit article"} open={!!editing} onClose={() => setEditing(null)}>
        {editing && <ArticleForm draft={editing} categories={categories} onDone={() => setEditing(null)} />}
      </Editor>
    </>
  );
};

// ---------- experts ----------
type ExpertDraft = Omit<Expert, "specialties" | "avatar"> & { specialties: string; isNew: boolean };

const ExpertForm = ({ draft, onDone }: { draft: ExpertDraft; onDone: () => void }) => {
  const [f, setF] = useState(draft);
  const save = useAdminMutation(async (d: ExpertDraft) => {
    const { isNew, ...rest } = d;
    const body = { ...rest, id: d.id || slugify(d.name), specialties: linesToList(d.specialties) };
    return isNew ? adminApi.post("/admin/experts/", body) : adminApi.patch(`/admin/experts/${d.id}/`, body);
  }, "Expert saved");
  const set = (k: keyof ExpertDraft) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const submit = async (e: FormEvent) => { e.preventDefault(); await save.mutateAsync(f); onDone(); };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name"><input required className={inputClass} value={f.name} onChange={set("name")} /></Field>
        <Field label="Title"><input required className={inputClass} value={f.title} onChange={set("title")} /></Field>
        <Field label="Experience"><input required className={inputClass} value={f.experience} onChange={set("experience")} placeholder="Miaka 8" /></Field>
        <Field label="Location"><input required className={inputClass} value={f.location} onChange={set("location")} /></Field>
        <Field label="Availability"><input required className={inputClass} value={f.availability} onChange={set("availability")} /></Field>
        <Field label="Phone"><input required className={inputClass} value={f.phone} onChange={set("phone")} /></Field>
      </div>
      <Field label="Specialties" hint="One per line"><textarea rows={3} className={inputClass} value={f.specialties} onChange={set("specialties")} /></Field>
      <Field label="Bio"><textarea required rows={3} className={inputClass} value={f.bio} onChange={set("bio")} /></Field>
      <Btn type="submit" disabled={save.isPending} className="w-full">Save expert</Btn>
    </form>
  );
};

const ExpertsTab = () => {
  const { data, isLoading } = useAdminList<Expert>("/admin/experts/");
  const [editing, setEditing] = useState<ExpertDraft | null>(null);
  const remove = useAdminMutation((id: string) => adminApi.delete(`/admin/experts/${id}/`), "Expert removed");
  return (
    <>
      <div className="mb-4 flex justify-end">
        <Btn onClick={() => setEditing({ isNew: true, id: "", name: "", title: "", specialties: "", experience: "", location: "", availability: "", phone: "", bio: "" })}><Plus className="h-4 w-4" /> New expert</Btn>
      </div>
      <Table head={["Expert", "Location", "Phone", ""]} loading={isLoading} empty={!data?.results.length}>
        {data?.results.map((x) => (
          <tr key={x.id} className="hover:bg-chip/30">
            <Td><div className="flex items-center gap-3"><img src={x.avatar} alt="" className="h-9 w-9 rounded-full bg-chip" /><div><p className="font-semibold">{x.name}</p><p className="text-xs text-muted-foreground">{x.title}</p></div></div></Td>
            <Td>{x.location}</Td>
            <Td>{x.phone}</Td>
            <Td>
              <div className="flex gap-1">
                <Btn variant="ghost" onClick={() => setEditing({ ...x, specialties: listToLines(x.specialties), isNew: false })}><Pencil className="h-4 w-4" /></Btn>
                <Btn variant="ghost" onClick={() => confirm(`Remove ${x.name}?`) && remove.mutate(x.id)}><Trash2 className="h-4 w-4" /></Btn>
              </div>
            </Td>
          </tr>
        ))}
      </Table>
      <Editor title={editing?.isNew ? "New expert" : "Edit expert"} open={!!editing} onClose={() => setEditing(null)}>
        {editing && <ExpertForm draft={editing} onDone={() => setEditing(null)} />}
      </Editor>
    </>
  );
};

// ---------- loans ----------
type LoanDraft = Omit<Loan, "requirements"> & { requirements: string; isNew: boolean };

const LoanForm = ({ draft, onDone }: { draft: LoanDraft; onDone: () => void }) => {
  const [f, setF] = useState(draft);
  const save = useAdminMutation(async (d: LoanDraft) => {
    const { isNew, ...rest } = d;
    const body = { ...rest, id: d.id || slugify(`${d.institution}-${d.loanType}`), requirements: linesToList(d.requirements) };
    return isNew ? adminApi.post("/admin/loans/", body) : adminApi.patch(`/admin/loans/${d.id}/`, body);
  }, "Loan saved");
  const set = (k: keyof LoanDraft) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const submit = async (e: FormEvent) => { e.preventDefault(); await save.mutateAsync(f); onDone(); };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Institution"><input required className={inputClass} value={f.institution} onChange={set("institution")} /></Field>
        <Field label="Loan type"><input required className={inputClass} value={f.loanType} onChange={set("loanType")} /></Field>
        <Field label="Amount"><input required className={inputClass} value={f.amount} onChange={set("amount")} placeholder="TZS 500,000 – 5,000,000" /></Field>
        <Field label="Repayment"><input required className={inputClass} value={f.repayment} onChange={set("repayment")} /></Field>
      </div>
      <Field label="Requirements" hint="One per line"><textarea rows={3} className={inputClass} value={f.requirements} onChange={set("requirements")} /></Field>
      <Field label="How to apply"><textarea required rows={3} className={inputClass} value={f.howToApply} onChange={set("howToApply")} /></Field>
      <Field label="Button">
        <select className={inputClass} value={f.cta} onChange={set("cta")}><option value="omba">Omba (apply)</option><option value="jifunze">Jifunze (learn more)</option></select>
      </Field>
      <Btn type="submit" disabled={save.isPending} className="w-full">Save loan</Btn>
    </form>
  );
};

const LoansTab = () => {
  const { data, isLoading } = useAdminList<Loan>("/admin/loans/");
  const [editing, setEditing] = useState<LoanDraft | null>(null);
  const remove = useAdminMutation((id: string) => adminApi.delete(`/admin/loans/${id}/`), "Loan removed");
  return (
    <>
      <div className="mb-4 flex justify-end">
        <Btn onClick={() => setEditing({ isNew: true, id: "", institution: "", loanType: "", amount: "", requirements: "", repayment: "", howToApply: "", cta: "omba" })}><Plus className="h-4 w-4" /> New loan</Btn>
      </div>
      <Table head={["Institution", "Type", "Amount", ""]} loading={isLoading} empty={!data?.results.length}>
        {data?.results.map((l) => (
          <tr key={l.id} className="hover:bg-chip/30">
            <Td className="font-semibold">{l.institution}</Td>
            <Td>{l.loanType}</Td>
            <Td>{l.amount}</Td>
            <Td>
              <div className="flex gap-1">
                <Btn variant="ghost" onClick={() => setEditing({ ...l, requirements: listToLines(l.requirements), isNew: false })}><Pencil className="h-4 w-4" /></Btn>
                <Btn variant="ghost" onClick={() => confirm(`Remove ${l.institution}?`) && remove.mutate(l.id)}><Trash2 className="h-4 w-4" /></Btn>
              </div>
            </Td>
          </tr>
        ))}
      </Table>
      <Editor title={editing?.isNew ? "New loan" : "Edit loan"} open={!!editing} onClose={() => setEditing(null)}>
        {editing && <LoanForm draft={editing} onDone={() => setEditing(null)} />}
      </Editor>
    </>
  );
};

// ---------- groups ----------
const GroupsTab = () => {
  const { data, isLoading } = useAdminList<Group>("/admin/groups/");
  const update = useAdminMutation(({ id, active }: { id: number; active: boolean }) => adminApi.patch(`/admin/groups/${id}/`, { active }), "Group updated");
  const remove = useAdminMutation((id: number) => adminApi.delete(`/admin/groups/${id}/`), "Group deleted");
  return (
    <Table head={["Group", "Region", "Members", "Visible", ""]} loading={isLoading} empty={!data?.results.length}>
      {data?.results.map((g) => (
        <tr key={g.id} className="hover:bg-chip/30">
          <Td><p className="font-semibold">{g.name}</p><p className="line-clamp-1 text-xs text-muted-foreground">{g.description}</p></Td>
          <Td>{g.region || "—"}</Td>
          <Td className="tabular-nums">{g.membersCount}</Td>
          <Td><Switch checked={g.active} onCheckedChange={(v) => update.mutate({ id: g.id, active: v })} /></Td>
          <Td><Btn variant="ghost" onClick={() => confirm(`Delete ${g.name} and all its posts?`) && remove.mutate(g.id)}><Trash2 className="h-4 w-4" /></Btn></Td>
        </tr>
      ))}
    </Table>
  );
};

// ---------- posts ----------
type AdminPost = { id: number; author: { name: string; phone: string }; text: string; hidden: boolean; likes: number; commentsCount: number; groupName: string | null; createdAt: string };

const PostsTab = () => {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminList<AdminPost>("/admin/posts/", { search });
  const update = useAdminMutation(({ id, hidden }: { id: number; hidden: boolean }) => adminApi.patch(`/admin/posts/${id}/`, { hidden }), "Post updated");
  const remove = useAdminMutation((id: number) => adminApi.delete(`/admin/posts/${id}/`), "Post deleted");
  return (
    <>
      <div className="mb-4"><SearchBox value={search} onChange={setSearch} placeholder="Search post text or author" /></div>
      <Table head={["Post", "Author", "Engagement", "Posted", ""]} loading={isLoading} empty={!data?.results.length}>
        {data?.results.map((p) => (
          <tr key={p.id} className={cn("hover:bg-chip/30", p.hidden && "opacity-60")}>
            <Td className="max-w-md">
              <p className="line-clamp-2">{p.text}</p>
              <div className="mt-1 flex gap-1">{p.groupName && <Pill tone="blue">{p.groupName}</Pill>}{p.hidden && <Pill tone="red">hidden</Pill>}</div>
            </Td>
            <Td>{p.author.name}</Td>
            <Td className="whitespace-nowrap text-muted-foreground">❤ {p.likes} · 💬 {p.commentsCount}</Td>
            <Td className="whitespace-nowrap text-muted-foreground">{fmtDate(p.createdAt)}</Td>
            <Td>
              <div className="flex gap-1">
                <Btn variant="ghost" onClick={() => update.mutate({ id: p.id, hidden: !p.hidden })}>{p.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</Btn>
                <Btn variant="ghost" onClick={() => confirm("Delete this post?") && remove.mutate(p.id)}><Trash2 className="h-4 w-4" /></Btn>
              </div>
            </Td>
          </tr>
        ))}
      </Table>
    </>
  );
};

const TABS = [
  { id: "articles", label: "Learning articles", el: <ArticlesTab /> },
  { id: "experts", label: "Experts", el: <ExpertsTab /> },
  { id: "loans", label: "Loans", el: <LoansTab /> },
  { id: "groups", label: "Groups", el: <GroupsTab /> },
  { id: "posts", label: "Community posts", el: <PostsTab /> },
];

const Content = () => {
  const [params, setParams] = useSearchParams();
  const tab = TABS.find((t) => t.id === params.get("tab")) ?? TABS[0];
  return (
    <div>
      <PageTitle title="Content" subtitle="Everything farmers read in the app." />
      <div className="no-scrollbar mb-5 flex gap-1 overflow-x-auto rounded-full border bg-card p-1">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setParams({ tab: t.id })}
            className={cn("shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold", tab.id === t.id ? "bg-forest text-white" : "text-muted-foreground")}>
            {t.label}
          </button>
        ))}
      </div>
      {tab.el}
    </div>
  );
};

export default Content;
