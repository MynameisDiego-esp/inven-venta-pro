import { useState } from "react";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Producto } from "@/types";
import { getProductos, saveProducto, deleteProducto } from "@/lib/storage";

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>(getProductos());
  const [open, setOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<Producto>>({
    nombre: '',
    descripcion: '',
    precioAdquisicion: 0,
    precioVenta: 0,
    stock: 0,
    imagen: '',
    categoria: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const producto: Producto = {
      id: editingProducto?.id || crypto.randomUUID(),
      nombre: formData.nombre || '',
      descripcion: formData.descripcion || '',
      precioAdquisicion: formData.precioAdquisicion || 0,
      precioVenta: formData.precioVenta || 0,
      stock: formData.stock || 0,
      imagen: formData.imagen || '',
      categoria: formData.categoria || '',
      fechaRegistro: editingProducto?.fechaRegistro || new Date().toISOString(),
    };

    saveProducto(producto);
    setProductos(getProductos());
    setOpen(false);
    resetForm();
    toast({
      title: editingProducto ? "Producto actualizado" : "Producto creado",
      description: `${producto.nombre} ha sido ${editingProducto ? 'actualizado' : 'registrado'} exitosamente.`,
    });
  };

  const handleEdit = (producto: Producto) => {
    setEditingProducto(producto);
    setFormData(producto);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      deleteProducto(id);
      setProductos(getProductos());
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado exitosamente.",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precioAdquisicion: 0,
      precioVenta: 0,
      stock: 0,
      imagen: '',
      categoria: '',
    });
    setEditingProducto(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Productos</h2>
        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val);
          if (!val) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProducto ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoría</Label>
                  <Input
                    id="categoria"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="precioAdquisicion">Precio de Adquisición</Label>
                  <Input
                    id="precioAdquisicion"
                    type="number"
                    step="0.01"
                    value={formData.precioAdquisicion}
                    onChange={(e) => setFormData({ ...formData, precioAdquisicion: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="precioVenta">Precio de Venta</Label>
                  <Input
                    id="precioVenta"
                    type="number"
                    step="0.01"
                    value={formData.precioVenta}
                    onChange={(e) => setFormData({ ...formData, precioVenta: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="imagen">URL de Imagen</Label>
                  <Input
                    id="imagen"
                    type="url"
                    value={formData.imagen}
                    onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProducto ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {productos.map((producto) => (
          <Card key={producto.id} className="overflow-hidden">
            <div className="aspect-square bg-muted relative">
              {producto.imagen ? (
                <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{producto.nombre}</CardTitle>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => handleEdit(producto)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(producto.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="text-xs text-muted-foreground line-clamp-2">{producto.descripcion}</p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Precio:</span> ${producto.precioVenta.toFixed(2)}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Stock:</span> {producto.stock} unidades
                </p>
                <p className="text-xs text-muted-foreground">
                  {producto.categoria}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {productos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay productos registrados</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
