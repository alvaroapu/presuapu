import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import type { PrecioCalculado } from '@/types/database';

export type Producto = Tables<'productos'>;
export type ProductoConCategoria = Tables<'productos'> & {
  categoria_nombre: string;
  categoria_orden: number;
};

export function useProductos() {
  return useQuery({
    queryKey: ['productos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_productos_con_categoria')
        .select('*')
        .order('categoria_orden')
        .order('nombre');
      
      if (error) throw error;
      return data as ProductoConCategoria[];
    }
  });
}

export function useProducto(id: string | undefined) {
  return useQuery({
    queryKey: ['producto', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}

export function useCreateProducto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (producto: TablesInsert<'productos'>) => {
      const { data, error } = await supabase
        .from('productos')
        .insert(producto)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    }
  });
}

export function useUpdateProducto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'productos'> & { id: string }) => {
      const { data, error } = await supabase
        .from('productos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    }
  });
}

export function useCalcularPrecio(
  productoId: string | undefined, 
  cantidad: number, 
  tipoCantidad: string = 'metros'
) {
  return useQuery({
    queryKey: ['calcular-precio', productoId, cantidad, tipoCantidad],
    queryFn: async () => {
      if (!productoId) return null;
      
      const { data, error } = await supabase
        .rpc('calcular_precio_producto', {
          p_producto_id: productoId,
          p_cantidad: cantidad,
          p_tipo_cantidad: tipoCantidad
        });
      
      if (error) throw error;
      return (data as PrecioCalculado[])?.[0] || null;
    },
    enabled: !!productoId && cantidad > 0
  });
}
