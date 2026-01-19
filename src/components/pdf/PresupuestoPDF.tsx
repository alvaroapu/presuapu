import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { Tables } from '@/integrations/supabase/types';

// Register default font
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
  presupuestoInfo: {
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
  condiciones: {
    marginTop: 30,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  condicionesTitulo: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#666',
  },
  condicionesTexto: {
    fontSize: 8,
    color: '#888',
    lineHeight: 1.4,
  },
});

interface PresupuestoPDFProps {
  presupuesto: Tables<'presupuestos'>;
  lineas: Tables<'presupuesto_lineas'>[];
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

export function PresupuestoPDF({ presupuesto, lineas, config }: PresupuestoPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
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
          <View style={styles.presupuestoInfo}>
            <Text style={styles.titulo}>PRESUPUESTO</Text>
            <Text style={styles.numero}>Nº: {presupuesto.numero}</Text>
            <Text style={styles.fecha}>Fecha: {formatDate(presupuesto.fecha_emision)}</Text>
            <Text style={styles.fecha}>Válido hasta: {formatDate(presupuesto.fecha_validez)}</Text>
          </View>
        </View>

        {/* Cliente */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>CLIENTE</Text>
          <View style={styles.cliente}>
            <Text style={styles.clienteNombre}>{presupuesto.cliente_nombre}</Text>
            <Text style={styles.clienteInfo}>
              {presupuesto.cliente_nombre_comercial && `${presupuesto.cliente_nombre_comercial}\n`}
              {presupuesto.cliente_documento && `${presupuesto.cliente_documento}\n`}
              {presupuesto.cliente_direccion && `${presupuesto.cliente_direccion}\n`}
              {presupuesto.cliente_ciudad && `${presupuesto.cliente_codigo_postal} ${presupuesto.cliente_ciudad}\n`}
              {presupuesto.cliente_telefono && `Tel: ${presupuesto.cliente_telefono} `}
              {presupuesto.cliente_email && `| ${presupuesto.cliente_email}`}
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
            <Text>{formatCurrency(presupuesto.subtotal)}</Text>
          </View>
          {(presupuesto.descuento_importe || 0) > 0 && (
            <View style={styles.totalRow}>
              <Text>Descuento{presupuesto.descuento_tipo === 'porcentaje' ? ` (${presupuesto.descuento_valor}%)` : ''}:</Text>
              <Text>-{formatCurrency(presupuesto.descuento_importe)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text>BASE IMPONIBLE:</Text>
            <Text>{formatCurrency(presupuesto.base_imponible)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>IVA ({presupuesto.iva_porcentaje || 21}%):</Text>
            <Text>{formatCurrency(presupuesto.iva_importe)}</Text>
          </View>
          <View style={[styles.totalRow, styles.totalFinal]}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalValor}>{formatCurrency(presupuesto.total)}</Text>
          </View>
        </View>

        {/* Notas */}
        {presupuesto.notas && (
          <View style={styles.notas}>
            <Text style={styles.notasTitulo}>OBSERVACIONES</Text>
            <Text style={styles.notasTexto}>{presupuesto.notas}</Text>
          </View>
        )}

        {/* Condiciones */}
        <View style={styles.condiciones}>
          <Text style={styles.condicionesTitulo}>CONDICIONES</Text>
          <Text style={styles.condicionesTexto}>
            {config.condiciones_pago && `${config.condiciones_pago}\n`}
            {config.pie_presupuesto}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
