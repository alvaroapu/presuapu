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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateStockUbicacion, useDeleteStockUbicacion, type StockUbicacion } from "@/hooks/useStock";
import { useToast } from "@/hooks/use-toast";

interface Props {
  ubicacion: StockUbicacion;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUbicacionDialog({ ubicacion, open, onOpenChange }: Props) {
  const [nombre, setNombre] = useState(ubicacion.nombre);
  const [tipo, setTipo] = useState(ubicacion.tipo);
  const [descripcion, setDescripcion] = useState(ubicacion.descripcion || "");
  const updateUbicacion = useUpdateStockUbicacion();
  const deleteUbicacion = useDeleteStockUbicacion();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    try {
      await updateUbicacion.mutateAsync({
        id: ubicacion.id,
        nombre: nombre.trim(),
        tipo,
        descripcion: descripcion.trim() || null,
      });
      toast({ title: "Ubicación actualizada" });
      onOpenChange(false);
    } catch {
      toast({ title: "Error al actualizar", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar esta ubicación y todos sus productos de stock?")) return;
    try {
      await deleteUbicacion.mutateAsync(ubicacion.id);
      toast({ title: "Ubicación eliminada" });
      onOpenChange(false);
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Ubicación</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
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
          <div className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteUbicacion.isPending}
            >
              Eliminar
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!nombre.trim() || updateUbicacion.isPending}>
                {updateUbicacion.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
