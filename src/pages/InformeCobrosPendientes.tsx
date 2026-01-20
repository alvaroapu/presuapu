import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFacturas } from "@/hooks/useFacturas";
import { formatCurrency } from "@/lib/formatters";
import { ArrowLeft, AlertTriangle, Clock, FileText, Download } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AgingBucket {
  label: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
}

const AGING_BUCKETS: AgingBucket[] = [
  { label: "0-30 días", min: 0, max: 30, color: "text-emerald-700", bgColor: "bg-emerald-50 border-emerald-200" },
  { label: "31-60 días", min: 31, max: 60, color: "text-amber-700", bgColor: "bg-amber-50 border-amber-200" },
  { label: "61-90 días", min: 61, max: 90, color: "text-orange-700", bgColor: "bg-orange-50 border-orange-200" },
  { label: "+90 días", min: 91, max: Infinity, color: "text-red-700", bgColor: "bg-red-50 border-red-200" },
];

interface FacturaPendiente {
  id: string;
  numero: string;
  cliente_id: string | null;
  cliente_nombre: string;
  fecha_emision: string;
  fecha_vencimiento: string | null;
  total: number;
  diasVencido: number;
  bucket: number;
}

interface ClienteDeuda {
  cliente_id: string | null;
  cliente_nombre: string;
  facturas: FacturaPendiente[];
  totales: number[];
  totalDeuda: number;
}

