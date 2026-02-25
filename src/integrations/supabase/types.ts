export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categorias: {
        Row: {
          activa: boolean | null
          created_at: string | null
          descripcion: string | null
          id: string
          nombre: string
          orden: number | null
          updated_at: string | null
        }
        Insert: {
          activa?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre: string
          orden?: number | null
          updated_at?: string | null
        }
        Update: {
          activa?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre?: string
          orden?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          activo: boolean | null
          ciudad: string | null
          codigo_postal: string | null
          created_at: string | null
          direccion: string | null
          email: string | null
          id: string
          nombre: string
          nombre_comercial: string | null
          notas: string | null
          numero_documento: string | null
          pais: string | null
          persona_contacto: string | null
          provincia: string | null
          telefono: string | null
          telefono_secundario: string | null
          tipo_documento: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          ciudad?: string | null
          codigo_postal?: string | null
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          id?: string
          nombre: string
          nombre_comercial?: string | null
          notas?: string | null
          numero_documento?: string | null
          pais?: string | null
          persona_contacto?: string | null
          provincia?: string | null
          telefono?: string | null
          telefono_secundario?: string | null
          tipo_documento?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          ciudad?: string | null
          codigo_postal?: string | null
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          id?: string
          nombre?: string
          nombre_comercial?: string | null
          notas?: string | null
          numero_documento?: string | null
          pais?: string | null
          persona_contacto?: string | null
          provincia?: string | null
          telefono?: string | null
          telefono_secundario?: string | null
          tipo_documento?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      empresa_config: {
        Row: {
          cif: string | null
          ciudad: string | null
          codigo_postal: string | null
          condiciones_pago: string | null
          created_at: string | null
          cuenta_bancaria: string | null
          direccion: string | null
          email: string | null
          iban: string | null
          id: string
          iva_porcentaje: number | null
          logo_url: string | null
          nombre_empresa: string
          pie_presupuesto: string | null
          prefijo_factura: string | null
          prefijo_presupuesto: string | null
          siguiente_numero_factura: number | null
          telefono: string | null
          texto_factura_cabecera: string | null
          texto_factura_pie: string | null
          updated_at: string | null
          validez_dias: number | null
          web: string | null
        }
        Insert: {
          cif?: string | null
          ciudad?: string | null
          codigo_postal?: string | null
          condiciones_pago?: string | null
          created_at?: string | null
          cuenta_bancaria?: string | null
          direccion?: string | null
          email?: string | null
          iban?: string | null
          id?: string
          iva_porcentaje?: number | null
          logo_url?: string | null
          nombre_empresa: string
          pie_presupuesto?: string | null
          prefijo_factura?: string | null
          prefijo_presupuesto?: string | null
          siguiente_numero_factura?: number | null
          telefono?: string | null
          texto_factura_cabecera?: string | null
          texto_factura_pie?: string | null
          updated_at?: string | null
          validez_dias?: number | null
          web?: string | null
        }
        Update: {
          cif?: string | null
          ciudad?: string | null
          codigo_postal?: string | null
          condiciones_pago?: string | null
          created_at?: string | null
          cuenta_bancaria?: string | null
          direccion?: string | null
          email?: string | null
          iban?: string | null
          id?: string
          iva_porcentaje?: number | null
          logo_url?: string | null
          nombre_empresa?: string
          pie_presupuesto?: string | null
          prefijo_factura?: string | null
          prefijo_presupuesto?: string | null
          siguiente_numero_factura?: number | null
          telefono?: string | null
          texto_factura_cabecera?: string | null
          texto_factura_pie?: string | null
          updated_at?: string | null
          validez_dias?: number | null
          web?: string | null
        }
        Relationships: []
      }
      factura_lineas: {
        Row: {
          cantidad: number
          created_at: string | null
          descripcion: string | null
          factura_id: string
          id: string
          importe: number
          orden: number | null
          precio_unitario: number
          producto_categoria: string | null
          producto_id: string | null
          producto_nombre: string
          tipo_cantidad: string
        }
        Insert: {
          cantidad: number
          created_at?: string | null
          descripcion?: string | null
          factura_id: string
          id?: string
          importe: number
          orden?: number | null
          precio_unitario: number
          producto_categoria?: string | null
          producto_id?: string | null
          producto_nombre: string
          tipo_cantidad?: string
        }
        Update: {
          cantidad?: number
          created_at?: string | null
          descripcion?: string | null
          factura_id?: string
          id?: string
          importe?: number
          orden?: number | null
          precio_unitario?: number
          producto_categoria?: string | null
          producto_id?: string | null
          producto_nombre?: string
          tipo_cantidad?: string
        }
        Relationships: [
          {
            foreignKeyName: "factura_lineas_factura_id_fkey"
            columns: ["factura_id"]
            isOneToOne: false
            referencedRelation: "facturas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "factura_lineas_factura_id_fkey"
            columns: ["factura_id"]
            isOneToOne: false
            referencedRelation: "v_facturas_completas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "factura_lineas_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "factura_lineas_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "v_productos_con_categoria"
            referencedColumns: ["id"]
          },
        ]
      }
      facturas: {
        Row: {
          base_imponible: number | null
          cliente_ciudad: string | null
          cliente_codigo_postal: string | null
          cliente_direccion: string | null
          cliente_documento: string | null
          cliente_email: string | null
          cliente_id: string | null
          cliente_nombre: string
          cliente_nombre_comercial: string | null
          cliente_telefono: string | null
          created_at: string | null
          descuento_importe: number | null
          descuento_tipo: string | null
          descuento_valor: number | null
          estado: string | null
          fecha_emision: string
          fecha_pago: string | null
          fecha_vencimiento: string | null
          id: string
          iva_importe: number | null
          iva_porcentaje: number | null
          metodo_pago: string | null
          notas: string | null
          notas_internas: string | null
          numero: string
          presupuesto_id: string | null
          subtotal: number | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          base_imponible?: number | null
          cliente_ciudad?: string | null
          cliente_codigo_postal?: string | null
          cliente_direccion?: string | null
          cliente_documento?: string | null
          cliente_email?: string | null
          cliente_id?: string | null
          cliente_nombre: string
          cliente_nombre_comercial?: string | null
          cliente_telefono?: string | null
          created_at?: string | null
          descuento_importe?: number | null
          descuento_tipo?: string | null
          descuento_valor?: number | null
          estado?: string | null
          fecha_emision?: string
          fecha_pago?: string | null
          fecha_vencimiento?: string | null
          id?: string
          iva_importe?: number | null
          iva_porcentaje?: number | null
          metodo_pago?: string | null
          notas?: string | null
          notas_internas?: string | null
          numero: string
          presupuesto_id?: string | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          base_imponible?: number | null
          cliente_ciudad?: string | null
          cliente_codigo_postal?: string | null
          cliente_direccion?: string | null
          cliente_documento?: string | null
          cliente_email?: string | null
          cliente_id?: string | null
          cliente_nombre?: string
          cliente_nombre_comercial?: string | null
          cliente_telefono?: string | null
          created_at?: string | null
          descuento_importe?: number | null
          descuento_tipo?: string | null
          descuento_valor?: number | null
          estado?: string | null
          fecha_emision?: string
          fecha_pago?: string | null
          fecha_vencimiento?: string | null
          id?: string
          iva_importe?: number | null
          iva_porcentaje?: number | null
          metodo_pago?: string | null
          notas?: string | null
          notas_internas?: string | null
          numero?: string
          presupuesto_id?: string | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facturas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facturas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "v_clientes_con_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facturas_presupuesto_id_fkey"
            columns: ["presupuesto_id"]
            isOneToOne: false
            referencedRelation: "presupuestos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facturas_presupuesto_id_fkey"
            columns: ["presupuesto_id"]
            isOneToOne: false
            referencedRelation: "v_presupuestos_completos"
            referencedColumns: ["id"]
          },
        ]
      }
      presupuesto_lineas: {
        Row: {
          cantidad: number
          created_at: string | null
          descripcion: string | null
          id: string
          importe: number
          orden: number | null
          precio_unitario: number
          presupuesto_id: string
          producto_categoria: string | null
          producto_id: string | null
          producto_nombre: string
          tipo_cantidad: string
        }
        Insert: {
          cantidad: number
          created_at?: string | null
          descripcion?: string | null
          id?: string
          importe: number
          orden?: number | null
          precio_unitario: number
          presupuesto_id: string
          producto_categoria?: string | null
          producto_id?: string | null
          producto_nombre: string
          tipo_cantidad?: string
        }
        Update: {
          cantidad?: number
          created_at?: string | null
          descripcion?: string | null
          id?: string
          importe?: number
          orden?: number | null
          precio_unitario?: number
          presupuesto_id?: string
          producto_categoria?: string | null
          producto_id?: string | null
          producto_nombre?: string
          tipo_cantidad?: string
        }
        Relationships: [
          {
            foreignKeyName: "presupuesto_lineas_presupuesto_id_fkey"
            columns: ["presupuesto_id"]
            isOneToOne: false
            referencedRelation: "presupuestos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presupuesto_lineas_presupuesto_id_fkey"
            columns: ["presupuesto_id"]
            isOneToOne: false
            referencedRelation: "v_presupuestos_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presupuesto_lineas_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presupuesto_lineas_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "v_productos_con_categoria"
            referencedColumns: ["id"]
          },
        ]
      }
      presupuestos: {
        Row: {
          base_imponible: number | null
          cliente_ciudad: string | null
          cliente_codigo_postal: string | null
          cliente_direccion: string | null
          cliente_documento: string | null
          cliente_email: string | null
          cliente_id: string | null
          cliente_nombre: string
          cliente_nombre_comercial: string | null
          cliente_telefono: string | null
          created_at: string | null
          descuento_importe: number | null
          descuento_tipo: string | null
          descuento_valor: number | null
          estado: string | null
          fecha_emision: string
          fecha_envio: string | null
          fecha_respuesta: string | null
          fecha_validez: string | null
          id: string
          iva_importe: number | null
          iva_porcentaje: number | null
          metodo_pago: string | null
          notas: string | null
          notas_internas: string | null
          numero: string
          referencia_cliente: string | null
          subtotal: number | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          base_imponible?: number | null
          cliente_ciudad?: string | null
          cliente_codigo_postal?: string | null
          cliente_direccion?: string | null
          cliente_documento?: string | null
          cliente_email?: string | null
          cliente_id?: string | null
          cliente_nombre: string
          cliente_nombre_comercial?: string | null
          cliente_telefono?: string | null
          created_at?: string | null
          descuento_importe?: number | null
          descuento_tipo?: string | null
          descuento_valor?: number | null
          estado?: string | null
          fecha_emision?: string
          fecha_envio?: string | null
          fecha_respuesta?: string | null
          fecha_validez?: string | null
          id?: string
          iva_importe?: number | null
          iva_porcentaje?: number | null
          metodo_pago?: string | null
          notas?: string | null
          notas_internas?: string | null
          numero: string
          referencia_cliente?: string | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          base_imponible?: number | null
          cliente_ciudad?: string | null
          cliente_codigo_postal?: string | null
          cliente_direccion?: string | null
          cliente_documento?: string | null
          cliente_email?: string | null
          cliente_id?: string | null
          cliente_nombre?: string
          cliente_nombre_comercial?: string | null
          cliente_telefono?: string | null
          created_at?: string | null
          descuento_importe?: number | null
          descuento_tipo?: string | null
          descuento_valor?: number | null
          estado?: string | null
          fecha_emision?: string
          fecha_envio?: string | null
          fecha_respuesta?: string | null
          fecha_validez?: string | null
          id?: string
          iva_importe?: number | null
          iva_porcentaje?: number | null
          metodo_pago?: string | null
          notas?: string | null
          notas_internas?: string | null
          numero?: string
          referencia_cliente?: string | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "presupuestos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presupuestos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "v_clientes_con_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      producto_tarifas: {
        Row: {
          cantidad_desde: number
          cantidad_hasta: number | null
          created_at: string | null
          id: string
          orden: number
          precio_unitario: number
          producto_id: string
        }
        Insert: {
          cantidad_desde?: number
          cantidad_hasta?: number | null
          created_at?: string | null
          id?: string
          orden?: number
          precio_unitario: number
          producto_id: string
        }
        Update: {
          cantidad_desde?: number
          cantidad_hasta?: number | null
          created_at?: string | null
          id?: string
          orden?: number
          precio_unitario?: number
          producto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "producto_tarifas_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "producto_tarifas_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "v_productos_con_categoria"
            referencedColumns: ["id"]
          },
        ]
      }
      productos: {
        Row: {
          activo: boolean | null
          bonificacion_cada_n_metros: number | null
          categoria_id: string
          codigo: string | null
          created_at: string | null
          descripcion: string | null
          id: string
          metros_gratis: number | null
          metros_limite_tarifa_1: number | null
          nombre: string
          precio_base_fijo: number | null
          precio_material: number | null
          precio_metro_2: number | null
          precio_metro_tarifa_1: number | null
          precio_metro_tarifa_2: number | null
          precio_montaje: number | null
          precio_placa_a3: number | null
          precio_placa_a4: number | null
          precio_por_hora: number | null
          precio_por_unidad: number | null
          precio_preparacion: number | null
          tipo_calculo: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          bonificacion_cada_n_metros?: number | null
          categoria_id: string
          codigo?: string | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          metros_gratis?: number | null
          metros_limite_tarifa_1?: number | null
          nombre: string
          precio_base_fijo?: number | null
          precio_material?: number | null
          precio_metro_2?: number | null
          precio_metro_tarifa_1?: number | null
          precio_metro_tarifa_2?: number | null
          precio_montaje?: number | null
          precio_placa_a3?: number | null
          precio_placa_a4?: number | null
          precio_por_hora?: number | null
          precio_por_unidad?: number | null
          precio_preparacion?: number | null
          tipo_calculo?: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          bonificacion_cada_n_metros?: number | null
          categoria_id?: string
          codigo?: string | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          metros_gratis?: number | null
          metros_limite_tarifa_1?: number | null
          nombre?: string
          precio_base_fijo?: number | null
          precio_material?: number | null
          precio_metro_2?: number | null
          precio_metro_tarifa_1?: number | null
          precio_metro_tarifa_2?: number | null
          precio_montaje?: number | null
          precio_placa_a3?: number | null
          precio_placa_a4?: number | null
          precio_por_hora?: number | null
          precio_por_unidad?: number | null
          precio_preparacion?: number | null
          tipo_calculo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "productos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_clientes_con_stats: {
        Row: {
          activo: boolean | null
          ciudad: string | null
          codigo_postal: string | null
          created_at: string | null
          direccion: string | null
          email: string | null
          facturacion_total: number | null
          id: string | null
          nombre: string | null
          nombre_comercial: string | null
          notas: string | null
          numero_documento: string | null
          pais: string | null
          persona_contacto: string | null
          presupuestos_aceptados: number | null
          provincia: string | null
          telefono: string | null
          telefono_secundario: string | null
          tipo_documento: string | null
          total_presupuestos: number | null
          ultimo_presupuesto: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      v_facturas_completas: {
        Row: {
          base_imponible: number | null
          cliente_ciudad: string | null
          cliente_codigo_postal: string | null
          cliente_direccion: string | null
          cliente_documento: string | null
          cliente_email: string | null
          cliente_email_actual: string | null
          cliente_id: string | null
          cliente_nombre: string | null
          cliente_nombre_comercial: string | null
          cliente_telefono: string | null
          cliente_telefono_actual: string | null
          created_at: string | null
          descuento_importe: number | null
          descuento_tipo: string | null
          descuento_valor: number | null
          estado: string | null
          fecha_emision: string | null
          fecha_pago: string | null
          fecha_vencimiento: string | null
          id: string | null
          iva_importe: number | null
          iva_porcentaje: number | null
          notas: string | null
          notas_internas: string | null
          num_lineas: number | null
          numero: string | null
          presupuesto_id: string | null
          subtotal: number | null
          total: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facturas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facturas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "v_clientes_con_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facturas_presupuesto_id_fkey"
            columns: ["presupuesto_id"]
            isOneToOne: false
            referencedRelation: "presupuestos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facturas_presupuesto_id_fkey"
            columns: ["presupuesto_id"]
            isOneToOne: false
            referencedRelation: "v_presupuestos_completos"
            referencedColumns: ["id"]
          },
        ]
      }
      v_presupuestos_completos: {
        Row: {
          base_imponible: number | null
          cliente_ciudad: string | null
          cliente_codigo_postal: string | null
          cliente_direccion: string | null
          cliente_documento: string | null
          cliente_email: string | null
          cliente_email_actual: string | null
          cliente_id: string | null
          cliente_nombre: string | null
          cliente_nombre_comercial: string | null
          cliente_telefono: string | null
          cliente_telefono_actual: string | null
          created_at: string | null
          descuento_importe: number | null
          descuento_tipo: string | null
          descuento_valor: number | null
          estado: string | null
          fecha_emision: string | null
          fecha_envio: string | null
          fecha_respuesta: string | null
          fecha_validez: string | null
          id: string | null
          iva_importe: number | null
          iva_porcentaje: number | null
          notas: string | null
          notas_internas: string | null
          num_lineas: number | null
          numero: string | null
          referencia_cliente: string | null
          subtotal: number | null
          total: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "presupuestos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presupuestos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "v_clientes_con_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      v_productos_con_categoria: {
        Row: {
          activo: boolean | null
          categoria_id: string | null
          categoria_nombre: string | null
          categoria_orden: number | null
          codigo: string | null
          created_at: string | null
          descripcion: string | null
          id: string | null
          metros_limite_tarifa_1: number | null
          nombre: string | null
          precio_base_fijo: number | null
          precio_material: number | null
          precio_metro_tarifa_1: number | null
          precio_metro_tarifa_2: number | null
          precio_montaje: number | null
          precio_placa_a3: number | null
          precio_placa_a4: number | null
          precio_por_hora: number | null
          precio_por_unidad: number | null
          precio_preparacion: number | null
          tipo_calculo: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "productos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      v_resumen_mensual: {
        Row: {
          aceptados: number | null
          importe_aceptado: number | null
          importe_total: number | null
          mes: string | null
          pendientes: number | null
          rechazados: number | null
          total_presupuestos: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calcular_precio_producto: {
        Args: {
          p_cantidad: number
          p_producto_id: string
          p_tipo_cantidad?: string
        }
        Returns: {
          desglose: Json
          importe_total: number
          precio_unitario: number
        }[]
      }
      generar_numero_factura: { Args: never; Returns: string }
      generar_numero_presupuesto: { Args: never; Returns: string }
      is_authenticated: { Args: never; Returns: boolean }
      recalcular_totales_presupuesto: {
        Args: { p_presupuesto_id: string }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
