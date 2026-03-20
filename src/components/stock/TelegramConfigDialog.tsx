import { useState, useEffect } from "react";
import { useTelegramConfig, useSaveTelegramConfig } from "@/hooks/useTelegramConfig";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Bot, Save, ExternalLink } from "lucide-react";

const diasSemana = [
  { value: "1", label: "Lunes" },
  { value: "2", label: "Martes" },
  { value: "3", label: "Miércoles" },
  { value: "4", label: "Jueves" },
  { value: "5", label: "Viernes" },
  { value: "6", label: "Sábado" },
  { value: "0", label: "Domingo" },
];

export function TelegramConfigDialog() {
  const { data: config, isLoading } = useTelegramConfig();
  const saveConfig = useSaveTelegramConfig();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    chat_id: "",
    bot_token: "",
    activo: true,
    dia_resumen: 5,
    hora_resumen: 9,
  });

  useEffect(() => {
    if (config) {
      setForm({
        chat_id: config.chat_id || "",
        bot_token: config.bot_token || "",
        activo: config.activo ?? true,
        dia_resumen: config.dia_resumen ?? 5,
        hora_resumen: config.hora_resumen ?? 9,
      });
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.chat_id || !form.bot_token) return;

    try {
      await saveConfig.mutateAsync({
        id: config?.id,
        ...form,
      });
      toast({ title: "Configuración de Telegram guardada" });
      setOpen(false);
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  };

  const webhookUrl = config
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-bot`
    : "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Bot className="w-4 h-4 mr-2" />
          Telegram Bot
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Configuración Bot Telegram
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Bot Token</Label>
            <Input
              type="password"
              value={form.bot_token}
              onChange={(e) => setForm({ ...form, bot_token: e.target.value })}
              placeholder="123456:ABC-DEF1234ghIkl-..."
            />
            <p className="text-xs text-muted-foreground">
              Crea un bot con @BotFather en Telegram y pega aquí el token.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Chat ID</Label>
            <Input
              value={form.chat_id}
              onChange={(e) => setForm({ ...form, chat_id: e.target.value })}
              placeholder="123456789"
            />
            <p className="text-xs text-muted-foreground">
              Tu ID de Telegram. Envía /start a @userinfobot para obtenerlo.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Label>Bot activo</Label>
            <Switch
              checked={form.activo}
              onCheckedChange={(v) => setForm({ ...form, activo: v })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Día del resumen</Label>
              <Select
                value={String(form.dia_resumen)}
                onValueChange={(v) => setForm({ ...form, dia_resumen: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {diasSemana.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Hora del resumen</Label>
              <Select
                value={String(form.hora_resumen)}
                onValueChange={(v) => setForm({ ...form, hora_resumen: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {String(i).padStart(2, "0")}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {webhookUrl && (
            <div className="space-y-2 rounded-lg border p-3 bg-muted/50">
              <Label className="text-xs font-medium flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                Webhook URL (para Telegram)
              </Label>
              <code className="text-xs block break-all">{webhookUrl}</code>
              <p className="text-xs text-muted-foreground">
                Configura este webhook en Telegram con:
                <br />
                <code className="text-xs">
                  https://api.telegram.org/bot[TOKEN]/setWebhook?url=[URL]
                </code>
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={saveConfig.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {saveConfig.isPending ? "Guardando..." : "Guardar Configuración"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
