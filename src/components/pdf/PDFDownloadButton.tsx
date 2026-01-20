import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { ReactElement } from 'react';

interface PDFDownloadButtonProps {
  document: ReactElement;
  fileName: string;
}

export function PDFDownloadButton({ document, fileName }: PDFDownloadButtonProps) {
  return (
    <PDFDownloadLink
      document={document}
      fileName={fileName}
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
