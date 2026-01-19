import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, Clock, Euro, Plus, ArrowRight } from "lucide-react";
import { usePresupuestos, useResumenMensual } from "@/hooks/usePresupuestos";
import { formatCurrency, formatDate, getEstadoColor, getEstadoLabel } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: presupuestos, isLoading: loadingPresupuestos } = usePresupuestos();
  const { data: resumen, isLoading: loadingResumen } = useResumenMensual();

  const mesActual = resumen?.[0];
  const pendientes = presupuestos?.filter(p => p.estado === 'enviado') || [];
  const ultimos = presupuestos?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link to="/presupuestos/nuevo">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Presupuesto
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Presupuestos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingResumen ? <Skeleton className="h-8 w-16" /> : (
              <>
                <div className="text-2xl font-bold">{mesActual?.total_presupuestos || 0}</div>
                <p className="text-xs text-muted-foreground">Este mes</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aceptados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {loadingResumen ? <Skeleton className="h-8 w-16" /> : (
              <>
                <div className="text-2xl font-bold">{mesActual?.aceptados || 0}</div>
                <p className="text-xs text-muted-foreground">Este mes</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {loadingResumen ? <Skeleton className="h-8 w-16" /> : (
              <>
                <div className="text-2xl font-bold">{mesActual?.pendientes || 0}</div>
                <p className="text-xs text-muted-foreground">Esperando respuesta</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Facturación</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingResumen ? <Skeleton className="h-8 w-16" /> : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(mesActual?.importe_aceptado || 0)}</div>
                <p className="text-xs text-muted-foreground">Este mes (aceptados)</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Quotes */}
      {pendientes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Presupuestos Pendientes de Respuesta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendientes.slice(0, 5).map((p) => (
                <Link 
                  key={p.id} 
                  to={`/presupuestos/${p.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm">{p.numero}</span>
                    <span className="font-medium">{p.cliente_nombre}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{formatCurrency(p.total || 0)}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Quotes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Últimos Presupuestos</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/presupuestos">Ver todos</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loadingPresupuestos ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {ultimos.map((p) => (
                <Link 
                  key={p.id} 
                  to={`/presupuestos/${p.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm">{p.numero}</span>
                    <span className="font-medium">{p.cliente_nombre}</span>
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
  );
}
