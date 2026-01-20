import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Receipt, CheckCircle, Clock, AlertTriangle, Euro, ArrowRight, TrendingUp } from "lucide-react";
import { useFacturasStats, useFacturas } from "@/hooks/useFacturas";
import { formatCurrency, formatDate, getEstadoFacturaColor, getEstadoFacturaLabel } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function DashboardFacturas() {
  const { data: stats, isLoading: loadingStats } = useFacturasStats();
  const { data: facturas, isLoading: loadingFacturas } = useFacturas();

  const ultimasFacturas = facturas?.slice(0, 5) || [];

  const chartData = stats?.porMes.map((m, i) => ({
    name: MESES[i],
    pagado: m.pagado,
    pendiente: m.pendiente,
    total: m.total
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard de Facturación</h1>
        <Button asChild variant="outline">
          <Link to="/facturas">Ver todas las facturas</Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStats ? <Skeleton className="h-8 w-24" /> : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(stats?.totalFacturado || 0)}</div>
                <p className="text-xs text-muted-foreground">Este año ({stats?.cantidadTotal || 0} facturas)</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cobrado</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {loadingStats ? <Skeleton className="h-8 w-24" /> : (
              <>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(stats?.totalPagado || 0)}</div>
                <p className="text-xs text-muted-foreground">{stats?.cantidadPagadas || 0} facturas pagadas</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendiente</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {loadingStats ? <Skeleton className="h-8 w-24" /> : (
              <>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats?.totalPendiente || 0)}</div>
                <p className="text-xs text-muted-foreground">{stats?.cantidadPendientes || 0} facturas por cobrar</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vencido</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {loadingStats ? <Skeleton className="h-8 w-24" /> : (
              <>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(stats?.totalVencido || 0)}</div>
                <p className="text-xs text-muted-foreground">{stats?.cantidadVencidas || 0} facturas vencidas</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Facturación Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar dataKey="pagado" name="Cobrado" stackId="a" fill="hsl(var(--chart-2))" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pendiente" name="Pendiente" stackId="a" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Próximas a vencer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Próximas a Vencer (7 días)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : stats?.proximasAVencer && stats.proximasAVencer.length > 0 ? (
              <div className="space-y-2">
                {stats.proximasAVencer.map((f) => (
                  <Link
                    key={f.id}
                    to={`/facturas/${f.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Receipt className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-mono text-sm">{f.numero}</p>
                        <p className="text-sm text-muted-foreground">{f.cliente_nombre}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(f.total || 0)}</p>
                      <p className="text-xs text-amber-600">Vence: {formatDate(f.fecha_vencimiento)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No hay facturas próximas a vencer
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Facturas vencidas */}
      {stats?.vencidasRecientes && stats.vencidasRecientes.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Facturas Vencidas - Requieren Acción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.vencidasRecientes.map((f) => (
                <Link
                  key={f.id}
                  to={`/facturas/${f.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-white hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Receipt className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="font-mono text-sm">{f.numero}</p>
                      <p className="text-sm text-muted-foreground">{f.cliente_nombre}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-red-700">{formatCurrency(f.total || 0)}</p>
                      <p className="text-xs text-red-600">Venció: {formatDate(f.fecha_vencimiento)}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-red-400" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Últimas Facturas</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/facturas">Ver todas</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loadingFacturas ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {ultimasFacturas.map((f) => (
                <Link
                  key={f.id}
                  to={`/facturas/${f.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm">{f.numero}</span>
                    <span className="font-medium">{f.cliente_nombre}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{formatCurrency(f.total || 0)}</span>
                    <Badge variant="outline" className={getEstadoFacturaColor(f.estado || '')}>
                      {getEstadoFacturaLabel(f.estado || '')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{formatDate(f.fecha_emision)}</span>
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
