import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type EmpresaConfig = Tables<'empresa_config'>;

export function useEmpresaConfig() {
  return useQuery({
    queryKey: ['empresa-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empresa_config')
        .select('*')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });
}

export function useUpdateEmpresaConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (config: TablesUpdate<'empresa_config'> & { id?: string }) => {
      if (config.id) {
        const { data, error } = await supabase
          .from('empresa_config')
          .update(config)
          .eq('id', config.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const insertData: TablesInsert<'empresa_config'> = {
          nombre_empresa: config.nombre_empresa || 'Mi Empresa',
          ...config
        };
        const { data, error } = await supabase
          .from('empresa_config')
          .insert(insertData)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresa-config'] });
    }
  });
}
