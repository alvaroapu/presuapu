import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Factura {
  id: string;
  numero: string;
  presupuesto_id: string | null;
  cliente_id: string | null;
  cliente_nombre: string;
  cliente_nombre_comercial: string | null;
  cliente_documento: string | null;
  cliente_email: string | null;
  cliente_telefono: string | null;
  cliente_direccion: string | null;
  cliente_ciudad: string | null;
  cliente_codigo_postal: string | null;
  fecha_emision: string;
  fecha_vencimiento: string | null;
  subtotal: number | null;
  descuento_tipo: string | null;
  descuento_valor: number | null;
  descuento_importe: number | null;
  base_imponible: number | null;
  iva_porcentaje: number | null;
  iva_importe: number | null;
  total: number | null;
  estado: string | null;
  fecha_pago: string | null;
  notas: string | null;
  notas_internas: string | null;
  metodo_pago: string | null;
  created_at: string | null;
  updated_at: string | null;
  num_lineas?: number;
  cliente_email_actual?: string | null;
  cliente_telefono_actual?: string | null;
}

export interface FacturaLinea {
  id: string;
  factura_id: string;
  producto_id: string | null;
  producto_nombre: string;
  producto_categoria: string | null;
  cantidad: number;
  tipo_cantidad: string;
  descripcion: string | null;
  precio_unitario: number;
  importe: number;
  orden: number | null;
  created_at?: string | null;
}

interface FiltrosFactura {
  estado?: string;
  clienteId?: string;
  busqueda?: string;
  año?: number;
  mes?: number;
}

export function useFacturas(filtros?: FiltrosFactura) {
  return useQuery({
    queryKey: ['facturas', filtros],
    queryFn: async () => {
      let query = supabase
        .from('v_facturas_completas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filtros?.estado) {
        query = query.eq('estado', filtros.estado);
      }
      if (filtros?.clienteId) {
        query = query.eq('cliente_id', filtros.clienteId);
      }
      if (filtros?.busqueda) {
        query = query.or(`numero.ilike.%${filtros.busqueda}%,cliente_nombre.ilike.%${filtros.busqueda}%`);
      }
      if (filtros?.año) {
        const startOfYear = `${filtros.año}-01-01`;
        const endOfYear = `${filtros.año}-12-31`;
        
        if (filtros?.mes) {
          const startOfMonth = `${filtros.año}-${String(filtros.mes).padStart(2, '0')}-01`;
          const lastDay = new Date(filtros.año, filtros.mes, 0).getDate();
          const endOfMonth = `${filtros.año}-${String(filtros.mes).padStart(2, '0')}-${lastDay}`;
          query = query.gte('fecha_emision', startOfMonth).lte('fecha_emision', endOfMonth);
        } else {
          query = query.gte('fecha_emision', startOfYear).lte('fecha_emision', endOfYear);
        }
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Factura[];
    }
  });
}

export function useFactura(id: string | undefined) {
  return useQuery({
    queryKey: ['factura', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('facturas')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Factura;
    },
    enabled: !!id
  });
}

export function useFacturaLineas(facturaId: string | undefined) {
  return useQuery({
    queryKey: ['factura-lineas', facturaId],
    queryFn: async () => {
      if (!facturaId) return [];
      const { data, error } = await supabase
        .from('factura_lineas')
        .select('*')
        .eq('factura_id', facturaId)
        .order('orden');
      
      if (error) throw error;
      return data as FacturaLinea[];
    },
    enabled: !!facturaId
  });
}

export function useGenerarNumeroFactura() {
  return useQuery({
    queryKey: ['generar-numero-factura'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('generar_numero_factura');
      if (error) throw error;
      return data as string;
    }
  });
}

export function useCreateFactura() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (factura: Omit<Factura, 'id' | 'created_at' | 'updated_at' | 'num_lineas' | 'cliente_email_actual' | 'cliente_telefono_actual'>) => {
      const { data, error } = await supabase
        .from('facturas')
        .insert(factura)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
    }
  });
}

export function useCreateFacturaLinea() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (linea: Omit<FacturaLinea, 'id'>) => {
      const { data, error } = await supabase
        .from('factura_lineas')
        .insert(linea)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['factura-lineas', variables.factura_id] });
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
    }
  });
}

export function useUpdateFactura() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Factura> & { id: string }) => {
      const { data, error } = await supabase
        .from('facturas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      queryClient.invalidateQueries({ queryKey: ['factura', data.id] });
    }
  });
}

export function useDeleteFacturaLineas() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (facturaId: string) => {
      const { error } = await supabase
        .from('factura_lineas')
        .delete()
        .eq('factura_id', facturaId);
      
      if (error) throw error;
    },
    onSuccess: (_, facturaId) => {
      queryClient.invalidateQueries({ queryKey: ['factura-lineas', facturaId] });
    }
  });
}

export function useCreateFacturaLineas() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (lineas: Omit<FacturaLinea, 'id' | 'created_at'>[]) => {
      if (lineas.length === 0) return [];
      const { data, error } = await supabase
        .from('factura_lineas')
        .insert(lineas)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      if (variables.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['factura-lineas', variables[0].factura_id] });
        queryClient.invalidateQueries({ queryKey: ['facturas'] });
      }
    }
  });
}

