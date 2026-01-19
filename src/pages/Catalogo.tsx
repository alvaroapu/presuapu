import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";
import { useProductos } from "@/hooks/useProductos";
import { useCategorias } from "@/hooks/useCategorias";
import { formatCurrency } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Catalogo() {
  const { data: productos, isLoading: loadingProductos } = useProductos();
  const { data: categorias, isLoading: loadingCategorias } = useCategorias();
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const toggleCategory = (id: string) => {
    setOpenCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const productosPorCategoria = categorias?.map(cat => ({
    ...cat,
    productos: productos?.filter(p => p.categoria_id === cat.id) || []
  }));

  if (loadingProductos || loadingCategorias) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Catálogo de Productos</h1>
        </div>
        <div className="space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Catálogo de Productos</h1>
        <Button asChild>
          <Link to="/catalogo/productos/nuevo">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {productosPorCategoria?.map((cat) => (
          <Collapsible 
            key={cat.id} 
            open={openCategories.includes(cat.id)}
            onOpenChange={() => toggleCategory(cat.id)}
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-4 h-auto border rounded-lg">
                <span className="font-semibold">{cat.nombre} ({cat.productos.length})</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border border-t-0 rounded-b-lg">
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 p-3 border-b bg-muted/50 text-sm font-medium">
                  <div>Producto</div>
                  <div>Tipo</div>
                  <div>Tarifa 1</div>
                  <div>Tarifa 2</div>
                  <div>Activo</div>
                </div>
                {cat.productos.map((p) => (
                  <Link
                    key={p.id}
                    to={`/catalogo/productos/${p.id}`}
                    className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 p-3 border-b last:border-0 items-center hover:bg-muted/30"
                  >
                    <div className="font-medium">{p.nombre}</div>
                    <div className="text-sm text-muted-foreground">{p.tipo_calculo}</div>
                    <div className="text-sm">
                      {p.tipo_calculo === 'por_metro' 
                        ? `${formatCurrency(p.precio_metro_tarifa_1 || 0)} (≤${p.metros_limite_tarifa_1}m²)`
                        : p.tipo_calculo === 'por_hora'
                        ? `${formatCurrency(p.precio_por_hora || 0)}/h`
                        : p.tipo_calculo === 'por_unidad'
                        ? `${formatCurrency(p.precio_por_unidad || 0)}/ud`
                        : '-'
                      }
                    </div>
                    <div className="text-sm">
                      {p.tipo_calculo === 'por_metro' 
                        ? `${formatCurrency(p.precio_metro_tarifa_2 || 0)} (>${p.metros_limite_tarifa_1}m²)`
                        : '-'
                      }
                    </div>
                    <div>{p.activo ? <Check className="w-4 h-4 text-green-500" /> : '-'}</div>
                  </Link>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
