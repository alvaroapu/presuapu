import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Plus, Mail, Phone, MapPin, Building } from "lucide-react";
import { useCliente } from "@/hooks/useClientes";
import { usePresupuestos } from "@/hooks/usePresupuestos";
import { formatCurrency, formatDate, getEstadoColor, getEstadoLabel } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: cliente, isLoading } = useCliente(id);
  const { data: presupuestos } = usePresupuestos({ clienteId: id });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Cliente no encontrado</p>
        <Button variant="link" onClick={() => navigate('/clientes')}>
          Volver a clientes
        </Button>
      </div>
    );
  }

  const tasaAceptacion = cliente.total_presupuestos 
    ? Math.round(((cliente.presupuestos_aceptados || 0) / cliente.total_presupuestos) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{cliente.nombre}</h1>
            {cliente.nombre_comercial && (
              <p className="text-muted-foreground">{cliente.nombre_comercial}</p>
            )}
          </div>
        </div>
        <Button variant="outline">
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Datos de contacto */}
          <Card>
            <CardHeader>
              <CardTitle>Datos de contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cliente.numero_documento && (
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span>{cliente.tipo_documento}: {cliente.numero_documento}</span>
                </div>
              )}
              {cliente.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${cliente.email}`} className="text-primary hover:underline">
                    {cliente.email}
                  </a>
                </div>
              )}
              {cliente.telefono && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${cliente.telefono}`} className="hover:underline">
                    {cliente.telefono}
                  </a>
                  {cliente.telefono_secundario && (
                    <span className="text-muted-foreground">/ {cliente.telefono_secundario}</span>
                  )}
                </div>
              )}
              {cliente.direccion && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {cliente.direccion}, {cliente.codigo_postal} {cliente.ciudad}
                    {cliente.provincia && ` (${cliente.provincia})`}
                  </span>
                </div>
              )}
              {cliente.persona_contacto && (
                <p className="text-sm text-muted-foreground">
                  Persona de contacto: {cliente.persona_contacto}
                </p>
              )}
              {cliente.notas && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">{cliente.notas}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historial de presupuestos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Historial de presupuestos</CardTitle>
              <Button size="sm" asChild>
                <Link to={`/presupuestos/nuevo?cliente=${id}`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Presupuesto
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {presupuestos?.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No hay presupuestos para este cliente
                </p>
              ) : (
                <div className="space-y-2">
                  {presupuestos?.map((p) => (
                    <Link
                      key={p.id}
                      to={`/presupuestos/${p.id}`}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors"
                    >
                      <div>
                        <span className="font-mono text-sm">{p.numero}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{formatCurrency(p.total || 0)}</span>
                        <Badge variant="outline" className={getEstadoColor(p.estado || '')}>
                          {getEstadoLabel(p.estado || '')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{formatDate(p.fecha_emision)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total presupuestos:</span>
                <span className="font-medium">{cliente.total_presupuestos || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aceptados:</span>
                <span className="font-medium">{cliente.presupuestos_aceptados || 0} ({tasaAceptacion}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Facturación total:</span>
                <span className="font-medium">{formatCurrency(cliente.facturacion_total || 0)}</span>
              </div>
              {cliente.ultimo_presupuesto && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Último presupuesto:</span>
                  <span className="font-medium">{formatDate(cliente.ultimo_presupuesto)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
