import { useParams, Link } from "react-router-dom";
import { useFactura, useFacturaLineas, useUpdateFactura } from "@/hooks/useFacturas";
import { useEmpresaConfig } from "@/hooks/useEmpresaConfig";
import { formatCurrency, formatDate, getTipoUnidad, getEstadoFacturaColor, getEstadoFacturaLabel } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, CheckCircle, XCircle, Clock, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PDFDownloadButton } from "@/components/pdf/PDFDownloadButton";
import { FacturaPDF } from "@/components/pdf/FacturaPDF";

export default function FacturaDetalle() {
  const { id } = useParams<{ id: string }>();
  const { data: factura, isLoading: loadingFactura } = useFactura(id);
  const { data: lineas, isLoading: loadingLineas } = useFacturaLineas(id);
  const { data: config, isLoading: loadingConfig } = useEmpresaConfig();
  const updateFactura = useUpdateFactura();
  const { toast } = useToast();

  if (loadingFactura || loadingLineas || loadingConfig) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!factura || !config) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Factura no encontrada</p>
        <Button asChild variant="link">
          <Link to="/facturas">Volver a Facturas</Link>
        </Button>
      </div>
    );
  }

  const handleEstadoChange = async (estado: string) => {
    try {
      await updateFactura.mutateAsync({ 
        id: factura.id, 
        estado,
        ...(estado === 'pagada' && { fecha_pago: new Date().toISOString().split('T')[0] })
      });
      toast({ title: `Estado actualizado a ${estado}` });
    } catch {
      toast({ title: "Error al actualizar", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/facturas">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{factura.numero}</h1>
            <p className="text-muted-foreground">{factura.cliente_nombre}</p>
          </div>
          <Badge variant="outline" className={getEstadoFacturaColor(factura.estado || '')}>
            {getEstadoFacturaLabel(factura.estado || '')}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {(factura.estado === 'emitida' || factura.estado === 'vencida') && (
            <Button variant="outline" asChild>
              <Link to={`/facturas/${id}/editar`}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Link>
            </Button>
          )}
          {factura.estado === 'emitida' && (
            <>
              <Button
                variant="outline"
                onClick={() => handleEstadoChange('pagada')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Marcar Pagada
              </Button>
              <Button
                variant="outline"
                onClick={() => handleEstadoChange('vencida')}
              >
                <Clock className="w-4 h-4 mr-2" />
                Marcar Vencida
              </Button>
            </>
          )}
          {factura.estado !== 'anulada' && (
            <Button
              variant="outline"
              onClick={() => handleEstadoChange('anulada')}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Anular
            </Button>
          )}
          <PDFDownloadButton
            document={<FacturaPDF factura={factura as any} lineas={lineas || []} config={config} />}
            fileName={`${factura.numero}.pdf`}
          />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{factura.cliente_nombre}</p>
            {factura.cliente_nombre_comercial && (
              <p className="text-muted-foreground">{factura.cliente_nombre_comercial}</p>
            )}
            {factura.cliente_documento && <p>{factura.cliente_documento}</p>}
            {factura.cliente_direccion && <p>{factura.cliente_direccion}</p>}
            {factura.cliente_ciudad && (
              <p>
                {factura.cliente_codigo_postal} {factura.cliente_ciudad}
              </p>
            )}
            {factura.cliente_email && <p>{factura.cliente_email}</p>}
            {factura.cliente_telefono && <p>Tel: {factura.cliente_telefono}</p>}
          </CardContent>
        </Card>

        {/* Factura Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información de la Factura</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Fecha de emisión</p>
              <p className="font-medium">{formatDate(factura.fecha_emision)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fecha de vencimiento</p>
              <p className="font-medium">{formatDate(factura.fecha_vencimiento)}</p>
            </div>
            {factura.fecha_pago && (
              <div>
                <p className="text-muted-foreground">Fecha de pago</p>
                <p className="font-medium">{formatDate(factura.fecha_pago)}</p>
              </div>
            )}
            {factura.presupuesto_id && (
              <div>
                <p className="text-muted-foreground">Presupuesto origen</p>
                <Link 
                  to={`/presupuestos/${factura.presupuesto_id}`}
                  className="font-medium text-primary hover:underline"
                >
                  Ver presupuesto
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lines Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conceptos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Concepto</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-right">Importe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineas?.map((linea) => (
                <TableRow key={linea.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{linea.producto_nombre}</p>
                      {linea.descripcion && (
                        <p className="text-sm text-muted-foreground">{linea.descripcion}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {linea.cantidad} {getTipoUnidad(linea.tipo_cantidad)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(linea.precio_unitario)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(linea.importe)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(factura.subtotal)}</span>
              </div>
              {(factura.descuento_importe || 0) > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Descuento{factura.descuento_tipo === 'porcentaje' ? ` (${factura.descuento_valor}%)` : ''}:</span>
                  <span>-{formatCurrency(factura.descuento_importe)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Base Imponible:</span>
                <span>{formatCurrency(factura.base_imponible)}</span>
              </div>
              {(factura.iva_porcentaje || 0) > 0 && (
                <div className="flex justify-between">
                  <span>IVA ({factura.iva_porcentaje}%):</span>
                  <span>{formatCurrency(factura.iva_importe)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>TOTAL:</span>
                <span>{formatCurrency(factura.total)}</span>
              </div>
              {(factura as any).metodo_pago && (
                <div className="flex justify-between text-sm text-muted-foreground pt-2">
                  <span>Método de pago:</span>
                  <span className="capitalize">{(factura as any).metodo_pago === 'transferencia' ? 'Transferencia bancaria' : (factura as any).metodo_pago}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Condiciones de Pago */}
      {(config?.condiciones_pago || (factura as any).metodo_pago) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Condiciones de Pago</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {(factura as any).metodo_pago && (
              <p>
                <span className="font-medium">Forma de pago: </span>
                {(factura as any).metodo_pago === 'transferencia' ? 'Transferencia bancaria' :
                 (factura as any).metodo_pago === 'efectivo' ? 'Efectivo' :
                 (factura as any).metodo_pago === 'tarjeta' ? 'Tarjeta de crédito/débito' :
                 (factura as any).metodo_pago === 'bizum' ? 'Bizum' :
                 (factura as any).metodo_pago === 'paypal' ? 'PayPal' :
                 (factura as any).metodo_pago === 'domiciliacion' ? 'Domiciliación bancaria' :
                 (factura as any).metodo_pago}
              </p>
            )}
            {config?.condiciones_pago && (
              <p className="text-muted-foreground whitespace-pre-wrap">{config.condiciones_pago}</p>
            )}
            {((factura as any).metodo_pago === 'transferencia' || (factura as any).metodo_pago === 'domiciliacion') && (config?.iban || config?.cuenta_bancaria) && (
              <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                <p className="font-medium mb-1">Datos bancarios:</p>
                {config?.iban && <p>IBAN: {config.iban}</p>}
                {config?.cuenta_bancaria && <p>Cuenta: {config.cuenta_bancaria}</p>}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {factura.notas && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{factura.notas}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
