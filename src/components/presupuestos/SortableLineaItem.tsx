import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface LineaLocal {
  id: string;
  producto_id: string | null;
  producto_nombre: string;
  producto_categoria: string;
  cantidad: number;
  tipo_cantidad: string;
  descripcion: string;
  precio_unitario: number;
  importe: number;
}

interface SortableLineaItemProps {
  linea: LineaLocal;
  onRemove: (id: string) => void;
}

export function SortableLineaItem({ linea, onRemove }: SortableLineaItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: linea.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getUnidadLabel = (tipo: string) => {
    switch (tipo) {
      case 'metros': return 'm²';
      case 'horas': return 'h';
      case 'unidades': return 'uds';
      default: return tipo.includes('placa') ? 'placas' : tipo;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-4 p-4 border rounded-lg bg-card transition-shadow",
        isDragging && "shadow-lg opacity-90 ring-2 ring-primary/20"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
        type="button"
      >
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </button>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{linea.producto_nombre}</p>
        {linea.descripcion && (
          <p className="text-sm text-muted-foreground truncate">{linea.descripcion}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {linea.producto_categoria}
        </p>
      </div>
      
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        {linea.cantidad} {getUnidadLabel(linea.tipo_cantidad)}
      </div>
      
      <div className="font-medium w-24 text-right whitespace-nowrap">
        {formatCurrency(linea.importe)}
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => onRemove(linea.id)}
        className="flex-shrink-0"
        type="button"
      >
        <Trash2 className="w-4 h-4 text-destructive" />
      </Button>
    </div>
  );
}
