import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Plus, Users } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import QueryState from "@/components/QueryState";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGroupActions, useGroups } from "@/hooks/useApi";
import { useLanguage } from "@/i18n/LanguageContext";
import { TZ_REGIONS } from "@/lib/regions";
import { cropTypes } from "@/lib/utils";
import type { Group } from "@/types";

export const GroupCard = ({ group }: { group: Group }) => {
  const { t } = useLanguage();
  const { join } = useGroupActions();
  return (
    <article className="overflow-hidden rounded-[24px] border bg-card">
      <Link to={`/vikundi/${group.id}`} className="block">
        <div className="relative h-24 bg-gradient-to-br from-lime via-leaf to-emerald">
          {group.image && <img src={group.image} alt="" className="h-full w-full object-cover opacity-90" loading="lazy" />}
        </div>
      </Link>
      <div className="space-y-2 p-4">
        <Link to={`/vikundi/${group.id}`}>
          <h3 className="font-display text-lg font-bold leading-tight">{group.name}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{group.description}</p>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex">
            {group.memberAvatars.map((src, i) => (
              <img key={i} src={src} alt="" className="-ml-2 h-8 w-8 rounded-full border-[3px] border-card bg-chip first:ml-0" />
            ))}
          </div>
          <p className="flex-1 text-xs text-muted-foreground">
            {group.membersCount} {t("groups.members")} {group.region && `· ${group.region}`}
          </p>
          {group.isMember ? (
            <span className="rounded-full bg-chip px-3 py-1.5 text-xs font-semibold text-emerald">{t("groups.joined")}</span>
          ) : (
            <button
              type="button"
              disabled={join.isPending}
              onClick={() => join.mutate(group.id)}
              className="rounded-full bg-emerald px-3.5 py-1.5 text-xs font-semibold text-white"
            >
              {t("groups.join")}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

const Vikundi = () => {
  const { t } = useLanguage();
  const { data: groups = [], isLoading, isError, refetch } = useGroups();
  const { create } = useGroupActions();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", region: "", crop: "" });

  const mine = groups.filter((g) => g.isMember);
  const others = groups.filter((g) => !g.isMember);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await create.mutateAsync(form);
      setOpen(false);
      setForm({ name: "", description: "", region: "", crop: "" });
    } catch {
      /* the action already shows the message */
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title={t("groups.title")}
        action={
          <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 rounded-full bg-emerald px-3.5 py-2 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" /> {t("groups.create")}
          </button>
        }
      />
      <p className="-mt-3 text-sm text-muted-foreground">{t("groups.sub")}</p>

      <QueryState isLoading={isLoading} isError={isError} onRetry={refetch} empty={!groups.length} emptyText={t("groups.none")}>
        {mine.length > 0 && (
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <Users className="h-5 w-5 text-emerald" /> {t("groups.mine")}
            </h2>
            {mine.map((g) => <GroupCard key={g.id} group={g} />)}
          </section>
        )}
        {others.length > 0 && (
          <section className="mt-5 space-y-3">
            <h2 className="text-base font-bold">{t("groups.discover")}</h2>
            {others.map((g) => <GroupCard key={g.id} group={g} />)}
          </section>
        )}
      </QueryState>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle>{t("groups.create")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("groups.name")} />
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t("groups.description")} />
            <div className="grid grid-cols-2 gap-2">
              <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="h-10 rounded-md border border-input bg-background px-2 text-sm">
                <option value="">{t("auth.region")}</option>
                {TZ_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <select value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} className="h-10 rounded-md border border-input bg-background px-2 text-sm">
                <option value="">{t("groups.crop")}</option>
                {[...cropTypes, "Mifugo"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button type="submit" disabled={create.isPending || !form.name.trim()} className="btn-lime w-full">{t("groups.create")}</button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vikundi;
