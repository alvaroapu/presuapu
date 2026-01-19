import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useCategorias } from "@/hooks/useCategorias";
import { useCreateProducto } from "@/hooks/useProductos";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProductoNuevo() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: categorias } = useCategorias();
  const createProducto = useCreateProducto();

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
    precio_placa_a4: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoria_id || !form.nombre) {
      toast({ title: "Completa los campos obligatorios", variant: "destructive" });
      return;
    }

    try {
      await createProducto.mutateAsync(form);
      toast({ title: "Producto creado" });
      navigate('/catalogo');
    } catch {
      toast({ title: "Error al crear producto", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Nuevo Producto</h1>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" disabled={createProducto.isPending}>
            {createProducto.isPending ? 'Guardando...' : 'Guardar'}
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
        </CardContent>
      </Card>

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