export default function InformeCobrosPendientes() {
  const { data: facturas, isLoading } = useFacturas({});
  const { toast } = useToast();

  const { clientesConDeuda, totalesPorBucket, totalGeneral } = useMemo(() => {
    if (!facturas) return { clientesConDeuda: [], totalesPorBucket: [0, 0, 0, 0], totalGeneral: 0 };

    const hoy = new Date();
    const pendientes: FacturaPendiente[] = [];

    facturas.forEach((f) => {
      if (f.estado === "emitida" || f.estado === "vencida") {
        const fechaRef = f.fecha_vencimiento || f.fecha_emision;
        const diasVencido = differenceInDays(hoy, parseISO(fechaRef));
        
        let bucket = 0;
        if (diasVencido > 90) bucket = 3;
        else if (diasVencido > 60) bucket = 2;
        else if (diasVencido > 30) bucket = 1;
        else bucket = 0;

        pendientes.push({
          id: f.id!,
          numero: f.numero!,
          cliente_id: f.cliente_id,
          cliente_nombre: f.cliente_nombre!,
          fecha_emision: f.fecha_emision!,
          fecha_vencimiento: f.fecha_vencimiento,
          total: f.total || 0,
          diasVencido: Math.max(0, diasVencido),
          bucket,
        });
      }
    });

    // Group by client
    const clienteMap = new Map<string, ClienteDeuda>();
    
    pendientes.forEach((f) => {
      const key = f.cliente_id || f.cliente_nombre;
      if (!clienteMap.has(key)) {
        clienteMap.set(key, {
          cliente_id: f.cliente_id,
          cliente_nombre: f.cliente_nombre,
          facturas: [],
          totales: [0, 0, 0, 0],
          totalDeuda: 0,
        });
      }
      const cliente = clienteMap.get(key)!;
      cliente.facturas.push(f);
      cliente.totales[f.bucket] += f.total;
      cliente.totalDeuda += f.total;
    });

    // Sort by total debt descending
    const clientesConDeuda = Array.from(clienteMap.values()).sort(
      (a, b) => b.totalDeuda - a.totalDeuda
    );

    // Calculate totals per bucket
    const totalesPorBucket = [0, 0, 0, 0];
    clientesConDeuda.forEach((c) => {
      c.totales.forEach((t, i) => {
        totalesPorBucket[i] += t;
      });
    });

    const totalGeneral = totalesPorBucket.reduce((a, b) => a + b, 0);

    return { clientesConDeuda, totalesPorBucket, totalGeneral };
  }, [facturas]);

  const exportToCSV = () => {
    if (clientesConDeuda.length === 0) {
      toast({ title: "No hay datos para exportar", variant: "destructive" });
      return;
    }

    const headers = ["Cliente", "0-30 días", "31-60 días", "61-90 días", "+90 días", "Total Deuda"];
    
    const rows = clientesConDeuda.map((c) => [
      c.cliente_nombre,
      c.totales[0].toFixed(2).replace(".", ","),
      c.totales[1].toFixed(2).replace(".", ","),
      c.totales[2].toFixed(2).replace(".", ","),
      c.totales[3].toFixed(2).replace(".", ","),
      c.totalDeuda.toFixed(2).replace(".", ","),
    ].join(";"));

    // Add totals row
    rows.push([
      "TOTAL",
      totalesPorBucket[0].toFixed(2).replace(".", ","),
      totalesPorBucket[1].toFixed(2).replace(".", ","),
      totalesPorBucket[2].toFixed(2).replace(".", ","),
      totalesPorBucket[3].toFixed(2).replace(".", ","),
      totalGeneral.toFixed(2).replace(".", ","),
    ].join(";"));

    const csvContent = [headers.join(";"), ...rows].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `informe_cobros_pendientes_${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: "Informe exportado" });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/facturas/dashboard">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Antigüedad de Deuda</h1>
            <p className="text-muted-foreground">Cobros pendientes agrupados por cliente</p>
          </div>
        </div>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {AGING_BUCKETS.map((bucket, i) => (
          <Card key={bucket.label} className={`border ${bucket.bgColor}`}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium ${bucket.color}`}>
                {bucket.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${bucket.color}`}>
                {formatCurrency(totalesPorBucket[i])}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Total Card */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-primary" />
              <span className="text-lg font-medium">Total Cobros Pendientes</span>
            </div>
            <span className="text-3xl font-bold text-primary">{formatCurrency(totalGeneral)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Client List */}
      {clientesConDeuda.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No hay cobros pendientes</p>
            <p className="text-muted-foreground">Todas las facturas están al día</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 p-4 bg-muted/50 font-medium text-sm">
            <div>Cliente</div>
            {AGING_BUCKETS.map((b) => (
              <div key={b.label} className={`text-right ${b.color}`}>{b.label}</div>
            ))}
            <div className="text-right">Total</div>
          </div>

          {clientesConDeuda.map((cliente) => (
            <div key={cliente.cliente_id || cliente.cliente_nombre} className="border-t">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 p-4 items-center hover:bg-muted/30">
                <div>
                  {cliente.cliente_id ? (
                    <Link 
                      to={`/clientes/${cliente.cliente_id}`}
                      className="font-medium hover:underline"
                    >
                      {cliente.cliente_nombre}
                    </Link>
                  ) : (
                    <span className="font-medium">{cliente.cliente_nombre}</span>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {cliente.facturas.length} factura{cliente.facturas.length !== 1 ? "s" : ""}
                  </p>
                </div>
                {cliente.totales.map((total, i) => (
                  <div key={i} className={`text-right ${total > 0 ? AGING_BUCKETS[i].color : "text-muted-foreground"}`}>
                    {total > 0 ? formatCurrency(total) : "-"}
                  </div>
                ))}
                <div className="text-right font-bold">
                  {formatCurrency(cliente.totalDeuda)}
                </div>
              </div>
              
              {/* Invoice details */}
              <div className="px-4 pb-4">
                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                  {cliente.facturas.map((f) => (
                    <div key={f.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <Link to={`/facturas/${f.id}`} className="hover:underline font-mono">
                          {f.numero}
                        </Link>
                        <Badge variant="outline" className={AGING_BUCKETS[f.bucket].bgColor + " " + AGING_BUCKETS[f.bucket].color}>
                          {f.diasVencido} días
                        </Badge>
                      </div>
                      <span className="font-medium">{formatCurrency(f.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Totals row */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 p-4 bg-muted font-bold border-t-2">
            <div>TOTAL</div>
            {totalesPorBucket.map((total, i) => (
              <div key={i} className={`text-right ${AGING_BUCKETS[i].color}`}>
                {formatCurrency(total)}
              </div>
            ))}
            <div className="text-right text-primary">{formatCurrency(totalGeneral)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
