import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Presupuesto = Tables<'presupuestos'>;
export type PresupuestoLinea = Tables<'presupuesto_lineas'>;
export type PresupuestoCompleto = {
  id: string | null;
  numero: string | null;
  cliente_id: string | null;
  cliente_nombre: string | null;
  cliente_nombre_comercial: string | null;
  cliente_documento: string | null;
  cliente_email: string | null;
  cliente_telefono: string | null;
  cliente_direccion: string | null;
  cliente_ciudad: string | null;
  cliente_codigo_postal: string | null;
  fecha_emision: string | null;
  fecha_validez: string | null;
  subtotal: number | null;
  descuento_tipo: string | null;
  descuento_valor: number | null;
  descuento_importe: number | null;
  base_imponible: number | null;
  iva_porcentaje: number | null;
  iva_importe: number | null;
  total: number | null;
  estado: string | null;
  fecha_envio: string | null;
  fecha_respuesta: string | null;
  notas: string | null;
  notas_internas: string | null;
  referencia_cliente: string | null;
  created_at: string | null;
  updated_at: string | null;
  cliente_email_actual: string | null;
  cliente_telefono_actual: string | null;
  num_lineas: number | null;
};

export type ResumenMensual = {
  mes: string | null;
  total_presupuestos: number | null;
  aceptados: number | null;
  rechazados: number | null;
  pendientes: number | null;
  importe_total: number | null;
  importe_aceptado: number | null;
};

interface FiltrosPresupuesto {
  estado?: string;
  clienteId?: string;
  busqueda?: string;
}

export function usePresupuestos(filtros?: FiltrosPresupuesto) {
  return useQuery({
    queryKey: ['presupuestos', filtros],
    queryFn: async () => {
      let query = supabase
        .from('v_presupuestos_completos')
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
      
      const { data, error } = await query;
      if (error) throw error;
      return data as PresupuestoCompleto[];
    }
  });
}

export function usePresupuesto(id: string | undefined) {
  return useQuery({
    queryKey: ['presupuesto', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('presupuestos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}

export function usePresupuestoLineas(presupuestoId: string | undefined) {
  return useQuery({
    queryKey: ['presupuesto-lineas', presupuestoId],
    queryFn: async () => {
      if (!presupuestoId) return [];
      const { data, error } = await supabase
        .from('presupuesto_lineas')
        .select('*')
        .eq('presupuesto_id', presupuestoId)
        .order('orden');
      
      if (error) throw error;
      return data;
    },
    enabled: !!presupuestoId
  });
}

export function useResumenMensual() {
  return useQuery({
    queryKey: ['resumen-mensual'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_resumen_mensual')
        .select('*')
        .limit(12);
      
      if (error) throw error;
      return data as ResumenMensual[];
    }
  });
}

export function useGenerarNumeroPresupuesto() {
  return useQuery({
    queryKey: ['generar-numero-presupuesto'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('generar_numero_presupuesto');
      if (error) throw error;
      return data as string;
    }
  });
}

export function useCreatePresupuesto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (presupuesto: TablesInsert<'presupuestos'>) => {
      const { data, error } = await supabase
        .from('presupuestos')
        .insert(presupuesto)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
      queryClient.invalidateQueries({ queryKey: ['resumen-mensual'] });
      queryClient.invalidateQueries({ queryKey: ['generar-numero-presupuesto'] });
    }
  });
}

export function useUpdatePresupuesto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'presupuestos'> & { id: string }) => {
      const { data, error } = await supabase
        .from('presupuestos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
      queryClient.invalidateQueries({ queryKey: ['presupuesto', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['resumen-mensual'] });
    }
  });
}

export function useCreatePresupuestoLinea() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (linea: TablesInsert<'presupuesto_lineas'>) => {
      const { data, error } = await supabase
        .from('presupuesto_lineas')
        .insert(linea)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['presupuesto-lineas', variables.presupuesto_id] });
    }
  });
}

export function useUpdatePresupuestoLinea() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, presupuesto_id, ...updates }: TablesUpdate<'presupuesto_lineas'> & { id: string; presupuesto_id: string }) => {
      const { data, error } = await supabase
        .from('presupuesto_lineas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['presupuesto-lineas', variables.presupuesto_id] });
    }
  });
}

export function useDeletePresupuestoLinea() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, presupuesto_id }: { id: string; presupuesto_id: string }) => {
      const { error } = await supabase
        .from('presupuesto_lineas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['presupuesto-lineas', variables.presupuesto_id] });
    }
  });
}

export function useRecalcularTotales() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (presupuestoId: string) => {
      const { error } = await supabase.rpc('recalcular_totales_presupuesto', {
        p_presupuesto_id: presupuestoId
      });
      
      if (error) throw error;
    },
    onSuccess: (_, presupuestoId) => {
      queryClient.invalidateQueries({ queryKey: ['presupuesto', presupuestoId] });
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
    }
  });
}
