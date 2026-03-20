import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useListaCompra(soloActivos = true) {
  return useQuery({
    queryKey: ['lista-compra', soloActivos],
    queryFn: async () => {
      let query = supabase
        .from('lista_compra')
        .select('*')
        .order('ubicacion_nombre')
        .order('producto_nombre');

      if (soloActivos) {
        query = query.eq('comprado', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}

export function useMarcarComprado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lista_compra')
        .update({ comprado: true, fecha_compra: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lista-compra'] });
    }
  });
}

export function useLimpiarListaCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('lista_compra')
        .update({ comprado: true, fecha_compra: new Date().toISOString() })
        .eq('comprado', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lista-compra'] });
    }
  });
}

export function useDeleteListaCompraItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lista_compra')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lista-compra'] });
    }
  });
}
