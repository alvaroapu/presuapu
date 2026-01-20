import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '0,00 €';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd/MM/yyyy', { locale: es });
}

export function formatDateLong(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, "d 'de' MMMM 'de' yyyy", { locale: es });
}

export function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value == null) return '0';
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

export function getTipoUnidad(tipoCantidad: string): string {
  switch (tipoCantidad) {
    case 'metros':
      return 'm²';
    case 'unidades':
      return 'uds';
    case 'horas':
      return 'h';
    case 'placas_a3':
      return 'A3';
    case 'placas_a4':
      return 'A4';
    default:
      return '';
  }
}

export function getEstadoColor(estado: string): string {
  switch (estado) {
    case 'borrador':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'enviado':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'aceptado':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'rechazado':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'facturado':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'cancelado':
      return 'bg-gray-50 text-gray-500 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

export function getEstadoLabel(estado: string): string {
  switch (estado) {
    case 'borrador':
      return 'Borrador';
    case 'enviado':
      return 'Enviado';
    case 'aceptado':
      return 'Aceptado';
    case 'rechazado':
      return 'Rechazado';
    case 'facturado':
      return 'Facturado';
    case 'cancelado':
      return 'Cancelado';
    default:
      return estado;
  }
}

export function getEstadoFacturaColor(estado: string): string {
  switch (estado) {
    case 'emitida':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'pagada':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'vencida':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'anulada':
      return 'bg-gray-50 text-gray-500 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

export function getEstadoFacturaLabel(estado: string): string {
  switch (estado) {
    case 'emitida':
      return 'Emitida';
    case 'pagada':
      return 'Pagada';
    case 'vencida':
      return 'Vencida';
    case 'anulada':
      return 'Anulada';
    default:
      return estado;
  }
}

export function getMetodoPagoLabel(metodo: string | null | undefined): string {
  if (!metodo) return '';
  switch (metodo) {
    case 'transferencia':
      return 'Transferencia bancaria';
    case 'efectivo':
      return 'Efectivo';
    case 'tarjeta':
      return 'Tarjeta de crédito/débito';
    case 'bizum':
      return 'Bizum';
    case 'paypal':
      return 'PayPal';
    case 'domiciliacion':
      return 'Domiciliación bancaria';
    default:
      return metodo;
  }
}
