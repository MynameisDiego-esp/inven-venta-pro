export interface Cliente {
  id: string;
  tipo: 'fisica' | 'moral';
  nombre: string;
  rfc: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaRegistro: string;
  activo: boolean;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precioAdquisicion: number;
  precioVenta: number;
  stock: number;
  imagen: string;
  categoria: string;
  fechaRegistro: string;
}

export interface Venta {
  id: string;
  clienteId: string;
  productos: VentaProducto[];
  subtotal: number;
  iva: number;
  ivaRate: 8 | 16;
  total: number;
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia';
  pagosDiferidos: PagoDiferido[];
  fecha: string;
  completada: boolean;
}

export interface VentaProducto {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
}

export interface PagoDiferido {
  id: string;
  monto: number;
  fechaVencimiento: string;
  pagado: boolean;
  fechaPago?: string;
}
