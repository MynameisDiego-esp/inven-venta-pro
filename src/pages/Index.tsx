import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Package, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { getVentas, getClientes, getProductos } from "@/lib/storage";

const Index = () => {
  const ventas = getVentas();
  const clientes = getClientes();
  const productos = getProductos();

  const totalVentas = ventas.reduce((acc, venta) => acc + venta.total, 0);
  const ventasHoy = ventas.filter(v => {
    const fecha = new Date(v.fecha);
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
      const ventaFecha = new Date(v.fecha);
      return ventaFecha.getMonth() === fecha.getMonth() && 
             ventaFecha.getFullYear() === fecha.getFullYear();
    });
    
    const total = ventasMes.reduce((acc, venta) => acc + venta.total, 0);
    
    return { mes, total };
  });

  // Productos más vendidos
  const productosVendidos = new Map<string, number>();
  ventas.forEach(venta => {
    venta.productos.forEach(item => {
      const cantidad = productosVendidos.get(item.productoId) || 0;
      productosVendidos.set(item.productoId, cantidad + item.cantidad);
    });
  });

  const topProductos = Array.from(productosVendidos.entries())
    .map(([id, cantidad]) => {
      const producto = productos.find(p => p.id === id);
      return { nombre: producto?.nombre || 'Desconocido', cantidad };
    })
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  const clientesActivos = clientes.filter(c => c.activo).length;
  const productosConStock = productos.filter(p => p.stock > 0).length;

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

export default Index;
