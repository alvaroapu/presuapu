import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type StockUbicacion = Tables<'stock_ubicaciones'>;
export type StockProducto = Tables<'stock_productos'>;

// --- Ubicaciones ---

export function useStockUbicaciones() {
  return useQuery({
    queryKey: ['stock-ubicaciones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_ubicaciones')
        .select('*')
        .order('tipo')
        .order('orden')
        .order('nombre');

      if (error) throw error;
      return data as StockUbicacion[];
    }
  });
}

export function useCreateStockUbicacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ubicacion: TablesInsert<'stock_ubicaciones'>) => {
      const { data, error } = await supabase
        .from('stock_ubicaciones')
        .insert(ubicacion)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-ubicaciones'] });
    }
  });
}

export function useUpdateStockUbicacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'stock_ubicaciones'> & { id: string }) => {
      const { data, error } = await supabase
        .from('stock_ubicaciones')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-ubicaciones'] });
    }
  });
}

export function useDeleteStockUbicacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('stock_ubicaciones')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-ubicaciones'] });
      queryClient.invalidateQueries({ queryKey: ['stock-productos'] });
    }
  });
}

// --- Stock Productos ---

export function useStockProductos(ubicacionId?: string) {
  return useQuery({
    queryKey: ['stock-productos', ubicacionId],
    queryFn: async () => {
      let query = supabase
        .from('stock_productos')
        .select('*, stock_ubicaciones(nombre, tipo)')
        .order('nombre');

      if (ubicacionId) {
        query = query.eq('ubicacion_id', ubicacionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    }
  });
}

export function useCreateStockProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (producto: TablesInsert<'stock_productos'>) => {
      const { data, error } = await supabase
        .from('stock_productos')
        .insert(producto)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-productos'] });
    }
  });
}

export function useUpdateStockProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'stock_productos'> & { id: string }) => {
      const { data, error } = await supabase
        .from('stock_productos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-productos'] });
    }
  });
}

export function useDeleteStockProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('stock_productos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-productos'] });
    }
  });
}
