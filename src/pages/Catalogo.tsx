import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Check, Wrench, Calculator, ChevronDown, Trash2, X } from "lucide-react";
import { useProductos } from "@/hooks/useProductos";
import { useCategorias } from "@/hooks/useCategorias";
import { formatCurrency } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PriceCalculator } from "@/components/catalogo/PriceCalculator";
import { ImportExportProducts } from "@/components/catalogo/ImportExportProducts";
import { CreateCategoriaDialog } from "@/components/catalogo/CreateCategoriaDialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Catalogo() {
  const { data: productos, isLoading: loadingProductos } = useProductos();
  const { data: categorias, isLoading: loadingCategorias } = useCategorias();
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [calculatorProductId, setCalculatorProductId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const toggleCategory = (id: string) => {
    setOpenCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleCalculator = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setCalculatorProductId(prev => prev === productId ? null : productId);
  };

  const toggleProductSelection = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = (categoryProducts: { id?: string }[]) => {
    const categoryIds = categoryProducts.map(p => p.id!).filter(Boolean);
    const allSelected = categoryIds.every(id => selectedProducts.has(id));
    
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (allSelected) {
        categoryIds.forEach(id => newSet.delete(id));
      } else {
        categoryIds.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedProducts(new Set());
  };

  const handleDeleteSelected = async () => {
    if (selectedProducts.size === 0) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .in('id', Array.from(selectedProducts));
      
      if (error) throw error;
      
      toast({ title: `${selectedProducts.size} productos eliminados` });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      exitSelectionMode();
    } catch (err) {
      toast({ 
        title: 'Error al eliminar', 
        description: err instanceof Error ? err.message : 'Error desconocido',
        variant: 'destructive' 
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
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
        <div className="flex items-center gap-2">
          {selectionMode ? (
            <>
              <span className="text-sm text-muted-foreground">
                {selectedProducts.size} seleccionados
              </span>
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteDialog(true)}
                disabled={selectedProducts.size === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
              <Button variant="outline" onClick={exitSelectionMode}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setSelectionMode(true)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar productos
              </Button>
              <ImportExportProducts productos={productos} />
              <CreateCategoriaDialog />
              <Button asChild>
                <Link to="/catalogo/productos/nuevo">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Producto
                </Link>
              </Button>
            </>
          )}
        </div>
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
                <div className={`grid gap-2 p-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wide ${selectionMode ? 'grid-cols-[40px_1fr_80px_120px_120px_100px_60px]' : 'grid-cols-[1fr_80px_120px_120px_100px_60px_50px]'}`}>
                  {selectionMode && (
                    <div className="flex items-center justify-center">
                      <Checkbox 
                        checked={cat.productos.length > 0 && cat.productos.every(p => selectedProducts.has(p.id!))}
                        onCheckedChange={() => toggleSelectAll(cat.productos)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                  <div>Producto</div>
                  <div>Tipo</div>
                  <div>Precio/m²</div>
                  <div className="flex items-center gap-1">
                    <Wrench className="w-3 h-3" />
                    Montaje
                  </div>
                  <div>Tarifa 2</div>
                  <div className="text-center">{selectionMode ? '' : 'Activo'}</div>
                  {!selectionMode && (
                    <div className="text-center">
                      <Calculator className="w-3 h-3 mx-auto" />
                    </div>
                  )}
                </div>
                {cat.productos.map((p) => (
                  <div key={p.id} className="border-b last:border-0">
                    {selectionMode ? (
                      <div
                        onClick={(e) => toggleProductSelection(e, p.id!)}
                        className={`grid grid-cols-[40px_1fr_80px_120px_120px_100px_60px] gap-2 p-3 items-center cursor-pointer transition-colors ${selectedProducts.has(p.id!) ? 'bg-primary/10' : 'hover:bg-muted/30'}`}
                      >
                        <div className="flex items-center justify-center">
                          <Checkbox 
                            checked={selectedProducts.has(p.id!)}
                            onClick={(e) => e.stopPropagation()}
                            onCheckedChange={() => {
                              setSelectedProducts(prev => {
                                const newSet = new Set(prev);
                                if (newSet.has(p.id!)) {
                                  newSet.delete(p.id!);
                                } else {
                                  newSet.add(p.id!);
                                }
                                return newSet;
                              });
                            }}
                          />
                        </div>
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
                          {p.tipo_calculo === 'por_metro' && formatCurrency(p.precio_metro_tarifa_1 || 0)}
                          {p.tipo_calculo === 'por_hora' && formatCurrency(p.precio_por_hora || 0)}
                          {p.tipo_calculo === 'por_unidad' && formatCurrency(p.precio_por_unidad || 0)}
                          {p.tipo_calculo === 'por_placa' && (
                            <span className="text-xs">A4: {formatCurrency(p.precio_placa_a4 || 0)}</span>
                          )}
                        </div>
                        <div className="text-sm">
                          {p.precio_montaje && p.precio_montaje > 0 ? (
                            <span className="text-primary font-medium">{formatCurrency(p.precio_montaje)}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {p.tipo_calculo === 'por_metro' && p.precio_metro_tarifa_2 
                            ? formatCurrency(p.precio_metro_tarifa_2) 
                            : '-'}
                        </div>
                        <div className="text-center">
                          {p.activo ? (
                            <Check className="w-4 h-4 text-primary mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <Link
                          to={`/catalogo/productos/${p.id}`}
                          className="grid grid-cols-[1fr_80px_120px_120px_100px_60px_50px] gap-2 p-3 items-center hover:bg-muted/30 transition-colors"
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
                              <Check className="w-4 h-4 text-primary mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                          <div className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => toggleCalculator(e, p.id!)}
                            >
                              <Calculator className={`w-4 h-4 ${calculatorProductId === p.id ? 'text-primary' : 'text-muted-foreground'}`} />
                            </Button>
                          </div>
                        </Link>
                        {calculatorProductId === p.id && (
                          <div className="px-3 pb-3">
                            <PriceCalculator 
                              producto={p} 
                              onClose={() => setCalculatorProductId(null)} 
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {selectedProducts.size} productos?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Los productos seleccionados serán eliminados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSelected}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
