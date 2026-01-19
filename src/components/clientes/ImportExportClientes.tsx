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
import { useQueryClient } from '@tanstack/react-query';

interface Cliente {
  id: string;
  nombre: string;
  nombre_comercial?: string | null;
  tipo_documento?: string | null;
  numero_documento?: string | null;
  email?: string | null;
  telefono?: string | null;
  telefono_secundario?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  provincia?: string | null;
  codigo_postal?: string | null;
  pais?: string | null;
  persona_contacto?: string | null;
  notas?: string | null;
  activo?: boolean | null;
}

interface ImportResult {
  created: number;
  updated: number;
  errors: string[];
}

export function ImportExportClientes({ clientes }: { clientes: Cliente[] | undefined }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const CSV_HEADERS = [
    'nombre',
    'nombre_comercial',
    'tipo_documento',
    'numero_documento',
    'email',
    'telefono',
    'telefono_secundario',
    'direccion',
    'ciudad',
    'provincia',
    'codigo_postal',
    'pais',
    'persona_contacto',
    'notas',
    'activo'
  ];

  const downloadTemplate = () => {
    const templateContent = [
      CSV_HEADERS.join(';'),
      `Empresa Ejemplo S.L.;Ejemplo Corp;CIF;B12345678;contacto@ejemplo.com;912345678;600123456;Calle Mayor 1;Madrid;Madrid;28001;España;Juan García;Cliente habitual;true`,
      `Autónomo Ejemplo;Taller Ejemplo;NIF;12345678A;autonomo@ejemplo.com;934567890;;;;Barcelona;Barcelona;08001;España;;Nuevo cliente;true`,
      '',
      '# INSTRUCCIONES:',
      '# - Separa los campos con punto y coma (;)',
      '# - El campo "nombre" es obligatorio',
      '# - tipo_documento puede ser: CIF, NIF, NIE, Pasaporte',
      '# - activo puede ser: true o false',
      '# - Si el numero_documento ya existe, el cliente se ACTUALIZARÁ en lugar de crearse',
      '# - Deja vacío los campos opcionales que no apliquen',
    ].join('\n');

    const blob = new Blob(['\ufeff' + templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla_clientes.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({ title: 'Plantilla descargada' });
  };

  const exportClientes = () => {
    if (!clientes || clientes.length === 0) {
      toast({ title: 'No hay clientes para exportar', variant: 'destructive' });
      return;
    }

    const rows = clientes.map(c => [
      c.nombre,
      c.nombre_comercial || '',
      c.tipo_documento || '',
      c.numero_documento || '',
      c.email || '',
      c.telefono || '',
      c.telefono_secundario || '',
      c.direccion || '',
      c.ciudad || '',
      c.provincia || '',
      c.codigo_postal || '',
      c.pais || '',
      c.persona_contacto || '',
      c.notas || '',
      c.activo !== false ? 'true' : 'false'
    ].join(';'));

    const csvContent = [CSV_HEADERS.join(';'), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: `${clientes.length} clientes exportados` });
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

      const dataRows = rows.slice(1);

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        const rowNum = i + 2;

        try {
          const [
            nombre, nombre_comercial, tipo_documento, numero_documento,
            email, telefono, telefono_secundario, direccion,
            ciudad, provincia, codigo_postal, pais,
            persona_contacto, notas, activo
          ] = row;

          if (!nombre) {
            result.errors.push(`Fila ${rowNum}: Nombre es obligatorio`);
            continue;
          }

          const clienteData = {
            nombre,
            nombre_comercial: nombre_comercial || null,
            tipo_documento: tipo_documento || 'NIF',
            numero_documento: numero_documento || null,
            email: email || null,
            telefono: telefono || null,
            telefono_secundario: telefono_secundario || null,
            direccion: direccion || null,
            ciudad: ciudad || null,
            provincia: provincia || null,
            codigo_postal: codigo_postal || null,
            pais: pais || 'España',
            persona_contacto: persona_contacto || null,
            notas: notas || null,
            activo: activo?.toLowerCase() !== 'false'
          };

          // Check if client with this document number already exists
          let existingClientId: string | null = null;
          if (numero_documento) {
            const existingClient = clientes?.find(
              c => c.numero_documento?.toLowerCase() === numero_documento.toLowerCase()
            );
            existingClientId = existingClient?.id || null;
          }

          if (existingClientId) {
            const { error } = await supabase
              .from('clientes')
              .update(clienteData)
              .eq('id', existingClientId);
            
            if (error) {
              result.errors.push(`Fila ${rowNum}: ${error.message}`);
            } else {
              result.updated++;
            }
          } else {
            const { error } = await supabase.from('clientes').insert(clienteData);
            
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
        queryClient.invalidateQueries({ queryKey: ['clientes'] });
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
          <DropdownMenuItem onClick={exportClientes}>
            <Download className="w-4 h-4 mr-2" />
            Exportar clientes (CSV)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={downloadTemplate}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Descargar plantilla
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Importar clientes
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resultado de la importación</DialogTitle>
            <DialogDescription>
              Se han procesado los clientes del archivo CSV
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
