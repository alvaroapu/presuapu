import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export function useProyectos(estado?: string) {
  return useQuery({
    queryKey: ['proyectos', estado],
    queryFn: async () => {
      let query = supabase
        .from('proyectos')
        .select('*, clientes(nombre, nombre_comercial)')
        .order('created_at', { ascending: false });

      if (estado && estado !== 'todos') {
        query = query.eq('estado', estado);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}

export function useProyecto(id: string | undefined) {
  return useQuery({
    queryKey: ['proyecto', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('proyectos')
        .select('*, clientes(nombre, nombre_comercial, email, telefono)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}

export function useCreateProyecto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proyecto: TablesInsert<'proyectos'>) => {
      const { data, error } = await supabase
        .from('proyectos')
        .insert(proyecto)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proyectos'] });
    }
  });
}

export function useUpdateProyecto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'proyectos'> & { id: string }) => {
      const { data, error } = await supabase
        .from('proyectos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proyectos'] });
      queryClient.invalidateQueries({ queryKey: ['proyecto'] });
    }
  });
}

export function useDeleteProyecto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('proyectos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proyectos'] });
    }
  });
}
