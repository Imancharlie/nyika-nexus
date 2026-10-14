import { useNavigate } from "react-router-dom";
import {
  Banknote,
  BookOpen,
  CheckCheck,
  ClipboardList,
  Heart,
  LifeBuoy,
  ListOrdered,
  MessageCircle,
  Megaphone,
  Stethoscope,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import QueryState from "@/components/QueryState";
import { Button } from "@/components/ui/button";
import { cn, timeAgo } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import type { AppNotification, NotificationType } from "@/types";
import { useMarkNotificationRead, useNotifications } from "@/hooks/useApi";

const icons: Record<NotificationType, LucideIcon> = {
  huduma: ClipboardList,
  ushauri: Stethoscope,
  maoni: MessageCircle,
  penda: Heart,
  mafunzo: BookOpen,
  mikopo: Banknote,
  tangazo: Megaphone,
  oda: ListOrdered,
  malipo: Wallet,
  msaada: LifeBuoy,
};

const Notifications = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { data: notifications = [], isLoading, isError, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const open = (item: AppNotification) => {
    if (!item.read) markRead.mutate(item.id);
    if (item.link) navigate(item.link);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader
        title={t("notif.title")}
        action={
          unreadCount > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => markRead.mutate("all")} className="text-primary">
              <CheckCheck className="mr-1.5 h-4 w-4" /> {t("notif.read_all")}
            </Button>
          ) : null
        }
      />

      <QueryState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        empty={!notifications.length}
        emptyText={t("notif.none")}
      >
        <div className="space-y-2">
          {notifications.map((item) => {
            const Icon = icons[item.type] ?? Megaphone;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => open(item)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                  item.read ? "border-border/70 bg-card" : "border-primary/30 bg-primary/5",
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    item.read ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold leading-tight">{item.title}</p>
                    {!item.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{item.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">{timeAgo(item.createdAt, lang)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </QueryState>
    </div>
  );
};

export default Notifications;
