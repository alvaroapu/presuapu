import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";
import { useClientes } from "@/hooks/useClientes";
import { useEmpresaConfig } from "@/hooks/useEmpresaConfig";
import { useCreatePresupuesto, useGenerarNumeroPresupuesto, useCreatePresupuestoLinea, useRecalcularTotales } from "@/hooks/usePresupuestos";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/formatters";
import { ClienteSelector } from "@/components/presupuestos/ClienteSelector";
import { ProductoSelector } from "@/components/presupuestos/ProductoSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Cliente } from "@/hooks/useClientes";

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

export default function PresupuestoNuevo() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: numero } = useGenerarNumeroPresupuesto();
  const { data: config } = useEmpresaConfig();
  const createPresupuesto = useCreatePresupuesto();
  const createLinea = useCreatePresupuestoLinea();
  const recalcular = useRecalcularTotales();

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [lineas, setLineas] = useState<LineaLocal[]>([]);
  const [descuentoTipo, setDescuentoTipo] = useState<'porcentaje' | 'importe'>('porcentaje');
  const [descuentoValor, setDescuentoValor] = useState(0);
  const [ivaPorcentaje, setIvaPorcentaje] = useState(config?.iva_porcentaje || 21);
  const [notas, setNotas] = useState('');
  const [notasInternas, setNotasInternas] = useState('');
  const [showProductoSelector, setShowProductoSelector] = useState(false);
  const [saving, setSaving] = useState(false);

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
    setLineas(lineas.filter(l => l.id !== id));
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
      // Calcular fecha de validez
      const fechaEmision = new Date();
      const fechaValidez = new Date(fechaEmision);
      fechaValidez.setDate(fechaValidez.getDate() + (config?.validez_dias || 30));

      // Crear presupuesto
      const presupuesto = await createPresupuesto.mutateAsync({
        numero: numero!,
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
      });

      // Crear líneas
      for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i];
        await createLinea.mutateAsync({
          presupuesto_id: presupuesto.id,
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

      toast({ title: "Presupuesto creado correctamente" });
      navigate(`/presupuestos/${presupuesto.id}`);
    } catch (error) {
      console.error(error);
      toast({ title: "Error al crear presupuesto", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Nuevo Presupuesto</h1>
            <p className="text-muted-foreground font-mono">{numero || 'Generando...'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button variant="secondary" onClick={() => handleSave(true)} disabled={saving}>
            Guardar Borrador
          </Button>
          <Button onClick={() => handleSave(false)} disabled={saving}>
            Guardar y Enviar
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

      {/* Productos */}
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
            <div className="text-center py-8 text-muted-foreground">
              No hay productos. Añade uno para empezar.
            </div>
          ) : (
            <div className="space-y-2">
              {lineas.map((linea) => (
                <div key={linea.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <div className="flex-1">
                    <p className="font-medium">{linea.producto_nombre}</p>
                    {linea.descripcion && (
                      <p className="text-sm text-muted-foreground">{linea.descripcion}</p>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {linea.cantidad} {linea.tipo_cantidad === 'metros' ? 'm²' : linea.tipo_cantidad === 'horas' ? 'h' : 'uds'}
                  </div>
                  <div className="font-medium w-24 text-right">
                    {formatCurrency(linea.importe)}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveLinea(linea.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totales */}
      <Card>
        <CardHeader>
          <CardTitle>Totales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label className="w-24">Descuento</Label>
                <Input 
                  type="number" 
                  className="w-24"
                  value={descuentoValor} 
                  onChange={e => setDescuentoValor(Number(e.target.value))} 
                />
                <Select value={descuentoTipo} onValueChange={(v: 'porcentaje' | 'importe') => setDescuentoTipo(v)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="porcentaje">%</SelectItem>
                    <SelectItem value="importe">€</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                <Label className="w-24">IVA</Label>
                <Input 
                  type="number" 
                  className="w-24"
                  value={ivaPorcentaje} 
                  onChange={e => setIvaPorcentaje(Number(e.target.value))} 
                />
                <span>%</span>
              </div>
            </div>
            <div className="space-y-2 text-right">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {descuentoImporte > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Descuento{descuentoTipo === 'porcentaje' ? ` (${descuentoValor}%)` : ''}:</span>
                  <span>-{formatCurrency(descuentoImporte)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Base Imponible:</span>
                <span className="font-medium">{formatCurrency(baseImponible)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>IVA ({ivaPorcentaje}%):</span>
                <span>{formatCurrency(ivaImporte)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>TOTAL:</span>
                <span>{formatCurrency(total)}</span>
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
            <Textarea value={notas} onChange={e => setNotas(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Notas internas (no aparecen en PDF)</Label>
            <Textarea value={notasInternas} onChange={e => setNotasInternas(e.target.value)} rows={2} />
          </div>
        </CardContent>
      </Card>

      {/* Product Selector Modal */}
      <ProductoSelector 
        open={showProductoSelector} 
        onClose={() => setShowProductoSelector(false)}
        onAdd={handleAddLinea}
      />
    </div>
  );
}
