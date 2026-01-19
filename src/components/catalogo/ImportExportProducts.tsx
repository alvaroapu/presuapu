import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCategorias } from '@/hooks/useCategorias';
import { useQueryClient } from '@tanstack/react-query';

interface Producto {
  id?: string;
  nombre: string;
  categoria_id: string;
  codigo?: string;
  descripcion?: string;
  tipo_calculo: string;
  precio_metro_tarifa_1?: number;
  precio_metro_tarifa_2?: number;
  metros_limite_tarifa_1?: number;
  precio_montaje?: number;
  precio_preparacion?: number;
  precio_material?: number;
  precio_por_unidad?: number;
  precio_por_hora?: number;
  precio_placa_a4?: number;
  precio_placa_a3?: number;
  activo?: boolean;
}

interface ImportResult {
  created: number;
  updated: number;
  errors: string[];
}

export function ImportExportProducts({ productos }: { productos: Producto[] | undefined }) {
  const { toast } = useToast();
  const { data: categorias } = useCategorias();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const CSV_HEADERS = [
    'nombre',
    'categoria',
    'codigo',
    'descripcion',
    'tipo_calculo',
    'precio_metro_tarifa_1',
    'precio_metro_tarifa_2',
    'metros_limite_tarifa_1',
    'precio_montaje',
    'precio_preparacion',
    'precio_material',
    'precio_por_unidad',
    'precio_por_hora',
    'precio_placa_a4',
    'precio_placa_a3',
    'activo'
  ];

  const downloadTemplate = () => {
    const categoriasExample = categorias?.map(c => c.nombre).join(' | ') || 'Nombre categoría';
    
    const templateContent = [
      CSV_HEADERS.join(';'),
      `Ejemplo Vinilo;Vinilos;VIN001;Vinilo de alta calidad;por_metro;45;40;10;5;2;30;;;;;;;true`,
      `Ejemplo Servicio;Servicios;SRV001;Diseño gráfico;por_hora;;;;;;;;28;;;;;true`,
      `Ejemplo Unidad;Papel;PAP001;Polipropileno A1;por_unidad;;;;;;;;17;;;;true`,
      '',
      '# INSTRUCCIONES:',
      '# - Separa los campos con punto y coma (;)',
      '# - El campo "nombre" es obligatorio',
      `# - El campo "categoria" debe coincidir exactamente con: ${categoriasExample}`,
      '# - tipo_calculo puede ser: por_metro, por_hora, por_unidad, por_placa',
      '# - activo puede ser: true o false',
      '# - Los campos numéricos usan punto (.) como decimal',
      '# - Deja vacío los campos que no apliquen al tipo de producto',
      '# - Si el código ya existe, el producto se ACTUALIZARÁ en lugar de crearse',
    ].join('\n');

    const blob = new Blob(['\ufeff' + templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla_productos.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({ title: 'Plantilla descargada' });
  };

  const exportProducts = () => {
    if (!productos || productos.length === 0) {
      toast({ title: 'No hay productos para exportar', variant: 'destructive' });
      return;
    }

    const getCategoryName = (catId: string) => {
      return categorias?.find(c => c.id === catId)?.nombre || '';
    };

    const rows = productos.map(p => [
      p.nombre,
      getCategoryName(p.categoria_id),
      p.codigo || '',
      p.descripcion || '',
      p.tipo_calculo,
      p.precio_metro_tarifa_1 || '',
      p.precio_metro_tarifa_2 || '',
      p.metros_limite_tarifa_1 || '',
      p.precio_montaje || '',
      p.precio_preparacion || '',
      p.precio_material || '',
      p.precio_por_unidad || '',
      p.precio_por_hora || '',
      p.precio_placa_a4 || '',
      p.precio_placa_a3 || '',
      p.activo !== false ? 'true' : 'false'
    ].join(';'));

    const csvContent = [CSV_HEADERS.join(';'), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `productos_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: `${productos.length} productos exportados` });
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() && !line.startsWith('#'));
    return lines.map(line => line.split(';').map(cell => cell.trim()));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const result: ImportResult = { created: 0, updated: 0, errors: [] };

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      if (rows.length < 2) {
        throw new Error('El archivo está vacío o solo tiene encabezados');
      }

      // Skip header row
      const dataRows = rows.slice(1);

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        const rowNum = i + 2; // +2 because of header and 0-index

        try {
          const [
            nombre, categoria, codigo, descripcion, tipo_calculo,
            precio_metro_tarifa_1, precio_metro_tarifa_2, metros_limite_tarifa_1,
            precio_montaje, precio_preparacion, precio_material,
            precio_por_unidad, precio_por_hora, precio_placa_a4, precio_placa_a3,
            activo
          ] = row;

          if (!nombre) {
            result.errors.push(`Fila ${rowNum}: Nombre es obligatorio`);
            continue;
          }

          const cat = categorias?.find(c => c.nombre.toLowerCase() === categoria?.toLowerCase());
          if (!cat) {
            result.errors.push(`Fila ${rowNum}: Categoría "${categoria}" no encontrada`);
            continue;
          }

          const validTipos = ['por_metro', 'por_hora', 'por_unidad', 'por_placa'];
          if (!validTipos.includes(tipo_calculo)) {
            result.errors.push(`Fila ${rowNum}: Tipo de cálculo "${tipo_calculo}" no válido`);
            continue;
          }

          const parseNum = (val: string) => {
            if (!val || val === '') return null;
            const num = parseFloat(val.replace(',', '.'));
            return isNaN(num) ? null : num;
          };

          const productoData = {
            nombre,
            categoria_id: cat.id,
            codigo: codigo || null,
            descripcion: descripcion || null,
            tipo_calculo,
            precio_metro_tarifa_1: parseNum(precio_metro_tarifa_1),
            precio_metro_tarifa_2: parseNum(precio_metro_tarifa_2),
            metros_limite_tarifa_1: parseNum(metros_limite_tarifa_1),
            precio_montaje: parseNum(precio_montaje),
            precio_preparacion: parseNum(precio_preparacion),
            precio_material: parseNum(precio_material),
            precio_por_unidad: parseNum(precio_por_unidad),
            precio_por_hora: parseNum(precio_por_hora),
            precio_placa_a4: parseNum(precio_placa_a4),
            precio_placa_a3: parseNum(precio_placa_a3),
            activo: activo?.toLowerCase() !== 'false'
          };

          // Check if product with this code already exists
          let existingProductId: string | null = null;
          if (codigo) {
            const existingProduct = productos?.find(
              p => p.codigo?.toLowerCase() === codigo.toLowerCase()
            );
            existingProductId = existingProduct?.id || null;
          }

          if (existingProductId) {
            // Update existing product
            const { error } = await supabase
              .from('productos')
              .update(productoData)
              .eq('id', existingProductId);
            
            if (error) {
              result.errors.push(`Fila ${rowNum}: ${error.message}`);
            } else {
              result.updated++;
            }
          } else {
            // Insert new product
            const { error } = await supabase.from('productos').insert(productoData);
            
            if (error) {
              result.errors.push(`Fila ${rowNum}: ${error.message}`);
            } else {
              result.created++;
            }
          }
        } catch {
          result.errors.push(`Fila ${rowNum}: Error al procesar`);
        }
      }

      setImportResult(result);
      setShowResultDialog(true);
      
      if (result.created > 0 || result.updated > 0) {
        queryClient.invalidateQueries({ queryKey: ['productos'] });
      }
    } catch (err) {
      toast({ 
        title: 'Error al importar', 
        description: err instanceof Error ? err.message : 'Error desconocido',
        variant: 'destructive' 
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={importing}>
            {importing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 mr-2" />
            )}
            Importar/Exportar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={exportProducts}>
            <Download className="w-4 h-4 mr-2" />
            Exportar productos (CSV)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={downloadTemplate}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Descargar plantilla
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Importar productos
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resultado de la importación</DialogTitle>
            <DialogDescription>
              Se han procesado los productos del archivo CSV
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 p-4 bg-primary/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">
                  {importResult?.created || 0}
                </p>
                <p className="text-sm text-primary/80">Creados</p>
              </div>
              <div className="flex-1 p-4 bg-accent/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-accent-foreground">
                  {importResult?.updated || 0}
                </p>
                <p className="text-sm text-muted-foreground">Actualizados</p>
              </div>
              <div className="flex-1 p-4 bg-destructive/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-destructive">
                  {importResult?.errors.length || 0}
                </p>
                <p className="text-sm text-destructive/80">Errores</p>
              </div>
            </div>
            {importResult?.errors && importResult.errors.length > 0 && (
              <div className="max-h-40 overflow-auto border rounded-lg p-3 bg-muted/50">
                <p className="text-sm font-medium mb-2">Detalles de errores:</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {importResult.errors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}
            <Button onClick={() => setShowResultDialog(false)} className="w-full">
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
