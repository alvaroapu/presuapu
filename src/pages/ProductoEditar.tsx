import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Copy } from "lucide-react";
import { useCategorias } from "@/hooks/useCategorias";
import { useProducto, useUpdateProducto } from "@/hooks/useProductos";
import { useProductoTarifas, useSaveProductoTarifas } from "@/hooks/useProductoTarifas";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { TarifasEditor, type Tarifa } from "@/components/catalogo/TarifasEditor";

export default function ProductoEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: categorias } = useCategorias();
  const { data: producto, isLoading } = useProducto(id);
  const { data: tarifasExistentes } = useProductoTarifas(id);
  const updateProducto = useUpdateProducto();
  const saveTarifas = useSaveProductoTarifas();

  const [form, setForm] = useState({
    categoria_id: '',
    nombre: '',
    codigo: '',
    descripcion: '',
    tipo_calculo: 'por_metro',
    precio_material: 0,
    precio_preparacion: 0,
    precio_montaje: 0,
    precio_base_fijo: 0,
    precio_metro_tarifa_1: 0,
    metros_limite_tarifa_1: 10,
    precio_metro_tarifa_2: 0,
    precio_por_unidad: 0,
    precio_por_hora: 0,
    precio_placa_a3: 0,
    precio_placa_a4: 0,
    activo: true,
    metros_gratis: 0,
    bonificacion_cada_n_metros: 0
  });

  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [usarTarifasVariables, setUsarTarifasVariables] = useState(false);

  useEffect(() => {
    if (producto) {
      setForm({
        categoria_id: producto.categoria_id,
        nombre: producto.nombre,
        codigo: producto.codigo || '',
        descripcion: producto.descripcion || '',
        tipo_calculo: producto.tipo_calculo,
        precio_material: producto.precio_material || 0,
        precio_preparacion: producto.precio_preparacion || 0,
        precio_montaje: producto.precio_montaje || 0,
        precio_base_fijo: producto.precio_base_fijo || 0,
        precio_metro_tarifa_1: producto.precio_metro_tarifa_1 || 0,
        metros_limite_tarifa_1: producto.metros_limite_tarifa_1 || 10,
        precio_metro_tarifa_2: producto.precio_metro_tarifa_2 || 0,
        precio_por_unidad: producto.precio_por_unidad || 0,
        precio_por_hora: producto.precio_por_hora || 0,
        precio_placa_a3: producto.precio_placa_a3 || 0,
        precio_placa_a4: producto.precio_placa_a4 || 0,
        activo: producto.activo ?? true,
        metros_gratis: (producto as any).metros_gratis || 0,
        bonificacion_cada_n_metros: (producto as any).bonificacion_cada_n_metros || 0
      });
    }
  }, [producto]);

  useEffect(() => {
    if (tarifasExistentes) {
      setTarifas(tarifasExistentes.map(t => ({
        id: t.id,
        cantidad_desde: t.cantidad_desde,
        cantidad_hasta: t.cantidad_hasta,
        precio_unitario: t.precio_unitario,
        orden: t.orden
      })));
      setUsarTarifasVariables(tarifasExistentes.length > 0);
    }
  }, [tarifasExistentes]);

  const getUnidad = () => {
    switch (form.tipo_calculo) {
      case 'por_metro': return 'm²';
      case 'por_unidad': return 'uds';
      case 'por_hora': return 'h';
      case 'por_placa': return 'placas';
      default: return 'uds';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await updateProducto.mutateAsync({ id, ...form });
      
      // Guardar tarifas si está habilitado
      if (usarTarifasVariables && tarifas.length > 0) {
        await saveTarifas.mutateAsync({ productoId: id, tarifas });
      } else {
        // Eliminar tarifas existentes si se deshabilita
        await saveTarifas.mutateAsync({ productoId: id, tarifas: [] });
      }
      
      toast({ title: "Producto actualizado" });
      navigate('/catalogo');
    } catch {
      toast({ title: "Error al actualizar producto", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">Editar Producto</h1>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link to={`/catalogo/productos/${id}/duplicar`}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicar
            </Link>
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" size="sm" disabled={updateProducto.isPending || saveTarifas.isPending}>
            {updateProducto.isPending || saveTarifas.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información básica</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Categoría *</Label>
            <Select value={form.categoria_id} onValueChange={v => setForm({...form, categoria_id: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent>
                {categorias?.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Nombre *</Label>
            <Input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Código (opcional)</Label>
            <Input value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Tipo de cálculo *</Label>
            <Select value={form.tipo_calculo} onValueChange={v => setForm({...form, tipo_calculo: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="por_metro">Por metro cuadrado</SelectItem>
                <SelectItem value="por_unidad">Por unidad</SelectItem>
                <SelectItem value="por_hora">Por hora</SelectItem>
                <SelectItem value="por_placa">Por placa (A3/A4)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Descripción</Label>
            <Textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.activo} onCheckedChange={v => setForm({...form, activo: v})} />
            <Label>Producto activo</Label>
          </div>
        </CardContent>
      </Card>

      {/* Opción de tarifas variables */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Modo de precios</CardTitle>
            <div className="flex items-center gap-2">
              <Switch 
                checked={usarTarifasVariables} 
                onCheckedChange={setUsarTarifasVariables} 
              />
              <Label className="text-sm">Usar tarifas por rangos</Label>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {usarTarifasVariables 
              ? "El precio varía según la cantidad pedida (ej: 1-5m a un precio, 6-10m a otro)"
              : "Precio fijo o con dos tarifas simples (modelo tradicional)"
            }
          </p>
        </CardHeader>
      </Card>

      {usarTarifasVariables ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Bonificación</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{getUnidad() === 'm²' ? 'Metros' : getUnidad() === 'h' ? 'Horas' : 'Unidades'} gratis fijos (regalo)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.metros_gratis}
                  onChange={e => setForm({...form, metros_gratis: Number(e.target.value)})}
                />
                <p className="text-xs text-muted-foreground">
                  Cantidad de regalo fija que no se factura (ej: bono promocional)
                </p>
              </div>
              <div className="space-y-2">
                <Label>Bonificación automática (cada N {getUnidad()})</Label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  value={form.bonificacion_cada_n_metros}
                  onChange={e => setForm({...form, bonificacion_cada_n_metros: Number(e.target.value)})}
                />
                <p className="text-xs text-muted-foreground">
                  Por cada N {getUnidad()} comprados, 1 {getUnidad()} gratis automáticamente. 0 = desactivado. Ej: 5 → cada 5 m² comprados = 1 m² gratis
                </p>
              </div>
            </CardContent>
          </Card>
          <TarifasEditor 
            tarifas={tarifas} 
            onChange={setTarifas}
            unidad={getUnidad()}
          />
        </>
      ) : (
        <>
          {form.tipo_calculo === 'por_metro' && (
            <Card>
              <CardHeader>
                <CardTitle>Precios por metro cuadrado</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Precio fijo (arranque)</Label>
                  <Input type="number" step="0.01" value={form.precio_base_fijo} onChange={e => setForm({...form, precio_base_fijo: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Metros gratis fijos (bonificación)</Label>
                  <Input type="number" step="0.1" min="0" value={form.metros_gratis} onChange={e => setForm({...form, metros_gratis: Number(e.target.value)})} />
                  <p className="text-xs text-muted-foreground">Metros de regalo fijos que no se facturan</p>
                </div>
                <div className="space-y-2">
                  <Label>Bonificación automática (cada N m²)</Label>
                  <Input type="number" step="1" min="0" value={form.bonificacion_cada_n_metros} onChange={e => setForm({...form, bonificacion_cada_n_metros: Number(e.target.value)})} />
                  <p className="text-xs text-muted-foreground">Por cada N m² comprados, 1 m² gratis. 0 = desactivado. Ej: 5 → cada 5 m² = 1 m² gratis</p>
                </div>
                <div className="space-y-2">
                  <Label>Límite Tarifa 1 (m²)</Label>
                  <Input type="number" value={form.metros_limite_tarifa_1} onChange={e => setForm({...form, metros_limite_tarifa_1: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Precio/m² Tarifa 1 (≤ límite)</Label>
                  <Input type="number" step="0.01" value={form.precio_metro_tarifa_1} onChange={e => setForm({...form, precio_metro_tarifa_1: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Precio/m² Tarifa 2 (&gt; límite)</Label>
                  <Input type="number" step="0.01" value={form.precio_metro_tarifa_2} onChange={e => setForm({...form, precio_metro_tarifa_2: Number(e.target.value)})} />
                </div>
              </CardContent>
            </Card>
          )}

          {form.tipo_calculo === 'por_unidad' && (
            <Card>
              <CardHeader>
                <CardTitle>Precio por unidad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-w-xs">
                  <Label>Precio por unidad (€)</Label>
                  <Input type="number" step="0.01" value={form.precio_por_unidad} onChange={e => setForm({...form, precio_por_unidad: Number(e.target.value)})} />
                </div>
              </CardContent>
            </Card>
          )}

          {form.tipo_calculo === 'por_hora' && (
            <Card>
              <CardHeader>
                <CardTitle>Precio por hora</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-w-xs">
                  <Label>Precio por hora (€)</Label>
                  <Input type="number" step="0.01" value={form.precio_por_hora} onChange={e => setForm({...form, precio_por_hora: Number(e.target.value)})} />
                </div>
              </CardContent>
            </Card>
          )}

          {form.tipo_calculo === 'por_placa' && (
            <Card>
              <CardHeader>
                <CardTitle>Precios por placa</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Precio placa A4 (€)</Label>
                  <Input type="number" step="0.01" value={form.precio_placa_a4} onChange={e => setForm({...form, precio_placa_a4: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Precio placa A3 (€)</Label>
                  <Input type="number" step="0.01" value={form.precio_placa_a3} onChange={e => setForm({...form, precio_placa_a3: Number(e.target.value)})} />
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Costes informativos (opcional)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Coste material</Label>
            <Input type="number" step="0.01" value={form.precio_material} onChange={e => setForm({...form, precio_material: Number(e.target.value)})} />
          </div>
          <div className="space-y-2">
            <Label>Coste preparación</Label>
            <Input type="number" step="0.01" value={form.precio_preparacion} onChange={e => setForm({...form, precio_preparacion: Number(e.target.value)})} />
          </div>
          <div className="space-y-2">
            <Label>Coste montaje</Label>
            <Input type="number" step="0.01" value={form.precio_montaje} onChange={e => setForm({...form, precio_montaje: Number(e.target.value)})} />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
