import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, Trash2, X } from "lucide-react";
import { useProductos } from "@/hooks/useProductos";
import { useCategorias } from "@/hooks/useCategorias";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { PriceCalculator } from "@/components/catalogo/PriceCalculator";
import { ImportExportProducts } from "@/components/catalogo/ImportExportProducts";
import { CreateCategoriaDialog } from "@/components/catalogo/CreateCategoriaDialog";
import { CategoryActions } from "@/components/catalogo/CategoryActions";
import { ProductCard } from "@/components/catalogo/ProductCard";
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

  if (loadingProductos || loadingCategorias) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Catálogo de Productos</h1>
        </div>
        <div className="space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Catálogo de Productos</h1>
        
        <div className="flex flex-wrap items-center gap-2">
          {selectionMode ? (
            <>
              <span className="text-sm text-muted-foreground">
                {selectedProducts.size} seleccionados
              </span>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={selectedProducts.size === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
              <Button variant="outline" size="sm" onClick={exitSelectionMode}>
                <X className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Cancelar</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setSelectionMode(true)}>
                <Trash2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
              <ImportExportProducts productos={productos} />
              <CreateCategoriaDialog />
              <Button size="sm" asChild>
                <Link to="/catalogo/productos/nuevo">
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Nuevo</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3 md:space-y-4">
        {productosPorCategoria?.map((cat) => (
          <Collapsible 
            key={cat.id} 
            open={openCategories.includes(cat.id)}
            onOpenChange={() => toggleCategory(cat.id)}
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-3 md:p-4 h-auto border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-2 md:gap-3">
                  {selectionMode && cat.productos.length > 0 && (
                    <Checkbox 
                      checked={cat.productos.every(p => selectedProducts.has(p.id!))}
                      onCheckedChange={() => toggleSelectAll(cat.productos)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  <span className="font-semibold text-base md:text-lg">{cat.nombre}</span>
                  <Badge variant="secondary" className="text-xs">{cat.productos.length}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  {!selectionMode && (
                    <CategoryActions categoria={cat} productCount={cat.productos.length} />
                  )}
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${openCategories.includes(cat.id) ? 'rotate-180' : ''}`} />
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border border-t-0 rounded-b-lg overflow-hidden divide-y">
                {cat.productos.map((p) => (
                  <div key={p.id}>
                    <ProductCard
                      producto={p}
                      selectionMode={selectionMode}
                      isSelected={selectedProducts.has(p.id!)}
                      showCalculator={calculatorProductId === p.id}
                      onToggleSelection={(e) => toggleProductSelection(e, p.id!)}
                      onToggleCalculator={(e) => toggleCalculator(e, p.id!)}
                    />
                    {calculatorProductId === p.id && !selectionMode && (
                      <div className="px-3 pb-3">
                        <PriceCalculator 
                          producto={p} 
                          onClose={() => setCalculatorProductId(null)} 
                        />
                      </div>
                    )}
                  </div>
                ))}
                {cat.productos.length === 0 && (
                  <div className="p-6 md:p-8 text-center text-muted-foreground">
                    No hay productos en esta categoría
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}

        {(!productosPorCategoria || productosPorCategoria.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No hay categorías creadas.</p>
            <p className="text-sm mt-1">Crea una categoría para añadir productos.</p>
          </div>
        )}
      </div>

      {/* Delete products dialog */}
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
