import { useState, useEffect } from "react"; // 👈 1. Importar hooks de React
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Package, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

// 2. Importar los SERVICIOS de API REALES (ajusta la ruta si es necesario)
import { getAllSales } from "../../SERVICES/saleService";
import { getAllClients } from "../../SERVICES/clientService";
import { getAllProducts } from "../../SERVICES/productService";

// Definir los tipos de datos (¡importante!)
interface Venta {
  _id: string;
  total: number;
  createdAt: string; // Asumimos que usas timestamps de Mongoose
  products: {
    productoId: string;
    quantity: number;
  }[];
}

interface Cliente {
  _id: string;
  isActive: boolean;
}

interface Producto {
  _id: string;
  name: string;
  stock: number;
}


const Index = () => {
  // 3. Crear estados para almacenar los datos de la API
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  // 4. Usar useEffect para cargar los datos cuando el componente se monta
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Cargar todos los datos en paralelo
        const [salesData, clientsData, productsData] = await Promise.all([
          getAllSales(),
          getAllClients(),
          getAllProducts()
        ]);

        // Guardar los datos en el estado, extrayendo de la paginación si es necesario
        setVentas(Array.isArray(salesData) ? salesData : []);
        setClientes(Array.isArray(clientsData?.clients) ? clientsData.clients : []);
        setProductos(Array.isArray(productsData?.products) ? productsData.products : []);

      } catch (error) {
        console.error("Error al cargar los datos del dashboard:", error);
        // Aquí podrías usar tu 'toast'
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []); // El array vacío asegura que se ejecute solo una vez

  // --- 5. Lógica de negocio (CORREGIDA con los nombres de campos de MongoDB) ---

  const totalVentas = ventas.reduce((acc, venta) => acc + venta.total, 0);
  
  const ventasHoy = ventas.filter(v => {
    // ✅ CORRECCIÓN: Usar 'createdAt' (de Mongoose) en lugar de 'fecha'
    const fecha = new Date(v.createdAt); 
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  });
  const totalVentasHoy = ventasHoy.reduce((acc, venta) => acc + venta.total, 0);

  // Ventas por mes (últimos 6 meses)
  const ventasPorMes = Array.from({ length: 6 }, (_, i) => {
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() - (5 - i));
    const mes = fecha.toLocaleDateString('es-MX', { month: 'short' });
    
    const ventasMes = ventas.filter(v => {
      // ✅ CORRECCIÓN: Usar 'createdAt'
      const ventaFecha = new Date(v.createdAt); 
      return ventaFecha.getMonth() === fecha.getMonth() && 
             ventaFecha.getFullYear() === fecha.getFullYear();
    });
    
    const total = ventasMes.reduce((acc, venta) => acc + venta.total, 0);
    return { mes, total };
  });

 // --- Productos más vendidos (refactorizado y corregido) ---
const productosVendidos = new Map<string, number>();

ventas.forEach(venta => {
  venta.products.forEach(item => {
    // Convertir el ObjectId del producto a string (soporta ambos casos)
    const id = item.productoId?._id?.toString() || item.productoId?.toString();
    const cantidadVendida = item.quantity || 0;
    const cantidadActual = productosVendidos.get(id) || 0;
    productosVendidos.set(id, cantidadActual + cantidadVendida);
  });
});

const topProductos = Array.from(productosVendidos.entries())
  .map(([id, cantidad]) => {
    // Buscar el producto en la lista usando el _id como string
    const producto = productos.find(p => p._id?.toString() === id);
    return {
      nombre: producto?.name || "Desconocido",
      cantidad,
      totalVendido: producto ? cantidad * (producto.salePrice || 0) : 0, // opcional
    };
  })
  .sort((a, b) => b.cantidad - a.cantidad)
  .slice(0, 5);


  // ✅ CORRECCIÓN: Usar 'isActive' en lugar de 'activo'
  const clientesActivos = clientes.filter(c => c.isActive).length; 
  const productosConStock = productos.filter(p => p.stock > 0).length;

  // 6. Estado de carga
  if (loading) {
    return <p>Cargando datos del dashboard...</p>;
  }

  // 7. Renderizado (Tu JSX original ya es correcto)
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Resumen general del sistema
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalVentas.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {ventas.length} ventas registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalVentasHoy.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {ventasHoy.length} ventas hoy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientesActivos}</div>
            <p className="text-xs text-muted-foreground">
              de {clientes.length} totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos en Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productosConStock}</div>
            <p className="text-xs text-muted-foreground">
              de {productos.length} totales
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ventasPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index