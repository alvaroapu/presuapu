// Types for the CRM Presupuestos database

export interface EmpresaConfig {
  id: string;
  nombre_empresa: string;
  cif: string | null;
  direccion: string | null;
  ciudad: string | null;
  codigo_postal: string | null;
  telefono: string | null;
  email: string | null;
  web: string | null;
  logo_url: string | null;
  prefijo_presupuesto: string;
  iva_porcentaje: number;
  validez_dias: number;
  condiciones_pago: string | null;
  pie_presupuesto: string | null;
  created_at: string;
  updated_at: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface Producto {
  id: string;
  categoria_id: string;
  nombre: string;
  codigo: string | null;
  descripcion: string | null;
  tipo_calculo: 'por_metro' | 'por_unidad' | 'por_hora' | 'por_placa';
  precio_material: number;
  precio_preparacion: number;
  precio_montaje: number;
  precio_base_fijo: number;
  precio_metro_tarifa_1: number;
  metros_limite_tarifa_1: number;
  precio_metro_tarifa_2: number;
  precio_por_unidad: number | null;
  precio_por_hora: number | null;
  precio_placa_a3: number | null;
  precio_placa_a4: number | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductoConCategoria extends Producto {
  categoria_nombre: string;
  categoria_orden: number;
}

export interface Cliente {
  id: string;
  nombre: string;
  nombre_comercial: string | null;
  tipo_documento: string;
  numero_documento: string | null;
  email: string | null;
  telefono: string | null;
  telefono_secundario: string | null;
  direccion: string | null;
  ciudad: string | null;
  provincia: string | null;
  codigo_postal: string | null;
  pais: string;
  persona_contacto: string | null;
  notas: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClienteConStats extends Cliente {
  total_presupuestos: number;
  presupuestos_aceptados: number;
  facturacion_total: number | null;
  ultimo_presupuesto: string | null;
}

export type EstadoPresupuesto = 'borrador' | 'enviado' | 'aceptado' | 'rechazado' | 'facturado' | 'cancelado';

export interface Presupuesto {
  id: string;
  numero: string;
  cliente_id: string | null;
  cliente_nombre: string;
  cliente_nombre_comercial: string | null;
  cliente_documento: string | null;
  cliente_email: string | null;
  cliente_telefono: string | null;
  cliente_direccion: string | null;
  cliente_ciudad: string | null;
  cliente_codigo_postal: string | null;
  fecha_emision: string;
  fecha_validez: string | null;
  subtotal: number;
  descuento_tipo: 'porcentaje' | 'importe';
  descuento_valor: number;
  descuento_importe: number;
  base_imponible: number;
  iva_porcentaje: number;
  iva_importe: number;
  total: number;
  estado: EstadoPresupuesto;
  fecha_envio: string | null;
  fecha_respuesta: string | null;
  notas: string | null;
  notas_internas: string | null;
  referencia_cliente: string | null;
  created_at: string;
  updated_at: string;
}

export interface PresupuestoCompleto extends Presupuesto {
  cliente_email_actual: string | null;
  cliente_telefono_actual: string | null;
  num_lineas: number;
}

export type TipoCantidad = 'metros' | 'unidades' | 'horas' | 'placas_a3' | 'placas_a4';

export interface PresupuestoLinea {
  id: string;
  presupuesto_id: string;
  producto_id: string | null;
  producto_nombre: string;
  producto_categoria: string | null;
  cantidad: number;
  tipo_cantidad: TipoCantidad;
  descripcion: string | null;
  precio_unitario: number;
  importe: number;
  orden: number;
  created_at: string;
}

export interface PrecioCalculado {
  precio_unitario: number;
  importe_total: number;
  desglose: {
    precio_fijo?: number;
    precio_base?: number;
    importe_metro_2?: number;
    metros_tarifa_1?: number;
    precio_metro_tarifa_1?: number;
    importe_tarifa_1?: number;
    metros_tarifa_2?: number;
    precio_metro_tarifa_2?: number;
    importe_tarifa_2?: number;
    precio_unidad?: number;
    unidades?: number;
    precio_hora?: number;
    horas?: number;
    tipo_placa?: string;
    precio_placa?: number;
    cantidad?: number;
    metros_gratis?: number;
    cantidad_facturable?: number;
    rangos?: Array<{
      desde: number;
      hasta: number | null;
      cantidad: number;
      precio_unitario: number;
      importe: number;
    }>;
    tipo?: string;
  };
}

export interface ResumenMensual {
  mes: string;
  total_presupuestos: number;
  aceptados: number;
  rechazados: number;
  pendientes: number;
  importe_total: number | null;
  importe_aceptado: number | null;
}
