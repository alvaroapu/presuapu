import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
import { useEmpresaConfig } from "@/hooks/useEmpresaConfig";
import { 
  useCreatePresupuesto, 
  useUpdatePresupuesto,
  useCreatePresupuestoLinea,
  useDeletePresupuestoLinea,
  useRecalcularTotales
} from "@/hooks/usePresupuestos";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/formatters";
import { ClienteSelector } from "@/components/presupuestos/ClienteSelector";
import { ProductoSelector } from "@/components/presupuestos/ProductoSelector";
import { SortableLineaItem } from "@/components/presupuestos/SortableLineaItem";
import { LineaEditDialog } from "@/components/presupuestos/LineaEditDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Cliente } from "@/hooks/useClientes";
import type { Tables } from "@/integrations/supabase/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

export interface LineaLocal {
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

interface PresupuestoFormProps {
  mode: 'create' | 'edit' | 'duplicate';
  presupuestoId?: string;
  numero: string;
  initialCliente?: Cliente | null;
  initialLineas?: LineaLocal[];
  initialDescuentoTipo?: 'porcentaje' | 'importe';
  initialDescuentoValor?: number;
  initialIvaPorcentaje?: number;
  initialNotas?: string;
  initialNotasInternas?: string;
}

export function PresupuestoForm({
  mode,
  presupuestoId,
  numero,
  initialCliente = null,
  initialLineas = [],
  initialDescuentoTipo = 'porcentaje',
  initialDescuentoValor = 0,
  initialIvaPorcentaje,
  initialNotas = '',
  initialNotasInternas = ''
}: PresupuestoFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: config } = useEmpresaConfig();
  const createPresupuesto = useCreatePresupuesto();
  const updatePresupuesto = useUpdatePresupuesto();
  const createLinea = useCreatePresupuestoLinea();
  const deleteLinea = useDeletePresupuestoLinea();
  const recalcularTotales = useRecalcularTotales();

  const [cliente, setCliente] = useState<Cliente | null>(initialCliente);
  const [lineas, setLineas] = useState<LineaLocal[]>(initialLineas);
  const [descuentoTipo, setDescuentoTipo] = useState<'porcentaje' | 'importe'>(initialDescuentoTipo);
  const [descuentoValor, setDescuentoValor] = useState(initialDescuentoValor);
  const [ivaPorcentaje, setIvaPorcentaje] = useState(initialIvaPorcentaje ?? config?.iva_porcentaje ?? 21);
  const [notas, setNotas] = useState(initialNotas);
  const [notasInternas, setNotasInternas] = useState(initialNotasInternas);
  const [showProductoSelector, setShowProductoSelector] = useState(false);
  const [editingLinea, setEditingLinea] = useState<LineaLocal | null>(null);
  const [saving, setSaving] = useState(false);
  const [lineasToDelete, setLineasToDelete] = useState<string[]>([]);

