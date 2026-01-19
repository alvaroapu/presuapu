import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { PresupuestoPDF } from './PresupuestoPDF';
import type { Tables } from '@/integrations/supabase/types';

interface PDFDownloadButtonProps {
  presupuesto: Tables<'presupuestos'>;
  lineas: Tables<'presupuesto_lineas'>[];
  config: Tables<'empresa_config'>;
}

export function PDFDownloadButton({ presupuesto, lineas, config }: PDFDownloadButtonProps) {
  return (
    <PDFDownloadLink
      document={
        <PresupuestoPDF 
          presupuesto={presupuesto} 
          lineas={lineas} 
          config={config} 
        />
      }
      fileName={`${presupuesto.numero}.pdf`}
    >
      {({ loading }) => (
        <Button variant="outline" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4 mr-2" />
              Descargar PDF
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
