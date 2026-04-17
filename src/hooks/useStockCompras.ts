import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';

export function useStockCompras(productoId?: string) {
  return useQuery({
    queryKey: ['stock-compras', productoId],
    queryFn: async () => {
      let query = supabase
        .from('stock_compras')
        .select('*, stock_productos(nombre, unidad)')
        .order('fecha', { ascending: false });

      if (productoId) {
        query = query.eq('stock_producto_id', productoId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}

export function useStockComprasResumen() {
  return useQuery({
    queryKey: ['stock-compras-resumen'],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      const startOfYear = `${currentYear}-01-01`;
      const endOfYear = `${currentYear}-12-31`;

      const { data, error } = await supabase
        .from('stock_compras')
        .select('*, stock_productos(nombre, unidad)')
        .gte('fecha', startOfYear)
        .lte('fecha', endOfYear)
        .order('fecha', { ascending: false });

      if (error) throw error;

      // Calcular resumen
      const totalGastado = data?.reduce((sum, c) => sum + (c.precio_total || 0), 0) || 0;
      const totalCompras = data?.length || 0;

      // Agrupar por producto
      const porProducto: Record<string, { nombre: string; unidad: string; compras: number; totalGastado: number; totalCantidad: number }> = {};
      data?.forEach((c) => {
        const pid = c.stock_producto_id;
        if (!porProducto[pid]) {
          porProducto[pid] = {
            nombre: (c.stock_productos as any)?.nombre || 'Desconocido',
            unidad: (c.stock_productos as any)?.unidad || 'unidades',
            compras: 0,
            totalGastado: 0,
            totalCantidad: 0,
          };
        }
        porProducto[pid].compras += 1;
        porProducto[pid].totalGastado += c.precio_total || 0;
        porProducto[pid].totalCantidad += c.cantidad || 0;
      });

      return {
        totalGastado,
        totalCompras,
        porProducto,
        compras: data || [],
        year: currentYear,
      };
    }
  });
}

export function useCreateStockCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (compra: TablesInsert<'stock_compras'>) => {
      // 1. Insert the purchase record
      const { data, error } = await supabase
        .from('stock_compras')
        .insert(compra)
        .select()
        .single();

      if (error) throw error;

      // 2. Update the product stock quantity (add the purchased amount)
      const { data: producto } = await supabase
        .from('stock_productos')
        .select('cantidad, precio_unitario')
        .eq('id', compra.stock_producto_id)
        .single();

      if (producto) {
        const newCantidad = (producto.cantidad || 0) + (compra.cantidad || 0);
        const updates: Record<string, any> = { cantidad: newCantidad };
        // Update unit price if provided
        if (compra.precio_unitario && compra.precio_unitario > 0) {
          updates.precio_unitario = compra.precio_unitario;
        }
        if (compra.proveedor) {
          updates.proveedor = compra.proveedor;
        }

        await supabase
          .from('stock_productos')
          .update(updates)
          .eq('id', compra.stock_producto_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-compras'] });
      queryClient.invalidateQueries({ queryKey: ['stock-compras-resumen'] });
      queryClient.invalidateQueries({ queryKey: ['stock-productos'] });
    }
  });
}

export function useCreateStockPedido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pedido: {
      items: Array<{
        stock_producto_id: string;
        cantidad: number;
        precio_unitario: number;
        precio_total: number;
        proveedor: string | null;
        notas: string | null;
        fecha: string;
      }>;
    }) => {
      for (const item of pedido.items) {
        const { error } = await supabase.from('stock_compras').insert(item);
        if (error) throw error;

        const { data: producto } = await supabase
          .from('stock_productos')
          .select('cantidad')
          .eq('id', item.stock_producto_id)
          .single();

        if (producto) {
          const updates: Record<string, any> = {
            cantidad: (producto.cantidad || 0) + item.cantidad,
          };
          if (item.precio_unitario > 0) updates.precio_unitario = item.precio_unitario;
          if (item.proveedor) updates.proveedor = item.proveedor;

          await supabase
            .from('stock_productos')
            .update(updates)
            .eq('id', item.stock_producto_id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-compras'] });
      queryClient.invalidateQueries({ queryKey: ['stock-compras-resumen'] });
      queryClient.invalidateQueries({ queryKey: ['stock-productos'] });
    },
  });
}

export function useDeleteStockCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('stock_compras')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-compras'] });
      queryClient.invalidateQueries({ queryKey: ['stock-compras-resumen'] });
    }
  });
}
