import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Copy, FileDown, Receipt } from "lucide-react";
import { usePresupuesto, usePresupuestoLineas, useUpdatePresupuesto } from "@/hooks/usePresupuestos";
import { useEmpresaConfig } from "@/hooks/useEmpresaConfig";
import { formatCurrency, formatDate, getEstadoColor, getEstadoLabel, getTipoUnidad } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PDFDownloadButton } from "@/components/pdf/PDFDownloadButton";
import { useConvertirPresupuestoAFactura } from "@/hooks/useFacturas";

export default function PresupuestoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: presupuesto, isLoading } = usePresupuesto(id);
  const { data: lineas, isLoading: loadingLineas } = usePresupuestoLineas(id);
  const { data: config } = useEmpresaConfig();
  const updatePresupuesto = useUpdatePresupuesto();
  const convertirAFactura = useConvertirPresupuestoAFactura();

  const cambiarEstado = async (estado: string) => {
    if (!id) return;
    try {
      await updatePresupuesto.mutateAsync({ id, estado });
      toast({ title: "Estado actualizado" });
    } catch {
      toast({ title: "Error al actualizar", variant: "destructive" });
    }
  };

  const handleConvertirAFactura = async () => {
    if (!id) return;
    try {
      const factura = await convertirAFactura.mutateAsync({ presupuestoId: id });
      toast({ title: `Factura ${factura.numero} creada correctamente` });
    } catch {
      toast({ title: "Error al crear factura", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!presupuesto) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Presupuesto no encontrado</p>
        <Button variant="link" onClick={() => navigate('/presupuestos')}>
          Volver a presupuestos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Presupuesto {presupuesto.numero}</h1>
            <p className="text-muted-foreground">
              Emitido el {formatDate(presupuesto.fecha_emision)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={presupuesto.estado || 'borrador'} onValueChange={cambiarEstado}>
            <SelectTrigger className={`w-36 ${getEstadoColor(presupuesto.estado || '')}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="borrador">Borrador</SelectItem>
              <SelectItem value="enviado">Enviado</SelectItem>
              <SelectItem value="aceptado">Aceptado</SelectItem>
              <SelectItem value="rechazado">Rechazado</SelectItem>
              <SelectItem value="facturado">Facturado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" asChild>
            <Link to={`/presupuestos/${id}/editar`}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/presupuestos/${id}/duplicar`}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicar
            </Link>
          </Button>
          {config && lineas && (
            <PDFDownloadButton 
              presupuesto={presupuesto} 
              lineas={lineas} 
              config={config}
            />
          )}
          {presupuesto.estado !== 'facturado' && presupuesto.estado !== 'cancelado' && (
            <Button 
              variant="default"
              onClick={handleConvertirAFactura}
              disabled={convertirAFactura.isPending}
            >
              <Receipt className="w-4 h-4 mr-2" />
              {convertirAFactura.isPending ? 'Creando...' : 'Convertir a Factura'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="font-medium">{presupuesto.cliente_nombre}</p>
              {presupuesto.cliente_nombre_comercial && (
                <p className="text-muted-foreground">{presupuesto.cliente_nombre_comercial}</p>
              )}
              {presupuesto.cliente_documento && (
                <p className="text-sm">{presupuesto.cliente_documento}</p>
              )}
              {presupuesto.cliente_direccion && (
                <p className="text-sm text-muted-foreground">
                  {presupuesto.cliente_direccion}, {presupuesto.cliente_codigo_postal} {presupuesto.cliente_ciudad}
                </p>
              )}
              <div className="flex gap-4 text-sm text-muted-foreground pt-2">
                {presupuesto.cliente_telefono && <span>📞 {presupuesto.cliente_telefono}</span>}
                {presupuesto.cliente_email && <span>📧 {presupuesto.cliente_email}</span>}
              </div>
            </CardContent>
          </Card>

          {/* Líneas */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingLineas ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <div className="border rounded-lg">
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 p-3 border-b bg-muted/50 font-medium text-sm">
                    <div>Concepto</div>
                    <div className="text-right">Cantidad</div>
                    <div className="text-right">P. Unit.</div>
                    <div className="text-right">Importe</div>
                  </div>
                  {lineas?.map((linea) => (
                    <div key={linea.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 p-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{linea.producto_nombre}</p>
                        {linea.descripcion && (
                          <p className="text-sm text-muted-foreground">{linea.descripcion}</p>
                        )}
                      </div>
                      <div className="text-right text-muted-foreground">
                        {linea.cantidad} {getTipoUnidad(linea.tipo_cantidad)}
                      </div>
                      <div className="text-right text-muted-foreground">
                        {formatCurrency(linea.precio_unitario)}
                      </div>
                      <div className="text-right font-medium">
                        {formatCurrency(linea.importe)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notas */}
          {presupuesto.notas && (
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{presupuesto.notas}</p>
              </CardContent>
            </Card>
          )}

          {presupuesto.notas_internas && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-muted-foreground">Notas internas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground">{presupuesto.notas_internas}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Totales */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Totales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(presupuesto.subtotal || 0)}</span>
              </div>
              {(presupuesto.descuento_importe || 0) > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>
                    Descuento
                    {presupuesto.descuento_tipo === 'porcentaje' && ` (${presupuesto.descuento_valor}%)`}:
                  </span>
                  <span>-{formatCurrency(presupuesto.descuento_importe || 0)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Base Imponible:</span>
                <span>{formatCurrency(presupuesto.base_imponible || 0)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>IVA ({presupuesto.iva_porcentaje || 21}%):</span>
                <span>{formatCurrency(presupuesto.iva_importe || 0)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-3">
                <span>TOTAL:</span>
                <span>{formatCurrency(presupuesto.total || 0)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha emisión:</span>
                <span>{formatDate(presupuesto.fecha_emision)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Válido hasta:</span>
                <span>{formatDate(presupuesto.fecha_validez)}</span>
              </div>
              {presupuesto.referencia_cliente && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ref. cliente:</span>
                  <span>{presupuesto.referencia_cliente}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
