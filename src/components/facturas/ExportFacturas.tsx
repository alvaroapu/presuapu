import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, CalendarDays } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useClientes } from '@/hooks/useClientes';
import { format } from 'date-fns';

interface Factura {
  id: string;
  numero: string;
  cliente_nombre: string;
  cliente_documento?: string | null;
  cliente_email?: string | null;
  cliente_telefono?: string | null;
  cliente_direccion?: string | null;
  cliente_ciudad?: string | null;
  cliente_codigo_postal?: string | null;
  fecha_emision: string;
  fecha_vencimiento?: string | null;
  fecha_pago?: string | null;
  estado?: string | null;
  subtotal?: number | null;
  descuento_importe?: number | null;
  base_imponible?: number | null;
  iva_porcentaje?: number | null;
  iva_importe?: number | null;
  total?: number | null;
  notas?: string | null;
}

export function ExportFacturas() {
  const { toast } = useToast();
  const { data: clientes } = useClientes();
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Filters
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [clienteId, setClienteId] = useState<string>('todos');
  const [estado, setEstado] = useState<string>('todos');
  const [formato, setFormato] = useState<'csv' | 'excel'>('csv');

  const exportFacturas = async () => {
    setExporting(true);
    
    try {
      let query = supabase
        .from('v_facturas_completas')
        .select('*')
        .order('fecha_emision', { ascending: false });
      
      if (fechaDesde) {
        query = query.gte('fecha_emision', fechaDesde);
      }
      if (fechaHasta) {
        query = query.lte('fecha_emision', fechaHasta);
      }
      if (clienteId && clienteId !== 'todos') {
        query = query.eq('cliente_id', clienteId);
      }
      if (estado && estado !== 'todos') {
        query = query.eq('estado', estado);
      }
      
      const { data: facturas, error } = await query;
      
      if (error) throw error;
      
      if (!facturas || facturas.length === 0) {
        toast({ title: 'No hay facturas para exportar', variant: 'destructive' });
        return;
      }

      const headers = [
        'Número',
        'Cliente',
        'NIF/CIF',
        'Email',
        'Teléfono',
        'Dirección',
        'Ciudad',
        'C.P.',
        'Fecha Emisión',
        'Fecha Vencimiento',
        'Fecha Pago',
        'Estado',
        'Subtotal',
        'Descuento',
        'Base Imponible',
        'IVA %',
        'IVA Importe',
        'Total',
        'Notas'
      ];

      const getEstadoLabel = (e: string | null) => {
        switch (e) {
          case 'emitida': return 'Emitida';
          case 'pagada': return 'Pagada';
          case 'vencida': return 'Vencida';
          case 'anulada': return 'Anulada';
          default: return e || '';
        }
      };

      const formatDateForExport = (date: string | null) => {
        if (!date) return '';
        try {
          return format(new Date(date), 'dd/MM/yyyy');
        } catch {
          return date;
        }
      };

      const formatNumber = (num: number | null) => {
        if (num === null || num === undefined) return '';
        return num.toFixed(2).replace('.', ',');
      };

      const escapeCSV = (value: string | null | undefined) => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(';') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows = facturas.map((f: Factura) => [
        escapeCSV(f.numero),
        escapeCSV(f.cliente_nombre),
        escapeCSV(f.cliente_documento),
        escapeCSV(f.cliente_email),
        escapeCSV(f.cliente_telefono),
        escapeCSV(f.cliente_direccion),
        escapeCSV(f.cliente_ciudad),
        escapeCSV(f.cliente_codigo_postal),
        formatDateForExport(f.fecha_emision),
        formatDateForExport(f.fecha_vencimiento),
        formatDateForExport(f.fecha_pago),
        getEstadoLabel(f.estado),
        formatNumber(f.subtotal),
        formatNumber(f.descuento_importe),
        formatNumber(f.base_imponible),
        f.iva_porcentaje || '',
        formatNumber(f.iva_importe),
        formatNumber(f.total),
        escapeCSV(f.notas)
      ].join(';'));

      const csvContent = [headers.join(';'), ...rows].join('\n');
      
      const mimeType = formato === 'excel' 
        ? 'application/vnd.ms-excel;charset=utf-8;' 
        : 'text/csv;charset=utf-8;';
      const extension = formato === 'excel' ? 'xls' : 'csv';
      
      const blob = new Blob(['\ufeff' + csvContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const filename = `facturas_${format(new Date(), 'yyyy-MM-dd')}`;
      link.download = `${filename}.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: `${facturas.length} facturas exportadas` });
      setOpen(false);
    } catch (err) {
      toast({ 
        title: 'Error al exportar', 
        description: err instanceof Error ? err.message : 'Error desconocido',
        variant: 'destructive' 
      });
    } finally {
      setExporting(false);
    }
  };

  const resetFilters = () => {
    setFechaDesde('');
    setFechaHasta('');
    setClienteId('todos');
    setEstado('todos');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Facturas</DialogTitle>
          <DialogDescription>
            Filtra y exporta tus facturas a CSV o Excel
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaDesde">Desde</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fechaDesde"
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaHasta">Hasta</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fechaHasta"
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los clientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los clientes</SelectItem>
                {clientes?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Estado</Label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="emitida">Emitida</SelectItem>
                <SelectItem value="pagada">Pagada</SelectItem>
                <SelectItem value="vencida">Vencida</SelectItem>
                <SelectItem value="anulada">Anulada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Formato</Label>
            <Select value={formato} onValueChange={(v) => setFormato(v as 'csv' | 'excel')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (.csv)</SelectItem>
                <SelectItem value="excel">Excel (.xls)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={resetFilters} className="flex-1">
            Limpiar filtros
          </Button>
          <Button onClick={exportFacturas} disabled={exporting} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Exportando...' : 'Exportar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
