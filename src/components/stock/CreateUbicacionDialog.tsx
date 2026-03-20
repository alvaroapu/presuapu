import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useCreateStockUbicacion } from "@/hooks/useStock";
import { useToast } from "@/hooks/use-toast";

export function CreateUbicacionDialog() {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<string>("apartado");
  const [descripcion, setDescripcion] = useState("");
  const createUbicacion = useCreateStockUbicacion();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    try {
      await createUbicacion.mutateAsync({
        nombre: nombre.trim(),
        tipo,
        descripcion: descripcion.trim() || null,
      });
      toast({ title: `${tipo === 'maquina' ? 'Máquina' : 'Apartado'} creado` });
      setNombre("");
      setTipo("apartado");
      setDescripcion("");
      setOpen(false);
    } catch {
      toast({ title: "Error al crear", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Ubicación
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Ubicación</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Impresora Roland, Textil..."
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maquina">Máquina</SelectItem>
                <SelectItem value="apartado">Apartado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Descripción (opcional)</Label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!nombre.trim() || createUbicacion.isPending}>
              {createUbicacion.isPending ? "Creando..." : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
