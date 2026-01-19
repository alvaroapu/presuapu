import { useEmpresaConfig, useUpdateEmpresaConfig } from "@/hooks/useEmpresaConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function Configuracion() {
  const { data: config, isLoading } = useEmpresaConfig();
  const updateConfig = useUpdateEmpresaConfig();
  const { toast } = useToast();
  
  const [form, setForm] = useState({
    nombre_empresa: '',
    cif: '',
    direccion: '',
    ciudad: '',
    codigo_postal: '',
    telefono: '',
    email: '',
    web: '',
    prefijo_presupuesto: 'PRES',
    iva_porcentaje: 21,
    validez_dias: 30,
    condiciones_pago: '',
    pie_presupuesto: ''
  });

  useEffect(() => {
    if (config) {
      setForm({
        nombre_empresa: config.nombre_empresa || '',
        cif: config.cif || '',
        direccion: config.direccion || '',
        ciudad: config.ciudad || '',
        codigo_postal: config.codigo_postal || '',
        telefono: config.telefono || '',
        email: config.email || '',
        web: config.web || '',
        prefijo_presupuesto: config.prefijo_presupuesto || 'PRES',
        iva_porcentaje: config.iva_porcentaje || 21,
        validez_dias: config.validez_dias || 30,
        condiciones_pago: config.condiciones_pago || '',
        pie_presupuesto: config.pie_presupuesto || ''
      });
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateConfig.mutateAsync({ ...form, id: config?.id });
      toast({ title: "Configuración guardada" });
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Configuración</h1>
        <div className="space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Configuración</h1>
        <Button type="submit" disabled={updateConfig.isPending}>
          {updateConfig.isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Empresa</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Nombre de la empresa</Label>
            <Input value={form.nombre_empresa} onChange={e => setForm({...form, nombre_empresa: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>CIF</Label>
            <Input value={form.cif} onChange={e => setForm({...form, cif: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Dirección</Label>
            <Input value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Ciudad</Label>
            <Input value={form.ciudad} onChange={e => setForm({...form, ciudad: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Código Postal</Label>
            <Input value={form.codigo_postal} onChange={e => setForm({...form, codigo_postal: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Web</Label>
            <Input value={form.web} onChange={e => setForm({...form, web: e.target.value})} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Presupuestos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Prefijo presupuesto</Label>
            <Input value={form.prefijo_presupuesto} onChange={e => setForm({...form, prefijo_presupuesto: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>IVA (%)</Label>
            <Input type="number" value={form.iva_porcentaje} onChange={e => setForm({...form, iva_porcentaje: Number(e.target.value)})} />
          </div>
          <div className="space-y-2">
            <Label>Validez (días)</Label>
            <Input type="number" value={form.validez_dias} onChange={e => setForm({...form, validez_dias: Number(e.target.value)})} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Textos del Presupuesto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Condiciones de pago</Label>
            <Textarea value={form.condiciones_pago} onChange={e => setForm({...form, condiciones_pago: e.target.value})} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Pie del presupuesto</Label>
            <Textarea value={form.pie_presupuesto} onChange={e => setForm({...form, pie_presupuesto: e.target.value})} rows={4} />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
