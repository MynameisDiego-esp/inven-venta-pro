import { Cliente, Producto, Venta } from '@/types';

const STORAGE_KEYS = {
  CLIENTES: 'pos_clientes',
  PRODUCTOS: 'pos_productos',
  VENTAS: 'pos_ventas',
} as const;

// Clientes
export const getClientes = (): Cliente[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CLIENTES);
  return data ? JSON.parse(data) : [];
};

export const saveCliente = (cliente: Cliente) => {
  const clientes = getClientes();
  const index = clientes.findIndex(c => c.id === cliente.id);
  if (index >= 0) {
    clientes[index] = cliente;
  } else {
    clientes.push(cliente);
  }
  localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(clientes));
};

export const deleteCliente = (id: string) => {
  const clientes = getClientes().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(clientes));
};

// Productos
export const getProductos = (): Producto[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTOS);
  return data ? JSON.parse(data) : [];
};

export const saveProducto = (producto: Producto) => {
  const productos = getProductos();
  const index = productos.findIndex(p => p.id === producto.id);
  if (index >= 0) {
    productos[index] = producto;
  } else {
    productos.push(producto);
  }
  localStorage.setItem(STORAGE_KEYS.PRODUCTOS, JSON.stringify(productos));
};

export const deleteProducto = (id: string) => {
  const productos = getProductos().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PRODUCTOS, JSON.stringify(productos));
};

export const updateStock = (id: string, cantidad: number) => {
  const productos = getProductos();
  const producto = productos.find(p => p.id === id);
  if (producto) {
    producto.stock -= cantidad;
    localStorage.setItem(STORAGE_KEYS.PRODUCTOS, JSON.stringify(productos));
  }
};

// Ventas
export const getVentas = (): Venta[] => {
  const data = localStorage.getItem(STORAGE_KEYS.VENTAS);
  return data ? JSON.parse(data) : [];
};

export const saveVenta = (venta: Venta) => {
  const ventas = getVentas();
  const index = ventas.findIndex(v => v.id === venta.id);
  if (index >= 0) {
    ventas[index] = venta;
  } else {
    ventas.push(venta);
  }
  localStorage.setItem(STORAGE_KEYS.VENTAS, JSON.stringify(ventas));
};
