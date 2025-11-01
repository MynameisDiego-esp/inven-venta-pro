import { useState, useEffect } from "react";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Importamos los servicios para Ventas, Clientes y Productos
import { getAllSales, createSale } from "../../SERVICES/saleService";
import { getAllClients } from "../../SERVICES/clientService";
import { getAllProducts } from "../../SERVICES/productService";

// Definimos los tipos que vienen del backend
interface Cliente { _id: string; name: string; isActive: boolean; /* ...otros campos */ }
interface Producto { _id: string; name: string; salePrice: number; stock: number; /* ...otros campos */ }
// ✅ CORRECCIÓN: Usar 'productoId'
interface VentaProducto { productoId: string; quantity: number; unitPrice: number; } 
interface Venta {
  _id: string;
  client: Cliente; 
  products: VentaProducto[];
  ivaAmount: number; // ✅ CORRECCIÓN: Tipo para 'ivaAmount'
  subtotal: number;
  total: number;
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencias';
  createdAt: string;
}

export default function Ventas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    client: '', // Almacenará el _id del cliente
    products: [] as VentaProducto[],
    ivaPercentage: 16 as 8 | 16 | 0, // ✅ CAMBIO DE NOMBRE: Ahora guarda el porcentaje
    paymentMethod: 'efectivo' as 'efectivo' | 'tarjeta' | 'transferencias',
  });

  const [currentProduct, setCurrentProduct] = useState({
    productoId: '',
    quantity: 1,
    unitPrice: 0, 
  });
    
  const selectedProduct = productos.find(p => p._id === currentProduct.productoId);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [salesData, clientsData, productsApiResponse] = await Promise.all([
        getAllSales(),
        getAllClients(),
        getAllProducts(),
      ]);
      
      setVentas(salesData);
      setClientes(Array.isArray(clientsData?.clients) ? clientsData.clients : []);
      setProductos(productsApiResponse.products); 

    } catch (error) {
      toast({ title: "Error", description: "No se pudieron cargar los datos iniciales.", variant: "destructive" });
      setVentas([]);
      setClientes([]);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const addProductToSale = () => {
    if (!currentProduct.productoId || currentProduct.quantity <= 0) {
      toast({ title: "Error", description: "Seleccione un producto y cantidad válida.", variant: "destructive" });
      return;
    }

    if (!selectedProduct) return;

    if (selectedProduct.stock < currentProduct.quantity) {
      toast({ title: "Stock insuficiente", description: `Solo hay ${selectedProduct.stock} unidades.`, variant: "destructive" });
      return;
    }
    
    setFormData({
      ...formData,
      products: [...formData.products, {
        productoId: currentProduct.productoId,
        quantity: currentProduct.quantity,
        unitPrice: currentProduct.unitPrice, 
      }],
    });
    
    setCurrentProduct({ productoId: '', quantity: 1, unitPrice: 0 });
  };

  const removeProductFromSale = (index: number) => {
    setFormData({ ...formData, products: formData.products.filter((_, i) => i !== index) });
  };

  const calculateTotals = () => {
    const subtotal = formData.products.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    // ✅ CORRECCIÓN: Usa el nuevo nombre del estado para el porcentaje
    const ivaValue = subtotal * (formData.ivaPercentage / 100); 
    const total = subtotal + ivaValue;
    // ✅ IMPORTANTE: Devolvemos el valor monetario bajo 'ivaAmount'
    return { subtotal, ivaAmount: ivaValue, total, ivaPercentage: formData.ivaPercentage }; 
  };

  // Función para manejar el registro de la venta
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client || formData.products.length === 0) {
      toast({ title: "Error", description: "Debe seleccionar un cliente y agregar al menos un producto.", variant: "destructive" });
      return;
    }

    // Obtenemos el objeto con los totales calculados
    const { subtotal, ivaAmount, total, ivaPercentage } = calculateTotals();

    // Preparamos el objeto para enviar a la API
    const salePayload = {
      client: formData.client,
      products: formData.products,
      subtotal,
      // ✅ CORRECCIÓN CLAVE: Enviamos el valor monetario al campo correcto del backend.
      ivaAmount: ivaAmount, 
      total,
      paymentMethod: formData.paymentMethod,
    };

    try {
      await createSale(salePayload);
      loadInitialData();
      setOpen(false);
      resetForm();
      toast({ title: "Venta registrada", description: `Venta por $${total.toFixed(2)} registrada.` });
    } catch (error) {
      toast({ title: "Error en la venta", description: "No se pudo registrar la venta. Verifique la conexión, el stock o la validación del backend.", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({ client: '', products: [], ivaPercentage: 16, paymentMethod: 'efectivo' });
    setCurrentProduct({ productoId: '', quantity: 1, unitPrice: 0 });
  };
  
  // Usamos el valor monetario y el porcentaje para el renderizado
  const { subtotal, ivaAmount, total, ivaPercentage } = calculateTotals();

  if (loading) return <p>Cargando datos de ventas...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Ventas</h2>
        <Dialog open={open} onOpenChange={(val) => { if (!val) resetForm(); setOpen(val); }}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Nueva Venta</Button></DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Nueva Venta</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. SELECCIÓN DE CLIENTE */}
              <div>
                <Label htmlFor="client">Cliente</Label>
                <Select value={formData.client} onValueChange={(val) => setFormData({ ...formData, client: val })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                  <SelectContent>
                    {clientes.filter(c => c.isActive).map(cliente => (
                      <SelectItem key={cliente._id} value={cliente._id}>{cliente.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 2. AGREGAR PRODUCTOS */}
              <Card>
                <CardHeader><CardTitle>Agregar Producto</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-4 gap-4">
                  {/* Seleccionar Producto */}
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="productoId">Producto</Label>
                    <Select 
                      value={currentProduct.productoId} 
                      onValueChange={(val) => {
                          const prod = productos.find(p => p._id === val);
                          setCurrentProduct({ 
                              ...currentProduct, 
                              productoId: val, 
                              unitPrice: prod?.salePrice || 0 
                          });
                      }}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar producto" /></SelectTrigger>
                      <SelectContent>
                        {productos.filter(p => p.stock > 0).map(producto => (
                          <SelectItem key={producto._id} value={producto._id}>
                            {producto.name} (Stock: {producto.stock} | ${producto.salePrice.toFixed(2)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Cantidad */}
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Cantidad</Label>
                    <Input
                      type="number"
                      min="1"
                      max={selectedProduct?.stock || 1}
                      value={currentProduct.quantity}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                      disabled={!currentProduct.productoId}
                    />
                  </div>
                  
                  {/* Precio Unitario (Editable) */}
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Precio Unitario</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={currentProduct.unitPrice > 0 ? currentProduct.unitPrice : ''}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, unitPrice: parseFloat(e.target.value) || 0 })}
                      disabled={!currentProduct.productoId}
                    />
                  </div>
                  
                  {/* Botón Agregar */}
                  <div className="col-span-4 mt-6">
                    <Button 
                      type="button" 
                      onClick={addProductToSale} 
                      disabled={!currentProduct.productoId || currentProduct.quantity <= 0 || currentProduct.unitPrice <= 0}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Agregar a la Venta
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 3. LISTA DE PRODUCTOS EN LA VENTA */}
              {formData.products.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Productos en la Venta</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {formData.products.map((item, index) => {
                      const prod = productos.find(p => p._id === item.productoId);
                      return (
                        <div key={index} className="flex justify-between items-center p-3 border rounded-md">
                          <div>
                            <p className="font-medium">{prod?.name || 'Producto Desconocido'}</p>
                            <p className="text-sm text-muted-foreground">{item.quantity} x ${item.unitPrice.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="font-bold">${(item.quantity * item.unitPrice).toFixed(2)}</span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeProductFromSale(index)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      );
                  })}
                  </CardContent>
                </Card>
              )}

              {/* 4. TOTALES Y MÉTODO DE PAGO */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle>Totales</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <p className="flex justify-between"><span>Subtotal:</span> <span className="font-medium">${subtotal.toFixed(2)}</span></p>
                    
                    {/* IVA y Selector de IVA */}
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        IVA ({ivaPercentage}%)
                        <Select 
                          // ✅ CORRECCIÓN: Usa el nuevo nombre del estado
                          value={String(formData.ivaPercentage)} 
                          onValueChange={(val) => setFormData({ ...formData, ivaPercentage: parseInt(val) as 8 | 16 | 0 })}
                        >
                          <SelectTrigger className="w-[80px] h-6 ml-2 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="16">16%</SelectItem>
                            <SelectItem value="8">8%</SelectItem>
                            <SelectItem value="0">0%</SelectItem>
                          </SelectContent>
                        </Select>
                      </span>
                      <span className="font-medium">${ivaAmount.toFixed(2)}</span>
                    </div>

                    <p className="flex justify-between text-xl font-bold border-t pt-2"><span>Total:</span> <span>${total.toFixed(2)}</span></p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Método de Pago</CardTitle></CardHeader>
                  <CardContent>
                    <Select 
                      value={formData.paymentMethod} 
                      onValueChange={(val: 'efectivo' | 'tarjeta' | 'transferencias') => setFormData({ ...formData, paymentMethod: val })}
                    >
                      <SelectTrigger><SelectValue placeholder="Seleccionar método" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="tarjeta">Tarjeta</SelectItem>
                        <SelectItem value="transferencias">Transferencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </div>

              {/* 5. BOTONES DE ACCIÓN */}
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={formData.products.length === 0}>
                  Registrar Venta ({total.toFixed(2)})
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
    {/* LISTA DE VENTAS REGISTRADAS (con ID corregido) */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {ventas.map((venta) => (
    <Card key={venta._id}>
      <CardHeader>
        <CardTitle>{venta.client?.name || 'Cliente eliminado'}</CardTitle>

        {/* --- Muestra Método de Pago --- */}
        <p className="text-sm text-muted-foreground">
          {new Date(venta.createdAt).toLocaleString('es-MX')} -
          <span className="font-medium capitalize ml-1">{venta.paymentMethod}</span>
        </p>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          <h4 className="font-semibold text-sm mb-2">Detalle:</h4>
          <ul className="space-y-2">
            {venta.products.map((itemVenta, index) => {
              // ✅ Maneja si 'productoId' es un objeto { _id: '...' } o un string '...'
              const idString =
                (itemVenta.productoId as any)?._id?.toString() ||
                itemVenta.productoId?.toString();

              // Buscamos en la lista de productos comparando string con string
              const productoInfo = productos.find(
                (p) => p._id?.toString() === idString
              );

              return (
                <li
                  key={index}
                  className="flex justify-between items-center text-sm text-muted-foreground"
                >
                  {/* --- Muestra Imagen y Nombre --- */}
                  <div className="flex items-center gap-2">
                    {productoInfo?.imageUrl ? (
                      <img
                        src={productoInfo.imageUrl}
                        alt={productoInfo.name}
                        className="h-8 w-8 object-cover rounded-sm"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-sm bg-muted flex items-center justify-center">
                        ?
                      </div>
                    )}
                    <span>{productoInfo?.name || 'Producto (eliminado)'}</span>
                  </div>

                  <span>
                    {itemVenta.quantity} x ${itemVenta.unitPrice.toFixed(2)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Totales */}
        <div className="border-t pt-2 space-y-1">
          <p className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal:</span>
            <span>${venta.subtotal.toFixed(2)}</span>
          </p>
          <p className="flex justify-between text-sm text-muted-foreground">
            <span>IVA:</span>
            <span>${venta.ivaAmount.toFixed(2)}</span>
          </p>
          <p className="flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span>${venta.total.toFixed(2)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  ))}
</div>


       {ventas.length === 0 && !loading && ( <Card><CardContent className="py-12 text-center"><ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground" /><p>No hay ventas</p></CardContent></Card>)}
    </div>
  );
};