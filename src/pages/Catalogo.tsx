import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Check, Wrench } from "lucide-react";
import { useProductos } from "@/hooks/useProductos";
import { useCategorias } from "@/hooks/useCategorias";
import { formatCurrency } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'por_metro': return 'm²';
      case 'por_hora': return 'hora';
      case 'por_unidad': return 'ud';
      case 'por_placa': return 'placa';
      default: return tipo;
    }
  };

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
              <Button variant="ghost" className="w-full justify-between p-4 h-auto border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-lg">{cat.nombre}</span>
                  <Badge variant="secondary">{cat.productos.length}</Badge>
                </div>
                <ChevronDown className="w-5 h-5 transition-transform duration-200" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border border-t-0 rounded-b-lg overflow-hidden">
                <div className="grid grid-cols-[1fr_80px_120px_120px_100px_60px] gap-2 p-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <div>Producto</div>
                  <div>Tipo</div>
                  <div>Precio/m²</div>
                  <div className="flex items-center gap-1">
                    <Wrench className="w-3 h-3" />
                    Montaje
                  </div>
                  <div>Tarifa 2</div>
                  <div className="text-center">Activo</div>
                </div>
                {cat.productos.map((p) => (
                  <Link
                    key={p.id}
                    to={`/catalogo/productos/${p.id}`}
                    className="grid grid-cols-[1fr_80px_120px_120px_100px_60px] gap-2 p-3 border-b last:border-0 items-center hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <span className="font-medium">{p.nombre}</span>
                      {p.descripcion && (
                        <p className="text-xs text-muted-foreground truncate">{p.descripcion}</p>
                      )}
                    </div>
                    <div>
                      <Badge variant="outline" className="text-xs">
                        {getTipoLabel(p.tipo_calculo || '')}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium">
                      {p.tipo_calculo === 'por_metro' && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">
                              {formatCurrency(p.precio_metro_tarifa_1 || 0)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Hasta {p.metros_limite_tarifa_1}m²</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {p.tipo_calculo === 'por_hora' && formatCurrency(p.precio_por_hora || 0)}
                      {p.tipo_calculo === 'por_unidad' && formatCurrency(p.precio_por_unidad || 0)}
                      {p.tipo_calculo === 'por_placa' && (
                        <span className="text-xs">
                          A4: {formatCurrency(p.precio_placa_a4 || 0)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm">
                      {p.precio_montaje && p.precio_montaje > 0 ? (
                        <span className="text-primary font-medium">
                          {formatCurrency(p.precio_montaje)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {p.tipo_calculo === 'por_metro' && p.precio_metro_tarifa_2 ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">
                              {formatCurrency(p.precio_metro_tarifa_2)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Más de {p.metros_limite_tarifa_1}m²</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        '-'
                      )}
                    </div>
                    <div className="text-center">
                      {p.activo ? (
                        <Check className="w-4 h-4 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </Link>
                ))}
                {cat.productos.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No hay productos en esta categoría
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
