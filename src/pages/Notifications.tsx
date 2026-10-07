import {
  Banknote,
  BookOpen,
  CheckCheck,
  ClipboardList,
  Heart,
  MessageCircle,
  Megaphone,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@/types";
import { useApp } from "@/context/AppContext";

const icons: Record<NotificationType, LucideIcon> = {
  huduma: ClipboardList,
  ushauri: Stethoscope,
  maoni: MessageCircle,
  penda: Heart,
  mafunzo: BookOpen,
  mikopo: Banknote,
  tangazo: Megaphone,
};

const Notifications = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadCount } =
    useApp();

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader
        title="Taarifa"
        action={
          unreadCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllNotificationsRead}
              className="text-primary"
            >
              <CheckCheck className="mr-1.5 h-4 w-4" /> Soma zote
            </Button>
          ) : null
        }
      />

      <div className="space-y-2">
        {notifications.map((item) => {
          const Icon = icons[item.type];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => markNotificationRead(item.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                item.read
                  ? "border-border/70 bg-card"
                  : "border-primary/30 bg-primary/5"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  item.read ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold leading-tight">{item.title}</p>
                  {!item.read && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{item.body}</p>
                <p className="mt-1 text-xs text-muted-foreground/70">{item.time}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;
