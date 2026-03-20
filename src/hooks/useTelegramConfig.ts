import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useTelegramConfig() {
  return useQuery({
    queryKey: ['telegram-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telegram_config')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
  });
}

export function useSaveTelegramConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: {
      id?: string;
      chat_id: string;
      bot_token: string;
      activo: boolean;
      dia_resumen: number;
      hora_resumen: number;
    }) => {
      if (config.id) {
        const { id, ...updates } = config;
        const { data, error } = await supabase
          .from('telegram_config')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { id, ...rest } = config;
        const { data, error } = await supabase
          .from('telegram_config')
          .insert(rest)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-config'] });
    }
  });
}
