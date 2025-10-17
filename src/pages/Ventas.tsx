import { useState, useEffect } from "react";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// NUEVO: Importamos los servicios para Ventas, Clientes y Productos
import { getAllSales, createSale } from "../../SERVICES/saleService";
import { getAllClients } from "../../SERVICES/clientService";
import { getAllProducts } from "../../SERVICES/productService";

// NUEVO: Definimos los tipos que vienen del backend
interface Cliente { _id: string; name: string; isActive: boolean; /* ...otros campos */ }
interface Producto { _id: string; name: string; salePrice: number; stock: number; /* ...otros campos */ }
interface VentaProducto { productoId: string; quantity: number; unitPrice: number; }
interface Venta {
  _id: string;
  client: Cliente; // En el backend, 'populate' nos dará el objeto cliente
  products: VentaProducto[];
  subtotal: number;
  iva: number;
  total: number;
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencias';
  createdAt: string;
}

export default function Ventas() {
  // MODIFICADO: Estados iniciales vacíos, se llenarán desde la API
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  // MODIFICADO: Ajustamos los nombres para coincidir con el backend
  const [formData, setFormData] = useState({
    client: '', // Almacenará el _id del cliente
    products: [] as VentaProducto[],
    iva: 16 as 8 | 16 | 0,
    paymentMethod: 'efectivo' as 'efectivo' | 'tarjeta' | 'transferencias',
  });

  const [currentProduct, setCurrentProduct] = useState({
    productoId: '',
    quantity: 1,
    unitPrice: 0,
  });

  // NUEVO: Función para cargar todos los datos necesarios para la página
  // Dentro de tu componente Ventas.tsx

const loadInitialData = async () => {
    try {
      setLoading(true);
      // Hacemos las 3 peticiones en paralelo para más eficiencia
      const [salesData, clientsData, productsApiResponse] = await Promise.all([
        getAllSales(),
        getAllClients(),
        getAllProducts(), // Esta función ahora devuelve un objeto
      ]);
      
      setVentas(salesData);
      setClientes(clientsData);
      
      // ✅ LA CORRECCIÓN ESTÁ AQUÍ
      // Extraemos el array 'products' de la respuesta de la API
      setProductos(productsApiResponse.products); 

    } catch (error) {
      toast({ title: "Error", description: "No se pudieron cargar los datos iniciales.", variant: "destructive" });
      // Aseguramos que los estados sean arrays vacíos en caso de error
      setVentas([]);
      setClientes([]);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  // NUEVO: Carga inicial de datos al montar el componente
  useEffect(() => {
    loadInitialData();
  }, []);

  const addProductToSale = () => {
    if (!currentProduct.productoId) return;
    const producto = productos.find(p => p._id === currentProduct.productoId);
    if (!producto) return;

    if (producto.stock < currentProduct.quantity) {
      toast({ title: "Stock insuficiente", description: `Solo hay ${producto.stock} unidades.`, variant: "destructive" });
      return;
    }

    setFormData({
      ...formData,
      products: [...formData.products, {
        productoId: currentProduct.productoId,
        quantity: currentProduct.quantity,
        unitPrice: currentProduct.unitPrice || producto.salePrice,
      }],
    });
    setCurrentProduct({ productoId: '', quantity: 1, unitPrice: 0 });
  };

  const removeProductFromSale = (index: number) => {
    setFormData({ ...formData, products: formData.products.filter((_, i) => i !== index) });
  };

  const calculateTotals = () => {
    const subtotal = formData.products.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const ivaValue = subtotal * (formData.iva / 100);
    const total = subtotal + ivaValue;
    return { subtotal, iva: ivaValue, total };
  };

  // MODIFICADO: La función ahora es asíncrona y envía los datos a la API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client) {
      toast({ title: "Error", description: "Debe seleccionar un cliente.", variant: "destructive" });
      return;
    }
    if (formData.products.length === 0) {
      toast({ title: "Error", description: "Debe agregar al menos un producto.", variant: "destructive" });
      return;
    }

    const { subtotal, iva, total } = calculateTotals();

    // Preparamos el objeto para enviar a la API
    const salePayload = {
      client: formData.client,
      products: formData.products,
      subtotal,
      iva,
      total,
      paymentMethod: formData.paymentMethod,
    };

    try {
      // MODIFICADO: Ya no actualizamos el stock manualmente, el backend lo hace.
      await createSale(salePayload);
      
      // Recargamos todos los datos para reflejar los cambios (nueva venta y stock actualizado)
      loadInitialData();
      
      setOpen(false);
      resetForm();
      toast({ title: "Venta registrada", description: `Venta por $${total.toFixed(2)} registrada.` });
    } catch (error) {
      toast({ title: "Error en la venta", description: "No se pudo registrar la venta.", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({ client: '', products: [], iva: 16, paymentMethod: 'efectivo' });
    setCurrentProduct({ productoId: '', quantity: 1, unitPrice: 0 });
  };
  
  const { subtotal, iva, total } = calculateTotals();

  if (loading) return <p>Cargando datos de ventas...</p>;

  return (
    <div className="space-y-6">
      {/* Tu JSX se mantiene casi igual, solo hay que ajustar los nombres de las propiedades */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Ventas</h2>
        <Dialog open={open} onOpenChange={(val) => { if (!val) resetForm(); setOpen(val); }}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Nueva Venta</Button></DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Nueva Venta</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* MODIFICADO: campo 'client' en formData y cliente._id como value */}
              <Select value={formData.client} onValueChange={(val) => setFormData({ ...formData, client: val })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                <SelectContent>
                  {clientes.filter(c => c.isActive).map(cliente => (
                    <SelectItem key={cliente._id} value={cliente._id}>{cliente.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* ... El resto del formulario se mantiene muy similar ... */}
              {/* Asegúrate de que los IDs de producto y cliente usen `_id` */}
              {/* Ejemplo en la lista de productos a agregar: */}
              <Select value={currentProduct.productoId} onValueChange={(val) => {
                  const prod = productos.find(p => p._id === val);
                  setCurrentProduct({ ...currentProduct, productoId: val, unitPrice: prod?.salePrice || 0 });
                }}>
                <SelectTrigger className="col-span-2"><SelectValue placeholder="Seleccionar producto" /></SelectTrigger>
                <SelectContent>
                  {productos.filter(p => p.stock > 0).map(producto => (
                    <SelectItem key={producto._id} value={producto._id}>
                      {producto.name} (Stock: {producto.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* ... el resto del JSX del formulario ... */}
               <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit">Registrar Venta</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* MODIFICADO: Mapeo de ventas con la nueva estructura de datos */}
      <div className="space-y-4">
        {ventas.map((venta) => (
          <Card key={venta._id}>
            <CardHeader>
              <CardTitle>{venta.client?.name || 'Cliente eliminado'}</CardTitle>
              <p>{new Date(venta.createdAt).toLocaleString('es-MX')}</p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${venta.total.toFixed(2)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
       {ventas.length === 0 && !loading && ( <Card><CardContent className="py-12 text-center"><ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground" /><p>No hay ventas</p></CardContent></Card>)}
    </div>
  );
};