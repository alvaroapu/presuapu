import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Cliente = Tables<'clientes'>;
export type ClienteConStats = {
  id: string | null;
  nombre: string | null;
  nombre_comercial: string | null;
  tipo_documento: string | null;
  numero_documento: string | null;
  email: string | null;
  telefono: string | null;
  telefono_secundario: string | null;
  direccion: string | null;
  ciudad: string | null;
  provincia: string | null;
  codigo_postal: string | null;
  pais: string | null;
  persona_contacto: string | null;
  notas: string | null;
  activo: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  total_presupuestos: number | null;
  presupuestos_aceptados: number | null;
  facturacion_total: number | null;
  ultimo_presupuesto: string | null;
};

export function useClientes(search?: string) {
  return useQuery({
    queryKey: ['clientes', search],
    queryFn: async () => {
      let query = supabase
        .from('clientes')
        .select('*')
        .eq('activo', true)
        .order('nombre');
      
      if (search) {
        query = query.or(`nombre.ilike.%${search}%,nombre_comercial.ilike.%${search}%,email.ilike.%${search}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}

export function useClientesConStats() {
  return useQuery({
    queryKey: ['clientes-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_clientes_con_stats')
        .select('*')
        .order('nombre');
      
      if (error) throw error;
      return data as ClienteConStats[];
    }
  });
}

export function useCliente(id: string | undefined) {
  return useQuery({
    queryKey: ['cliente', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('v_clientes_con_stats')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as ClienteConStats;
    },
    enabled: !!id
  });
}

export function useCreateCliente() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cliente: TablesInsert<'clientes'>) => {
      const { data, error } = await supabase
        .from('clientes')
        .insert(cliente)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['clientes-stats'] });
    }
  });
}

export function useUpdateCliente() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'clientes'> & { id: string }) => {
      const { data, error } = await supabase
        .from('clientes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['clientes-stats'] });
    }
  });
}