// Hook para estadísticas de facturación
export function useFacturasStats() {
  return useQuery({
    queryKey: ['facturas-stats'],
    queryFn: async () => {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      
      // Get all invoices for current year
      const { data: facturas, error } = await supabase
        .from('facturas')
        .select('*')
        .gte('fecha_emision', `${currentYear}-01-01`)
        .lte('fecha_emision', `${currentYear}-12-31`);
      
      if (error) throw error;
      
      // Calculate stats
      const totalFacturado = facturas?.reduce((acc, f) => acc + (f.total || 0), 0) || 0;
      const pagadas = facturas?.filter(f => f.estado === 'pagada') || [];
      const pendientes = facturas?.filter(f => f.estado === 'emitida') || [];
      const vencidas = facturas?.filter(f => f.estado === 'vencida') || [];
      const anuladas = facturas?.filter(f => f.estado === 'anulada') || [];
      
      const totalPagado = pagadas.reduce((acc, f) => acc + (f.total || 0), 0);
      const totalPendiente = pendientes.reduce((acc, f) => acc + (f.total || 0), 0);
      const totalVencido = vencidas.reduce((acc, f) => acc + (f.total || 0), 0);
      
      // Group by month
      const porMes = Array.from({ length: 12 }, (_, i) => {
        const mes = i + 1;
        const facturasMes = facturas?.filter(f => {
          const fecha = new Date(f.fecha_emision);
          return fecha.getMonth() + 1 === mes;
        }) || [];
        
        return {
          mes,
          total: facturasMes.reduce((acc, f) => acc + (f.total || 0), 0),
          pagado: facturasMes.filter(f => f.estado === 'pagada').reduce((acc, f) => acc + (f.total || 0), 0),
          pendiente: facturasMes.filter(f => f.estado === 'emitida').reduce((acc, f) => acc + (f.total || 0), 0),
          cantidad: facturasMes.length
        };
      });
      
      // Facturas próximas a vencer (7 días)
      const hoy = new Date();
      const en7Dias = new Date(hoy);
      en7Dias.setDate(en7Dias.getDate() + 7);
      
      const proximasAVencer = pendientes.filter(f => {
        if (!f.fecha_vencimiento) return false;
        const vencimiento = new Date(f.fecha_vencimiento);
        return vencimiento >= hoy && vencimiento <= en7Dias;
      });
      
      return {
        totalFacturado,
        totalPagado,
        totalPendiente,
        totalVencido,
        cantidadTotal: facturas?.length || 0,
        cantidadPagadas: pagadas.length,
        cantidadPendientes: pendientes.length,
        cantidadVencidas: vencidas.length,
        cantidadAnuladas: anuladas.length,
        porMes,
        proximasAVencer,
        vencidasRecientes: vencidas.slice(0, 5)
      };
    }
  });
}

export function useConvertirPresupuestoAFactura() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ presupuestoId }: { presupuestoId: string }) => {
      // Get presupuesto
      const { data: presupuesto, error: presError } = await supabase
        .from('presupuestos')
        .select('*')
        .eq('id', presupuestoId)
        .single();
      
      if (presError) throw presError;
      
      // Get presupuesto lines
      const { data: lineas, error: lineasError } = await supabase
        .from('presupuesto_lineas')
        .select('*')
        .eq('presupuesto_id', presupuestoId)
        .order('orden');
      
      if (lineasError) throw lineasError;
      
      // Generate invoice number
      const { data: numero, error: numError } = await supabase.rpc('generar_numero_factura');
      if (numError) throw numError;
      
      // Create factura
      const { data: factura, error: facturaError } = await supabase
        .from('facturas')
        .insert({
          numero,
          presupuesto_id: presupuestoId,
          cliente_id: presupuesto.cliente_id,
          cliente_nombre: presupuesto.cliente_nombre,
          cliente_nombre_comercial: presupuesto.cliente_nombre_comercial,
          cliente_documento: presupuesto.cliente_documento,
          cliente_email: presupuesto.cliente_email,
          cliente_telefono: presupuesto.cliente_telefono,
          cliente_direccion: presupuesto.cliente_direccion,
          cliente_ciudad: presupuesto.cliente_ciudad,
          cliente_codigo_postal: presupuesto.cliente_codigo_postal,
          subtotal: presupuesto.subtotal,
          descuento_tipo: presupuesto.descuento_tipo,
          descuento_valor: presupuesto.descuento_valor,
          descuento_importe: presupuesto.descuento_importe,
          base_imponible: presupuesto.base_imponible,
          iva_porcentaje: presupuesto.iva_porcentaje,
          iva_importe: presupuesto.iva_importe,
          total: presupuesto.total,
          notas: presupuesto.notas,
          estado: 'emitida',
          metodo_pago: presupuesto.metodo_pago
        })
        .select()
        .single();
      
      if (facturaError) throw facturaError;
      
      // Create factura lines
      if (lineas && lineas.length > 0) {
        const facturasLineas = lineas.map(l => ({
          factura_id: factura.id,
          producto_id: l.producto_id,
          producto_nombre: l.producto_nombre,
          producto_categoria: l.producto_categoria,
          cantidad: l.cantidad,
          tipo_cantidad: l.tipo_cantidad,
          descripcion: l.descripcion,
          precio_unitario: l.precio_unitario,
          importe: l.importe,
          orden: l.orden
        }));
        
        const { error: lineasInsertError } = await supabase
          .from('factura_lineas')
          .insert(facturasLineas);
        
        if (lineasInsertError) throw lineasInsertError;
      }
      
      // Update presupuesto status to aceptado
      await supabase
        .from('presupuestos')
        .update({ estado: 'aceptado' })
        .eq('id', presupuestoId);
      
      return factura;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
    }
  });
}

export function useDeleteFactura() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // First delete the lines
      const { error: lineasError } = await supabase
        .from('factura_lineas')
        .delete()
        .eq('factura_id', id);
      
      if (lineasError) throw lineasError;
      
      // Then delete the factura
      const { error } = await supabase
        .from('facturas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      queryClient.invalidateQueries({ queryKey: ['facturas-stats'] });
    }
  });
}