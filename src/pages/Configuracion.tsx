import { useEmpresaConfig, useUpdateEmpresaConfig } from "@/hooks/useEmpresaConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Building2, FileText, Receipt } from "lucide-react";

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
    pie_presupuesto: '',
    // Invoice fields
    prefijo_factura: 'FAC',
    texto_factura_cabecera: '',
    texto_factura_pie: '',
    cuenta_bancaria: '',
    iban: ''
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
        pie_presupuesto: config.pie_presupuesto || '',
        // Invoice fields
        prefijo_factura: (config as any).prefijo_factura || 'FAC',
        texto_factura_cabecera: (config as any).texto_factura_cabecera || '',
        texto_factura_pie: (config as any).texto_factura_pie || '',
        cuenta_bancaria: (config as any).cuenta_bancaria || '',
        iban: (config as any).iban || ''
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

      <Tabs defaultValue="empresa" className="space-y-6">
        <TabsList>
          <TabsTrigger value="empresa" className="gap-2">
            <Building2 className="w-4 h-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="presupuestos" className="gap-2">
            <FileText className="w-4 h-4" />
            Presupuestos
          </TabsTrigger>
          <TabsTrigger value="facturas" className="gap-2">
            <Receipt className="w-4 h-4" />
            Facturas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="empresa" className="space-y-6">
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
              <CardTitle>Datos Bancarios</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>IBAN</Label>
                <Input 
                  value={form.iban} 
                  onChange={e => setForm({...form, iban: e.target.value})} 
                  placeholder="ES00 0000 0000 0000 0000 0000"
                />
              </div>
              <div className="space-y-2">
                <Label>Cuenta Bancaria / Banco</Label>
                <Input 
                  value={form.cuenta_bancaria} 
                  onChange={e => setForm({...form, cuenta_bancaria: e.target.value})} 
                  placeholder="Nombre del banco o referencia"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presupuestos" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="facturas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Facturas</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Prefijo factura</Label>
                <Input 
                  value={form.prefijo_factura} 
                  onChange={e => setForm({...form, prefijo_factura: e.target.value})} 
                  placeholder="FAC"
                />
              </div>
              <div className="space-y-2">
                <Label>IVA por defecto (%)</Label>
                <Input 
                  type="number" 
                  value={form.iva_porcentaje} 
                  onChange={e => setForm({...form, iva_porcentaje: Number(e.target.value)})} 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Textos de la Factura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Texto de cabecera</Label>
                <Textarea 
                  value={form.texto_factura_cabecera} 
                  onChange={e => setForm({...form, texto_factura_cabecera: e.target.value})} 
                  rows={2}
                  placeholder="Texto que aparece en la cabecera de las facturas"
                />
              </div>
              <div className="space-y-2">
                <Label>Texto de pie / Condiciones</Label>
                <Textarea 
                  value={form.texto_factura_pie} 
                  onChange={e => setForm({...form, texto_factura_pie: e.target.value})} 
                  rows={4}
                  placeholder="Forma de pago: Transferencia bancaria a la cuenta indicada en un plazo de 30 días."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}