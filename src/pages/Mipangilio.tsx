import { useState } from "react";
import { Bell, Globe, Info, Phone, Shield } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Switch } from "@/components/ui/switch";
import { currentUser } from "@/data/user";

const settings = [
  {
    id: "huduma",
    label: "Arifa za ombi la huduma",
    description: "Taarifa za mabadiliko ya ombi lako la huduma",
  },
  {
    id: "ushauri",
    label: "Arifa za ushauri",
    description: "Ujuzi mtakapotumiwa na mtaalamu",
  },
  {
    id: "mafunzo",
    label: "Makala mpya",
    description: "Taarifa makala mpya za Jifunze",
  },
  {
    id: "mikopo",
    label: "Fursa za mikopo",
    description: "Taarifa fursa mpya za mtaji",
  },
] as const;

const Mipangilio = () => {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    huduma: true,
    ushauri: true,
    mafunzo: true,
    mikopo: false,
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="Mipangilio" />

      <section className="rounded-2xl border border-border/70 bg-card">
        <p className="border-b border-border/60 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Arifa
        </p>
        {settings.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3.5 last:border-b-0"
          >
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            <Switch
              checked={enabled[item.id]}
              onCheckedChange={(checked) =>
                setEnabled((prev) => ({ ...prev, [item.id]: checked }))
              }
            />
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-border/70 bg-card">
        <p className="border-b border-border/60 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Ujumuishaji
        </p>
        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3.5">
          <Globe className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Lugha</p>
            <p className="text-xs text-muted-foreground">Kiswahili</p>
          </div>
          <span className="text-xs text-muted-foreground">Lugha ya msingi</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Phone className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Mawasiliano</p>
            <p className="text-xs text-muted-foreground">{currentUser.phone}</p>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <p className="text-sm font-medium">Faragha na Usalama</p>
        </div>
        <div className="flex items-center gap-3">
          <Info className="h-5 w-5 text-primary" />
          <p className="text-sm font-medium">
            AGRIMIKA — mradi wa Mika Venture kwa wakulima wa Tanzania
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-primary" />
          <p className="text-sm font-medium">Toleo la majaribio: 0.1.0</p>
        </div>
      </section>
    </div>
  );
};

export default Mipangilio;
