import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { Tables } from '@/integrations/supabase/types';
import { getMetodoPagoLabel } from '@/lib/formatters';

Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf'
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  empresa: {
    flex: 1,
  },
  empresaNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  empresaInfo: {
    fontSize: 9,
    color: '#666',
    lineHeight: 1.4,
  },
  facturaInfo: {
    textAlign: 'right',
    alignItems: 'flex-end',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  numero: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  fecha: {
    fontSize: 9,
    color: '#666',
  },
  seccion: {
    marginBottom: 20,
  },
  seccionTitulo: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cliente: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 4,
  },
  clienteNombre: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  clienteInfo: {
    fontSize: 9,
    color: '#666',
    lineHeight: 1.4,
  },
  tabla: {
    marginTop: 10,
  },
  tablaHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f4',
    padding: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    fontWeight: 'bold',
    fontSize: 9,
  },
  tablaRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 8,
    minHeight: 32,
  },
  colConcepto: {
    flex: 3,
  },
  colCantidad: {
    flex: 1,
    textAlign: 'right',
  },
  colPrecio: {
    flex: 1,
    textAlign: 'right',
  },
  colImporte: {
    flex: 1,
    textAlign: 'right',
  },
  productoNombre: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  productoDescripcion: {
    fontSize: 8,
    color: '#666',
    marginTop: 2,
  },
  totales: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    width: 200,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalFinal: {
    borderTopWidth: 2,
    borderTopColor: '#333',
    marginTop: 4,
    paddingTop: 8,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  totalValor: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  notas: {
    marginTop: 30,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  notasTitulo: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  notasTexto: {
    fontSize: 9,
    color: '#555',
    lineHeight: 1.4,
  },
  footer: {
    marginTop: 30,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  footerTitulo: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#666',
  },
  footerTexto: {
    fontSize: 8,
    color: '#888',
    lineHeight: 1.4,
  },
  datosBancarios: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  datosBancariosTitulo: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  datosBancariosInfo: {
    fontSize: 9,
    color: '#555',
    lineHeight: 1.5,
  },
});

interface FacturaPDFProps {
  factura: Tables<'facturas'>;
  lineas: Array<{
    id: string;
    producto_nombre: string;
    descripcion: string | null;
    cantidad: number;
    tipo_cantidad: string;
    precio_unitario: number;
    importe: number;
  }>;
  config: Tables<'empresa_config'>;
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '0,00 €';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
}

function formatDate(date: string | null | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('es-ES');
}

function getTipoUnidad(tipo: string): string {
  switch (tipo) {
    case 'metros': return 'm²';
    case 'unidades': return 'uds';
    case 'horas': return 'h';
    case 'placas_a3': return 'A3';
    case 'placas_a4': return 'A4';
    default: return '';
  }
}

