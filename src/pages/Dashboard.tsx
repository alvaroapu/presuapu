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
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <Button asChild size="sm" className="w-full sm:w-auto">
          <Link to="/presupuestos/nuevo">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Presupuesto
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Presupuestos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            {loadingResumen ? <Skeleton className="h-8 w-16" /> : (
              <>
                <div className="text-xl md:text-2xl font-bold">{mesActual?.total_presupuestos || 0}</div>
                <p className="text-xs text-muted-foreground">Este mes</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Aceptados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500 hidden sm:block" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            {loadingResumen ? <Skeleton className="h-8 w-16" /> : (
              <>
                <div className="text-xl md:text-2xl font-bold">{mesActual?.aceptados || 0}</div>
                <p className="text-xs text-muted-foreground">Este mes</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-blue-500 hidden sm:block" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            {loadingResumen ? <Skeleton className="h-8 w-16" /> : (
              <>
                <div className="text-xl md:text-2xl font-bold">{mesActual?.pendientes || 0}</div>
                <p className="text-xs text-muted-foreground hidden sm:block">Esperando respuesta</p>
                <p className="text-xs text-muted-foreground sm:hidden">En espera</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Facturación</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            {loadingResumen ? <Skeleton className="h-8 w-16" /> : (
              <>
                <div className="text-lg md:text-2xl font-bold">{formatCurrency(mesActual?.importe_aceptado || 0)}</div>
                <p className="text-xs text-muted-foreground hidden sm:block">Este mes (aceptados)</p>
                <p className="text-xs text-muted-foreground sm:hidden">Este mes</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Quotes */}
      {pendientes.length > 0 && (
        <Card>
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="text-base md:text-lg">Presupuestos Pendientes</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="space-y-2">
              {pendientes.slice(0, 5).map((p) => (
                <Link 
                  key={p.id} 
                  to={`/presupuestos/${p.id}`}
                  className="flex items-center justify-between p-2 md:p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 min-w-0">
                    <span className="font-mono text-xs md:text-sm">{p.numero}</span>
                    <span className="font-medium text-sm truncate">{p.cliente_nombre}</span>
                  </div>
                  <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    <span className="font-medium text-sm">{formatCurrency(p.total || 0)}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Quotes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-3 md:p-6">
          <CardTitle className="text-base md:text-lg">Últimos Presupuestos</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/presupuestos">Ver todos</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
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
                  className="flex items-center justify-between p-2 md:p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 min-w-0">
                    <span className="font-mono text-xs md:text-sm">{p.numero}</span>
                    <span className="font-medium text-sm truncate">{p.cliente_nombre}</span>
                  </div>
                  <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    <span className="font-medium text-sm hidden sm:block">{formatCurrency(p.total || 0)}</span>
                    <Badge variant="outline" className={`text-xs ${getEstadoColor(p.estado || '')}`}>
                      {getEstadoLabel(p.estado || '')}
                    </Badge>
                    <span className="text-xs text-muted-foreground hidden md:block">{formatDate(p.fecha_emision)}</span>
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
