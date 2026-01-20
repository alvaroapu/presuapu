import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useFactura, useFacturaLineas, useUpdateFactura, useDeleteFacturaLineas, useCreateFacturaLineas } from "@/hooks/useFacturas";
import { formatCurrency, getTipoUnidad } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductoSelector } from "@/components/presupuestos/ProductoSelector";
import { LineaEditDialog } from "@/components/presupuestos/LineaEditDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

function SortableLineaRow({ linea, onEdit, onDelete }: { 
  linea: LineaLocal; 
  onEdit: () => void; 
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: linea.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 p-3 border-b last:border-0 items-center bg-background"
    >
      <button {...attributes} {...listeners} className="cursor-grab p-1 text-muted-foreground hover:text-foreground">
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="min-w-0">
        <p className="font-medium truncate">{linea.producto_nombre}</p>
        {linea.descripcion && (
          <p className="text-sm text-muted-foreground truncate">{linea.descripcion}</p>
        )}
      </div>
      <div className="text-right text-muted-foreground whitespace-nowrap">
        {linea.cantidad} {getTipoUnidad(linea.tipo_cantidad)}
      </div>
      <div className="text-right text-muted-foreground whitespace-nowrap">
        {formatCurrency(linea.precio_unitario)}
      </div>
      <div className="text-right font-medium whitespace-nowrap">
        {formatCurrency(linea.importe)}
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <span className="sr-only">Editar</span>
          ✏️
        </Button>
        <Button variant="ghost" size="icon" onClick={onDelete}>
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export default function FacturaEditar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: factura, isLoading: loadingFactura } = useFactura(id);
  const { data: lineasDB, isLoading: loadingLineas } = useFacturaLineas(id);
  
  const updateFactura = useUpdateFactura();
  const deleteLineas = useDeleteFacturaLineas();
  const createLineas = useCreateFacturaLineas();

  const [lineas, setLineas] = useState<LineaLocal[]>([]);
  const [descuentoTipo, setDescuentoTipo] = useState<'porcentaje' | 'importe'>('porcentaje');
  const [descuentoValor, setDescuentoValor] = useState(0);
  const [ivaPorcentaje, setIvaPorcentaje] = useState(21);
  const [notas, setNotas] = useState('');
  const [notasInternas, setNotasInternas] = useState('');
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [editingLinea, setEditingLinea] = useState<LineaLocal | null>(null);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Initialize from DB
  useEffect(() => {
    if (factura) {
      setDescuentoTipo((factura.descuento_tipo as 'porcentaje' | 'importe') || 'porcentaje');
      setDescuentoValor(factura.descuento_valor || 0);
      setIvaPorcentaje(factura.iva_porcentaje || 21);
      setNotas(factura.notas || '');
      setNotasInternas(factura.notas_internas || '');
    }
  }, [factura]);

  useEffect(() => {
    if (lineasDB) {
      setLineas(lineasDB.map(l => ({
        id: l.id,
        producto_id: l.producto_id,
        producto_nombre: l.producto_nombre,
        producto_categoria: l.producto_categoria || '',
        cantidad: l.cantidad,
        tipo_cantidad: l.tipo_cantidad,
        descripcion: l.descripcion || '',
        precio_unitario: l.precio_unitario,
        importe: l.importe
      })));
    }
  }, [lineasDB]);

  // Calculate totals
  const subtotal = lineas.reduce((acc, l) => acc + l.importe, 0);
  const descuentoImporte = descuentoTipo === 'porcentaje' 
    ? subtotal * (descuentoValor / 100) 
    : descuentoValor;
  const baseImponible = subtotal - descuentoImporte;
  const ivaImporte = baseImponible * (ivaPorcentaje / 100);
  const total = baseImponible + ivaImporte;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLineas((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddLinea = (linea: LineaLocal) => {
    setLineas([...lineas, { ...linea, id: crypto.randomUUID() }]);
    setShowProductSelector(false);
  };

  const handleUpdateLinea = (updated: LineaLocal) => {
    setLineas(lineas.map(l => l.id === updated.id ? updated : l));
    setEditingLinea(null);
  };

  const handleDeleteLinea = (id: string) => {
    setLineas(lineas.filter(l => l.id !== id));
  };

  const handleSave = async () => {
    if (!id || !factura) return;
    
    setSaving(true);
    try {
      // Update factura
      await updateFactura.mutateAsync({
        id,
        subtotal,
        descuento_tipo: descuentoTipo,
        descuento_valor: descuentoValor,
        descuento_importe: descuentoImporte,
        base_imponible: baseImponible,
        iva_porcentaje: ivaPorcentaje,
        iva_importe: ivaImporte,
        total,
        notas,
        notas_internas: notasInternas
      });

      // Delete old lines and insert new ones
      await deleteLineas.mutateAsync(id);
      
      if (lineas.length > 0) {
        await createLineas.mutateAsync(lineas.map((l, i) => ({
          factura_id: id,
          producto_id: l.producto_id,
          producto_nombre: l.producto_nombre,
          producto_categoria: l.producto_categoria,
          cantidad: l.cantidad,
          tipo_cantidad: l.tipo_cantidad,
          descripcion: l.descripcion || null,
          precio_unitario: l.precio_unitario,
          importe: l.importe,
          orden: i
        })));
      }

      toast({ title: "Factura actualizada correctamente" });
      navigate(`/facturas/${id}`);
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loadingFactura || loadingLineas) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!factura) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Factura no encontrada</p>
        <Button asChild variant="link">
          <Link to="/facturas">Volver a Facturas</Link>
        </Button>
      </div>
    );
  }

  // Can't edit if paid or cancelled
  if (factura.estado === 'pagada' || factura.estado === 'anulada') {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se puede editar una factura {factura.estado}</p>
        <Button asChild variant="link">
          <Link to={`/facturas/${id}`}>Volver a la factura</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/facturas/${id}`}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Editar {factura.numero}</h1>
            <p className="text-muted-foreground">{factura.cliente_nombre}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Cliente info (read-only) */}
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{factura.cliente_nombre}</p>
              {factura.cliente_documento && <p>NIF/CIF: {factura.cliente_documento}</p>}
              {factura.cliente_direccion && <p>{factura.cliente_direccion}</p>}
              {factura.cliente_ciudad && (
                <p>{factura.cliente_codigo_postal} {factura.cliente_ciudad}</p>
              )}
            </CardContent>
          </Card>

          {/* Lines */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Conceptos</CardTitle>
              <Button size="sm" onClick={() => setShowProductSelector(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Añadir
              </Button>
            </CardHeader>
            <CardContent>
              {lineas.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay conceptos. Añade productos o servicios.
                </p>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <div className="border rounded-lg">
                    <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 p-3 border-b bg-muted/50 font-medium text-sm">
                      <div></div>
                      <div>Concepto</div>
                      <div className="text-right">Cantidad</div>
                      <div className="text-right">P. Unit.</div>
                      <div className="text-right">Importe</div>
                      <div></div>
                    </div>
                    <SortableContext items={lineas.map(l => l.id)} strategy={verticalListSortingStrategy}>
                      {lineas.map((linea) => (
                        <SortableLineaRow
                          key={linea.id}
                          linea={linea}
                          onEdit={() => setEditingLinea(linea)}
                          onDelete={() => handleDeleteLinea(linea.id)}
                        />
                      ))}
                    </SortableContext>
                  </div>
                </DndContext>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Notas (visibles en el PDF)</Label>
                <Textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={3}
                  placeholder="Observaciones para el cliente..."
                />
              </div>
              <div className="space-y-2">
                <Label>Notas internas</Label>
                <Textarea
                  value={notasInternas}
                  onChange={(e) => setNotasInternas(e.target.value)}
                  rows={2}
                  placeholder="Notas privadas..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Totals sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Totales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="space-y-2">
                <Label>Descuento</Label>
                <div className="flex gap-2">
                  <Select value={descuentoTipo} onValueChange={(v) => setDescuentoTipo(v as 'porcentaje' | 'importe')}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="porcentaje">%</SelectItem>
                      <SelectItem value="importe">€</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={0}
                    value={descuentoValor}
                    onChange={(e) => setDescuentoValor(Number(e.target.value))}
                  />
                </div>
                {descuentoImporte > 0 && (
                  <p className="text-sm text-muted-foreground text-right">
                    -{formatCurrency(descuentoImporte)}
                  </p>
                )}
              </div>

              <div className="flex justify-between">
                <span>Base Imponible:</span>
                <span>{formatCurrency(baseImponible)}</span>
              </div>

              <div className="space-y-2">
                <Label>IVA (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={ivaPorcentaje}
                  onChange={(e) => setIvaPorcentaje(Number(e.target.value))}
                />
                <p className="text-sm text-muted-foreground text-right">
                  {formatCurrency(ivaImporte)}
                </p>
              </div>

              <div className="flex justify-between text-lg font-bold border-t pt-4">
                <span>TOTAL:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ProductoSelector
        open={showProductSelector}
        onClose={() => setShowProductSelector(false)}
        onAdd={handleAddLinea}
      />

      {editingLinea && (
        <LineaEditDialog
          linea={editingLinea}
          open={!!editingLinea}
          onClose={() => setEditingLinea(null)}
          onSave={handleUpdateLinea}
        />
      )}
    </div>
  );
}