export function FacturaPDF({ factura, lineas, config }: FacturaPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Custom Header Text */}
        {config.texto_factura_cabecera && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 9, color: '#666', textAlign: 'center' }}>
              {config.texto_factura_cabecera}
            </Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.empresa}>
            <Text style={styles.empresaNombre}>{config.nombre_empresa}</Text>
            <Text style={styles.empresaInfo}>
              {config.cif && `CIF: ${config.cif}\n`}
              {config.direccion && `${config.direccion}\n`}
              {config.ciudad && `${config.codigo_postal} ${config.ciudad}\n`}
              {config.telefono && `Tel: ${config.telefono}\n`}
              {config.email}
            </Text>
          </View>
          <View style={styles.facturaInfo}>
            <Text style={styles.titulo}>FACTURA</Text>
            <Text style={styles.numero}>Nº: {factura.numero}</Text>
            <Text style={styles.fecha}>Fecha: {formatDate(factura.fecha_emision)}</Text>
            {factura.fecha_vencimiento && (
              <Text style={styles.fecha}>Vencimiento: {formatDate(factura.fecha_vencimiento)}</Text>
            )}
          </View>
        </View>

        {/* Cliente */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>CLIENTE</Text>
          <View style={styles.cliente}>
            <Text style={styles.clienteNombre}>{factura.cliente_nombre}</Text>
            <Text style={styles.clienteInfo}>
              {factura.cliente_nombre_comercial && `${factura.cliente_nombre_comercial}\n`}
              {factura.cliente_documento && `${factura.cliente_documento}\n`}
              {factura.cliente_direccion && `${factura.cliente_direccion}\n`}
              {factura.cliente_ciudad && `${factura.cliente_codigo_postal} ${factura.cliente_ciudad}\n`}
              {factura.cliente_telefono && `Tel: ${factura.cliente_telefono} `}
              {factura.cliente_email && `| ${factura.cliente_email}`}
            </Text>
          </View>
        </View>

        {/* Tabla de conceptos */}
        <View style={styles.tabla}>
          <View style={styles.tablaHeader}>
            <Text style={styles.colConcepto}>CONCEPTO</Text>
            <Text style={styles.colCantidad}>CANT.</Text>
            <Text style={styles.colPrecio}>PRECIO</Text>
            <Text style={styles.colImporte}>IMPORTE</Text>
          </View>
          
          {lineas.map((linea) => (
            <View key={linea.id} style={styles.tablaRow}>
              <View style={styles.colConcepto}>
                <Text style={styles.productoNombre}>{linea.producto_nombre}</Text>
                {linea.descripcion && (
                  <Text style={styles.productoDescripcion}>{linea.descripcion}</Text>
                )}
              </View>
              <Text style={styles.colCantidad}>
                {linea.cantidad} {getTipoUnidad(linea.tipo_cantidad)}
              </Text>
              <Text style={styles.colPrecio}>{formatCurrency(linea.precio_unitario)}</Text>
              <Text style={styles.colImporte}>{formatCurrency(linea.importe)}</Text>
            </View>
          ))}
        </View>

        {/* Totales */}
        <View style={styles.totales}>
          <View style={styles.totalRow}>
            <Text>SUBTOTAL:</Text>
            <Text>{formatCurrency(factura.subtotal)}</Text>
          </View>
          {(factura.descuento_importe || 0) > 0 && (
            <View style={styles.totalRow}>
              <Text>Descuento{factura.descuento_tipo === 'porcentaje' ? ` (${factura.descuento_valor}%)` : ''}:</Text>
              <Text>-{formatCurrency(factura.descuento_importe)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text>BASE IMPONIBLE:</Text>
            <Text>{formatCurrency(factura.base_imponible)}</Text>
          </View>
          {(factura.iva_porcentaje || 0) > 0 && (
            <View style={styles.totalRow}>
              <Text>IVA ({factura.iva_porcentaje}%):</Text>
              <Text>{formatCurrency(factura.iva_importe)}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.totalFinal]}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalValor}>{formatCurrency(factura.total)}</Text>
          </View>
        </View>

        {/* Método de pago */}
        {(factura as any).metodo_pago && (
          <View style={styles.notas}>
            <Text style={styles.notasTitulo}>FORMA DE PAGO</Text>
            <Text style={styles.notasTexto}>
              {getMetodoPagoLabel((factura as any).metodo_pago)}
            </Text>
          </View>
        )}

        {/* Datos bancarios (solo si método es transferencia o domiciliación) */}
        {((factura as any).metodo_pago === 'transferencia' || (factura as any).metodo_pago === 'domiciliacion') && (config.cuenta_bancaria || config.iban) && (
          <View style={styles.datosBancarios}>
            <Text style={styles.datosBancariosTitulo}>DATOS PARA EL PAGO</Text>
            <Text style={styles.datosBancariosInfo}>
              {config.iban && `IBAN: ${config.iban}\n`}
              {config.cuenta_bancaria && `Cuenta: ${config.cuenta_bancaria}`}
            </Text>
          </View>
        )}

        {/* Notas */}
        {factura.notas && (
          <View style={styles.notas}>
            <Text style={styles.notasTitulo}>OBSERVACIONES</Text>
            <Text style={styles.notasTexto}>{factura.notas}</Text>
          </View>
        )}

        {/* Footer */}
        {config.texto_factura_pie && (
          <View style={styles.footer}>
            <Text style={styles.footerTexto}>{config.texto_factura_pie}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
