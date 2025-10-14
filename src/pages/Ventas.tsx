import { useState } from "react";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Venta, VentaProducto, PagoDiferido } from "@/types";
import { getVentas, saveVenta, getClientes, getProductos, updateStock } from "@/lib/storage";

export default function Ventas() {
  const [ventas, setVentas] = useState<Venta[]>(getVentas());
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const clientes = getClientes();
  const productos = getProductos();

  const [formData, setFormData] = useState({
    clienteId: '',
    productosVenta: [] as VentaProducto[],
    ivaRate: 16 as 8 | 16,
    metodoPago: 'efectivo' as 'efectivo' | 'tarjeta' | 'transferencia',
    pagosDiferidos: [] as PagoDiferido[],
  });

  const [currentProduct, setCurrentProduct] = useState({
    productoId: '',
    cantidad: 1,
    precioUnitario: 0,
  });

  const addProductToSale = () => {
    if (!currentProduct.productoId) return;
    
    const producto = productos.find(p => p.id === currentProduct.productoId);
    if (!producto) return;

    if (producto.stock < currentProduct.cantidad) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${producto.stock} unidades disponibles.`,
        variant: "destructive",
      });
      return;
    }

    setFormData({
      ...formData,
      productosVenta: [...formData.productosVenta, {
        productoId: currentProduct.productoId,
        cantidad: currentProduct.cantidad,
        precioUnitario: currentProduct.precioUnitario || producto.precioVenta,
      }],
    });

    setCurrentProduct({ productoId: '', cantidad: 1, precioUnitario: 0 });
  };

  const removeProductFromSale = (index: number) => {
    setFormData({
      ...formData,
      productosVenta: formData.productosVenta.filter((_, i) => i !== index),
    });
  };

  const calculateTotals = () => {
    const subtotal = formData.productosVenta.reduce(
      (acc, item) => acc + item.cantidad * item.precioUnitario,
      0
    );
    const iva = subtotal * (formData.ivaRate / 100);
    const total = subtotal + iva;
    return { subtotal, iva, total };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clienteId) {
      toast({
        title: "Error",
        description: "Debe seleccionar un cliente.",
        variant: "destructive",
      });
      return;
    }

    if (formData.productosVenta.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un producto.",
        variant: "destructive",
      });
      return;
    }

    const { subtotal, iva, total } = calculateTotals();

    const venta: Venta = {
      id: crypto.randomUUID(),
      clienteId: formData.clienteId,
      productos: formData.productosVenta,
      subtotal,
      iva,
      ivaRate: formData.ivaRate,
      total,
      metodoPago: formData.metodoPago,
      pagosDiferidos: formData.pagosDiferidos,
      fecha: new Date().toISOString(),
      completada: formData.pagosDiferidos.length === 0,
    };

    // Actualizar stock
    formData.productosVenta.forEach(item => {
      updateStock(item.productoId, item.cantidad);
    });

    saveVenta(venta);
    setVentas(getVentas());
    setOpen(false);
    resetForm();
    
    toast({
      title: "Venta registrada",
      description: `Venta por $${total.toFixed(2)} registrada exitosamente.`,
    });
  };

  const resetForm = () => {
    setFormData({
      clienteId: '',
      productosVenta: [],
      ivaRate: 16,
      metodoPago: 'efectivo',
      pagosDiferidos: [],
    });
    setCurrentProduct({ productoId: '', cantidad: 1, precioUnitario: 0 });
  };

  const addPagoDiferido = () => {
    const { total } = calculateTotals();
    const montoPagado = formData.pagosDiferidos.reduce((acc, p) => acc + p.monto, 0);
    const montoRestante = total - montoPagado;

    if (montoRestante <= 0) return;

    setFormData({
      ...formData,
      pagosDiferidos: [...formData.pagosDiferidos, {
        id: crypto.randomUUID(),
        monto: 0,
        fechaVencimiento: new Date().toISOString().split('T')[0],
        pagado: false,
      }],
    });
  };

  const { subtotal, iva, total } = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Ventas</h2>
        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val);
          if (!val) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Venta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva Venta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cliente">Cliente</Label>
                  <Select value={formData.clienteId} onValueChange={(val) => setFormData({ ...formData, clienteId: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.filter(c => c.activo).map(cliente => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="metodoPago">Método de Pago</Label>
                  <Select value={formData.metodoPago} onValueChange={(val) => setFormData({ ...formData, metodoPago: val as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Productos</Label>
                <div className="grid grid-cols-4 gap-2">
                  <Select value={currentProduct.productoId} onValueChange={(val) => {
                    const prod = productos.find(p => p.id === val);
                    setCurrentProduct({ ...currentProduct, productoId: val, precioUnitario: prod?.precioVenta || 0 });
                  }}>
                    <SelectTrigger className="col-span-2">
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {productos.filter(p => p.stock > 0).map(producto => (
                        <SelectItem key={producto.id} value={producto.id}>
                          {producto.nombre} (Stock: {producto.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    value={currentProduct.cantidad}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, cantidad: parseInt(e.target.value) })}
                    placeholder="Cantidad"
                  />
                  <Button type="button" onClick={addProductToSale}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.productosVenta.map((item, index) => {
                  const producto = productos.find(p => p.id === item.productoId);
                  return (
                    <Card key={index}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-medium">{producto?.nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.cantidad} x ${item.precioUnitario.toFixed(2)} = ${(item.cantidad * item.precioUnitario).toFixed(2)}
                          </p>
                        </div>
                        <Button type="button" size="icon" variant="ghost" onClick={() => removeProductFromSale(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>IVA</Label>
                  <Select value={formData.ivaRate.toString()} onValueChange={(val) => setFormData({ ...formData, ivaRate: parseInt(val) as 8 | 16 })}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8">8%</SelectItem>
                      <SelectItem value="16">16%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA ({formData.ivaRate}%):</span>
                    <span>${iva.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Pagos Diferidos</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addPagoDiferido}>
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar Pago
                  </Button>
                </div>
                {formData.pagosDiferidos.map((pago, index) => (
                  <div key={pago.id} className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Monto"
                      value={pago.monto}
                      onChange={(e) => {
                        const newPagos = [...formData.pagosDiferidos];
                        newPagos[index].monto = parseFloat(e.target.value);
                        setFormData({ ...formData, pagosDiferidos: newPagos });
                      }}
                    />
                    <Input
                      type="date"
                      value={pago.fechaVencimiento}
                      onChange={(e) => {
                        const newPagos = [...formData.pagosDiferidos];
                        newPagos[index].fechaVencimiento = e.target.value;
                        setFormData({ ...formData, pagosDiferidos: newPagos });
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          pagosDiferidos: formData.pagosDiferidos.filter((_, i) => i !== index),
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Registrar Venta
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {ventas.map((venta) => {
          const cliente = clientes.find(c => c.id === venta.clienteId);
          return (
            <Card key={venta.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">
                    {cliente?.nombre || 'Cliente desconocido'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(venta.fecha).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">${venta.total.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{venta.metodoPago}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {venta.productos.map((item, index) => {
                    const producto = productos.find(p => p.id === item.productoId);
                    return (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{producto?.nombre} x {item.cantidad}</span>
                        <span>${(item.cantidad * item.precioUnitario).toFixed(2)}</span>
                      </div>
                    );
                  })}
                  {venta.pagosDiferidos.length > 0 && (
                    <p className="text-sm text-destructive font-medium mt-2">
                      Pagos diferidos: {venta.pagosDiferidos.length}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {ventas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay ventas registradas</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
