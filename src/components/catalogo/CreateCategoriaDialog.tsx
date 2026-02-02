import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCategoria } from "@/hooks/useCategorias";
import { useToast } from "@/hooks/use-toast";
import { FolderPlus } from "lucide-react";

export function CreateCategoriaDialog() {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const createCategoria = useCreateCategoria();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast({ title: "El nombre es obligatorio", variant: "destructive" });
      return;
    }

    try {
      await createCategoria.mutateAsync({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
      });
      toast({ title: "Categoría creada" });
      setNombre("");
      setDescripcion("");
      setOpen(false);
    } catch (error) {
      toast({ 
        title: "Error al crear categoría", 
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive" 
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FolderPlus className="w-4 h-4 mr-2" />
          Nueva Categoría
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Categoría</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre de la categoría"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción de la categoría"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createCategoria.isPending}>
              {createCategoria.isPending ? "Creando..." : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
