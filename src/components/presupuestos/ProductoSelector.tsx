import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useProductos, useCalcularPrecio } from "@/hooks/useProductos";
import { useCategorias } from "@/hooks/useCategorias";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { Search, Wand2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { ProductoPersonalizadoDialog } from "./ProductoPersonalizadoDialog";

interface LineaLocal {
  id: string;
  producto_id: string | null;
  producto_nombre: string;
  producto_categoria: string;
  cantidad: number;
  tipo_cantidad: string;
  descripcion: string;
  precio_unitario: number;
  importe: number;
}

interface ProductoSelectorProps {
  open: boolean;
  onClose: () => void;
  onAdd: (linea: LineaLocal) => void;
}

export function ProductoSelector({ open, onClose, onAdd }: ProductoSelectorProps) {
  const { data: productos } = useProductos();
  const { data: categorias } = useCategorias();
  
  const [search, setSearch] = useState("");
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [productoId, setProductoId] = useState<string | null>(null);
  const [cantidadStr, setCantidadStr] = useState("1");
  const [tipoCantidad, setTipoCantidad] = useState("metros");
  const [descripcion, setDescripcion] = useState("");
  const [showPersonalizado, setShowPersonalizado] = useState(false);

  const productoSeleccionado = productos?.find(p => p.id === productoId);
  
  const cantidad = cantidadStr === '' ? 0 : Number(cantidadStr);
  
  const { data: precio, isLoading: loadingPrecio } = useCalcularPrecio(
    productoId || undefined,
    cantidad,
    tipoCantidad
  );

  // Reset on open
  useEffect(() => {
    if (open) {
      setSearch("");
      setCategoriaId(null);
      setProductoId(null);
      setCantidadStr("1");
      setTipoCantidad("metros");
      setDescripcion("");
    }
  }, [open]);

  // Update tipo_cantidad based on product
  useEffect(() => {
    if (productoSeleccionado) {
      switch (productoSeleccionado.tipo_calculo) {
        case 'por_metro':
          setTipoCantidad('metros');
          break;
        case 'por_unidad':
          setTipoCantidad('unidades');
          break;
        case 'por_hora':
          setTipoCantidad('horas');
          break;
        case 'por_placa':
          setTipoCantidad('placas_a4');
          break;
      }
    }
  }, [productoSeleccionado]);

  const productosFiltrados = productos?.filter(p => {
    if (categoriaId && p.categoria_id !== categoriaId) return false;
    if (search && !p.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAdd = () => {
    if (!productoSeleccionado || !precio) return;

    onAdd({
      id: '',
      producto_id: productoSeleccionado.id,
      producto_nombre: productoSeleccionado.nombre,
      producto_categoria: productoSeleccionado.categoria_nombre,
      cantidad,
      tipo_cantidad: tipoCantidad,
      descripcion,
      precio_unitario: precio.precio_unitario,
      importe: precio.importe_total
    });
  };

  const handleAddPersonalizado = (linea: LineaLocal) => {
    setShowPersonalizado(false);
    onAdd(linea);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Añadir Producto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Custom Product Button */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar producto..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowPersonalizado(true)}
              className="shrink-0"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Personalizado
            </Button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={categoriaId === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setCategoriaId(null)}
            >
              Todos
            </Badge>
            {categorias?.map(cat => (
              <Badge 
                key={cat.id}
                variant={categoriaId === cat.id ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setCategoriaId(cat.id)}
              >
                {cat.nombre}
              </Badge>
            ))}
          </div>

          {/* Product List */}
          {!productoId && (
            <div className="border rounded-lg max-h-96 overflow-auto">
              {productosFiltrados?.map(p => (
                <button
                  key={p.id}
                  className={cn(
                    "w-full text-left p-3 hover:bg-muted border-b last:border-0 transition-colors",
                    productoId === p.id && "bg-muted"
                  )}
                  onClick={() => setProductoId(p.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{p.nombre}</span>
                    <Badge variant="secondary" className="text-xs">{p.categoria_nombre}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {p.tipo_calculo === 'por_metro' && `${formatCurrency(p.precio_metro_tarifa_1 || 0)}/m²`}
                    {p.tipo_calculo === 'por_hora' && `${formatCurrency(p.precio_por_hora || 0)}/h`}
                    {p.tipo_calculo === 'por_unidad' && `${formatCurrency(p.precio_por_unidad || 0)}/ud`}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Selected Product */}
          {productoSeleccionado && (
            <div className="space-y-4 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{productoSeleccionado.nombre}</h3>
                  <p className="text-sm text-muted-foreground">{productoSeleccionado.categoria_nombre}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setProductoId(null)}>
                  Cambiar
                </Button>
              </div>

              {/* Quantity Input */}
              <div className="space-y-2">
                <Label>
                  {productoSeleccionado.tipo_calculo === 'por_metro' && 'Metros cuadrados'}
                  {productoSeleccionado.tipo_calculo === 'por_hora' && 'Horas'}
                  {productoSeleccionado.tipo_calculo === 'por_unidad' && 'Unidades'}
                  {productoSeleccionado.tipo_calculo === 'por_placa' && 'Cantidad de placas'}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={cantidadStr}
                    onChange={e => setCantidadStr(e.target.value)}
                    className="w-32"
                  />
                  <span className="text-muted-foreground">
                    {tipoCantidad === 'metros' && 'm²'}
                    {tipoCantidad === 'horas' && 'h'}
                    {tipoCantidad === 'unidades' && 'uds'}
                    {tipoCantidad.startsWith('placas') && 'placas'}
                  </span>
                </div>
              </div>

              {/* Placa type selector */}
              {productoSeleccionado.tipo_calculo === 'por_placa' && (
                <div className="space-y-2">
                  <Label>Tamaño de placa</Label>
                  <RadioGroup value={tipoCantidad} onValueChange={setTipoCantidad}>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="placas_a4" id="a4" />
                        <Label htmlFor="a4">A4 ({formatCurrency(productoSeleccionado.precio_placa_a4 || 0)})</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="placas_a3" id="a3" />
                        <Label htmlFor="a3">A3 ({formatCurrency(productoSeleccionado.precio_placa_a3 || 0)})</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Price Breakdown - Fixed height container */}
              <div className="bg-muted/50 rounded-lg p-4 min-h-[140px]">
                {precio ? (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Cálculo del precio</h4>
                    {precio.desglose.precio_fijo !== undefined && precio.desglose.precio_fijo > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Precio fijo:</span>
                        <span>{formatCurrency(precio.desglose.precio_fijo)}</span>
                      </div>
                    )}
                    {precio.desglose.metros_tarifa_1 !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span>{formatNumber(precio.desglose.metros_tarifa_1)} m² × {formatCurrency(precio.desglose.precio_metro_tarifa_1 || 0)}/m²:</span>
                        <span>{formatCurrency(precio.desglose.importe_tarifa_1 || 0)}</span>
                      </div>
                    )}
                    {precio.desglose.metros_tarifa_2 !== undefined && precio.desglose.metros_tarifa_2 > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>{formatNumber(precio.desglose.metros_tarifa_2)} m² × {formatCurrency(precio.desglose.precio_metro_tarifa_2 || 0)}/m²:</span>
                        <span>{formatCurrency(precio.desglose.importe_tarifa_2 || 0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>TOTAL:</span>
                      <span>{formatCurrency(precio.importe_total)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Precio medio: {formatCurrency(precio.precio_unitario)}/{tipoCantidad === 'metros' ? 'm²' : tipoCantidad === 'horas' ? 'h' : 'ud'}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    Introduce una cantidad para ver el cálculo
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Descripción adicional (opcional)</Label>
                <Textarea
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Ej: Rotulación fachada principal"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-4">
            {productoSeleccionado && (cantidadStr === '' || cantidad <= 0) && (
              <p className="text-sm text-destructive text-right">
                Introduce una cantidad válida mayor que 0
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button 
                onClick={handleAdd} 
                disabled={!productoSeleccionado || !precio || cantidad <= 0}
              >
                Añadir
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <ProductoPersonalizadoDialog
      open={showPersonalizado}
      onClose={() => setShowPersonalizado(false)}
      onAdd={handleAddPersonalizado}
    />
    </>
  );
}