  // Update IVA when config loads
  useEffect(() => {
    if (config?.iva_porcentaje && initialIvaPorcentaje === undefined) {
      setIvaPorcentaje(config.iva_porcentaje);
    }
  }, [config, initialIvaPorcentaje]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Cálculos
  const subtotal = lineas.reduce((sum, l) => sum + l.importe, 0);
  const descuentoImporte = descuentoTipo === 'porcentaje' 
    ? subtotal * (descuentoValor / 100) 
    : descuentoValor;
  const baseImponible = subtotal - descuentoImporte;
  const ivaImporte = baseImponible * (ivaPorcentaje / 100);
  const total = baseImponible + ivaImporte;

  const handleAddLinea = (linea: LineaLocal) => {
    setLineas([...lineas, { ...linea, id: crypto.randomUUID() }]);
    setShowProductoSelector(false);
  };

  const handleRemoveLinea = (id: string) => {
    // Track existing lines for deletion in edit mode
    const lineaToRemove = lineas.find(l => l.id === id);
    if (mode === 'edit' && lineaToRemove && !id.includes('-')) {
      // Existing lines from DB don't have UUID format, but our local ones do
      setLineasToDelete(prev => [...prev, id]);
    }
    setLineas(lineas.filter(l => l.id !== id));
  };

  const handleEditLinea = (linea: LineaLocal) => {
    setEditingLinea(linea);
  };

  const handleSaveLinea = (updatedLinea: LineaLocal) => {
    setLineas(lineas.map(l => l.id === updatedLinea.id ? updatedLinea : l));
  };

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

  const handleSave = async (asBorrador = true) => {
    if (!cliente) {
      toast({ title: "Selecciona un cliente", variant: "destructive" });
      return;
    }
    if (lineas.length === 0) {
      toast({ title: "Añade al menos un producto", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const fechaEmision = new Date();
      const fechaValidez = new Date(fechaEmision);
      fechaValidez.setDate(fechaValidez.getDate() + (config?.validez_dias || 30));

      const presupuestoData = {
        numero,
        cliente_id: cliente.id,
        cliente_nombre: cliente.nombre,
        cliente_nombre_comercial: cliente.nombre_comercial,
        cliente_documento: cliente.numero_documento,
        cliente_email: cliente.email,
        cliente_telefono: cliente.telefono,
        cliente_direccion: cliente.direccion,
        cliente_ciudad: cliente.ciudad,
        cliente_codigo_postal: cliente.codigo_postal,
        fecha_emision: fechaEmision.toISOString().split('T')[0],
        fecha_validez: fechaValidez.toISOString().split('T')[0],
        subtotal,
        descuento_tipo: descuentoTipo,
        descuento_valor: descuentoValor,
        descuento_importe: descuentoImporte,
        base_imponible: baseImponible,
        iva_porcentaje: ivaPorcentaje,
        iva_importe: ivaImporte,
        total,
        estado: asBorrador ? 'borrador' : 'enviado',
        notas,
        notas_internas: notasInternas
      };

      let savedPresupuestoId: string;

      if (mode === 'edit' && presupuestoId) {
        // Update existing presupuesto
        await updatePresupuesto.mutateAsync({ id: presupuestoId, ...presupuestoData });
        savedPresupuestoId = presupuestoId;

        // Delete removed lines
        for (const lineaId of lineasToDelete) {
          await deleteLinea.mutateAsync({ id: lineaId, presupuesto_id: presupuestoId });
        }

        // Delete all existing lines and recreate (simpler approach for reordering)
        // First get existing line IDs that weren't already deleted
        const existingLineIds = initialLineas
          .filter(l => !lineasToDelete.includes(l.id))
          .map(l => l.id);
        
        for (const lineaId of existingLineIds) {
          await deleteLinea.mutateAsync({ id: lineaId, presupuesto_id: presupuestoId });
        }
      } else {
        // Create new presupuesto
        const created = await createPresupuesto.mutateAsync(presupuestoData);
        savedPresupuestoId = created.id;
      }

      // Create all lines
      for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i];
        await createLinea.mutateAsync({
          presupuesto_id: savedPresupuestoId,
          producto_id: linea.producto_id,
          producto_nombre: linea.producto_nombre,
          producto_categoria: linea.producto_categoria,
          cantidad: linea.cantidad,
          tipo_cantidad: linea.tipo_cantidad,
          descripcion: linea.descripcion || null,
          precio_unitario: linea.precio_unitario,
          importe: linea.importe,
          orden: i
        });
      }

      // Recalcular totales en el servidor
      await recalcularTotales.mutateAsync(savedPresupuestoId);

      const actionText = mode === 'edit' ? 'actualizado' : 'creado';
      toast({ title: `Presupuesto ${actionText} correctamente` });
      navigate(`/presupuestos/${savedPresupuestoId}`);
    } catch (error) {
      console.error(error);
      const actionText = mode === 'edit' ? 'actualizar' : 'crear';
      toast({ title: `Error al ${actionText} presupuesto`, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const title = mode === 'edit' 
    ? 'Editar Presupuesto' 
    : mode === 'duplicate' 
      ? 'Duplicar Presupuesto' 
      : 'Nuevo Presupuesto';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground font-mono">{numero || 'Generando...'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button variant="secondary" onClick={() => handleSave(true)} disabled={saving}>
            Guardar Borrador
          </Button>
          <Button onClick={() => handleSave(false)} disabled={saving}>
            {mode === 'edit' ? 'Guardar Cambios' : 'Guardar y Enviar'}
          </Button>
        </div>
      </div>

      {/* Cliente */}
      <Card>
        <CardHeader>
          <CardTitle>Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <ClienteSelector value={cliente} onChange={setCliente} />
        </CardContent>
      </Card>

      {/* Productos con Drag & Drop */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Productos</CardTitle>
          <Button onClick={() => setShowProductoSelector(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Añadir Producto
          </Button>
        </CardHeader>
        <CardContent>
          {lineas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <p className="text-lg mb-2">No hay productos</p>
              <p className="text-sm">Añade productos para empezar a crear el presupuesto</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext items={lineas} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {lineas.map((linea) => (
                    <SortableLineaItem
                      key={linea.id}
                      linea={linea}
                      onRemove={handleRemoveLinea}
                      onEdit={handleEditLinea}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Totales */}
      <Card>
        <CardHeader>
          <CardTitle>Totales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label className="w-24 flex-shrink-0">Descuento</Label>
                <Input 
                  type="number" 
                  className="w-24"
                  value={descuentoValor} 
                  onChange={e => setDescuentoValor(Number(e.target.value))} 
                />
                <Select value={descuentoTipo} onValueChange={(v: 'porcentaje' | 'importe') => setDescuentoTipo(v)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="porcentaje">%</SelectItem>
                    <SelectItem value="importe">€</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                <Label className="w-24 flex-shrink-0">IVA</Label>
                <Input 
                  type="number" 
                  className="w-24"
                  value={ivaPorcentaje} 
                  onChange={e => setIvaPorcentaje(Number(e.target.value))} 
                />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>
            <div className="space-y-2 bg-muted/30 rounded-lg p-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {descuentoImporte > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Descuento{descuentoTipo === 'porcentaje' ? ` (${descuentoValor}%)` : ''}:</span>
                  <span className="text-destructive">-{formatCurrency(descuentoImporte)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Imponible:</span>
                <span className="font-medium">{formatCurrency(baseImponible)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>IVA ({ivaPorcentaje}%):</span>
                <span>{formatCurrency(ivaImporte)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-3 mt-2">
                <span>TOTAL:</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notas */}
      <Card>
        <CardHeader>
          <CardTitle>Notas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Notas para el cliente (aparecen en PDF)</Label>
            <Textarea 
              value={notas} 
              onChange={e => setNotas(e.target.value)} 
              rows={3}
              placeholder="Incluye montaje en horario laboral. Plazo estimado: 5 días laborables."
            />
          </div>
          <div className="space-y-2">
            <Label>Notas internas (no aparecen en PDF)</Label>
            <Textarea 
              value={notasInternas} 
              onChange={e => setNotasInternas(e.target.value)} 
              rows={2}
              placeholder="Notas privadas para uso interno"
            />
          </div>
        </CardContent>
      </Card>

      {/* Product Selector Modal */}
      <ProductoSelector 
        open={showProductoSelector} 
        onClose={() => setShowProductoSelector(false)}
        onAdd={handleAddLinea}
      />

      {/* Line Edit Dialog */}
      <LineaEditDialog
        open={!!editingLinea}
        linea={editingLinea}
        onClose={() => setEditingLinea(null)}
        onSave={handleSaveLinea}
      />
    </div>
  );
}
