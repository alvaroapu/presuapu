import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductoTarifa {
  id: string;
  producto_id: string;
  cantidad_desde: number;
  cantidad_hasta: number | null;
  precio_unitario: number;
  orden: number;
  created_at: string;
}

export type TarifaInsert = Omit<ProductoTarifa, 'id' | 'created_at'>;

export function useProductoTarifas(productoId: string | undefined) {
  return useQuery({
    queryKey: ['producto-tarifas', productoId],
    queryFn: async () => {
      if (!productoId) return [];
      const { data, error } = await supabase
        .from('producto_tarifas')
        .select('*')
        .eq('producto_id', productoId)
        .order('orden');
      
      if (error) throw error;
      return data as ProductoTarifa[];
    },
    enabled: !!productoId
  });
}

export function useSaveProductoTarifas() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      productoId, 
      tarifas 
    }: { 
      productoId: string; 
      tarifas: Omit<TarifaInsert, 'producto_id'>[] 
    }) => {
      // Eliminar tarifas existentes
      const { error: deleteError } = await supabase
        .from('producto_tarifas')
        .delete()
        .eq('producto_id', productoId);
      
      if (deleteError) throw deleteError;
      
      // Insertar nuevas tarifas si hay alguna
      if (tarifas.length > 0) {
        const tarifasToInsert = tarifas.map((t, index) => ({
          producto_id: productoId,
          cantidad_desde: t.cantidad_desde,
          cantidad_hasta: t.cantidad_hasta,
          precio_unitario: t.precio_unitario,
          orden: index
        }));
        
        const { error: insertError } = await supabase
          .from('producto_tarifas')
          .insert(tarifasToInsert);
        
        if (insertError) throw insertError;
      }
      
      return true;
    },
    onSuccess: (_, { productoId }) => {
      queryClient.invalidateQueries({ queryKey: ['producto-tarifas', productoId] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    }
  });
}
