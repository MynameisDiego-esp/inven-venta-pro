import { useState, useEffect } from "react"; // MODIFICADO: useEffect es necesario
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// NUEVO: Importamos las funciones del servicio que se comunican con la API
import { getAllProducts, createProduct, updateProduct, deleteProduct } from "../../SERVICES/productService";

// MODIFICADO: Definimos la estructura del producto que viene del backend
interface Producto {
  _id: string;
  name: string;
  category: string;
  description: string;
  acquisitionPrice: number;
  salePrice: number;
  stock: number;
  imageUrl?: string;
}

export default function Productos() {
  // MODIFICADO: El estado inicial es un array vacío y añadimos estado de carga
  const [productos, setProductos] = useState<Producto[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // Añade estados para paginación
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const { toast } = useToast();

  // MODIFICADO: El estado del formulario ahora coincide con los nombres de la API
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    acquisitionPrice: 0,
    salePrice: 0,
    stock: 0,
    imageUrl: '',
  });

  // NUEVO: Función para cargar o recargar los productos desde la API
  const loadProducts = async () => {
    try {
      setLoading(true);
      // Asumimos que tu servicio ahora puede tomar la página y el término de búsqueda
      const data = await getAllProducts(currentPage, searchTerm);
      
      // ✅ LA CORRECCIÓN ESTÁ AQUÍ
      // En lugar de guardar `data`, guarda la propiedad `products` de `data` en el estado
      setProductos(data.products); 
      setTotalPages(data.totalPages);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos.",
        variant: "destructive",
      });
      // Es una buena práctica asegurar que productos sea un array incluso en caso de error
      setProductos([]); 
    } finally {
      setLoading(false);
    }
  };

  // NUEVO: useEffect para la carga inicial de datos
  useEffect(() => {
    loadProducts();
  }, [currentPage, searchTerm]);

  // MODIFICADO: La función ahora es asíncrona y llama a la API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProducto) {
        // Lógica de Actualización
        await updateProduct(editingProducto._id, formData);
        toast({
          title: "Producto actualizado",
          description: `${formData.name} ha sido actualizado exitosamente.`,
        });
      } else {
        // Lógica de Creación
        await createProduct(formData);
        toast({
          title: "Producto creado",
          description: `${formData.name} ha sido registrado exitosamente.`,
        });
      }
      loadProducts(); // Recargamos la lista de productos
      setOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el producto.",
        variant: "destructive",
      });
    }
  };

  // MODIFICADO: Prepara el formulario para editar, ajustando los nombres de los campos
  const handleEdit = (producto: Producto) => {
    setEditingProducto(producto);
    setFormData({
      name: producto.name,
      category: producto.category,
      description: producto.description,
      acquisitionPrice: producto.acquisitionPrice,
      salePrice: producto.salePrice,
      stock: producto.stock,
      imageUrl: producto.imageUrl || '',
    });
    setOpen(true);
  };

  // MODIFICADO: La función ahora es asíncrona y llama a la API
  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      try {
        await deleteProduct(id);
        loadProducts(); // Recargamos la lista
        toast({
          title: "Producto eliminado",
          description: "El producto ha sido eliminado exitosamente.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el producto.",
          variant: "destructive",
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      acquisitionPrice: 0,
      salePrice: 0,
      stock: 0,
      imageUrl: '',
    });
    setEditingProducto(null);
  };

  // NUEVO: Renderizado condicional mientras cargan los datos
  if (loading) {
    return <p>Cargando productos...</p>;
  }

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
                {/* MODIFICADO: Nombres de los campos en el formulario */}
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Input id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                </div>
                <div>
                  <Label htmlFor="acquisitionPrice">Precio de Adquisición</Label>
                  <Input id="acquisitionPrice" type="number" step="0.01" value={formData.acquisitionPrice} onChange={(e) => setFormData({ ...formData, acquisitionPrice: parseFloat(e.target.value) || 0 })} required />
                </div>
                <div>
                  <Label htmlFor="salePrice">Precio de Venta</Label>
                  <Input id="salePrice" type="number" step="0.01" value={formData.salePrice} onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })} required />
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })} required />
                </div>
                <div>
                  <Label htmlFor="imageUrl">URL de Imagen</Label>
                  <Input id="imageUrl" type="url" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingProducto ? 'Actualizar' : 'Crear'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {productos.map((producto) => (
          // MODIFICADO: de producto.id a producto._id
          <Card key={producto._id} className="overflow-hidden">
            <div className="aspect-square bg-muted relative">
              {/* MODIFICADO: de producto.imagen a producto.imageUrl */}
              {producto.imageUrl ? (
                <img src={producto.imageUrl} alt={producto.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              {/* MODIFICADO: de producto.nombre a producto.name */}
              <CardTitle className="text-sm font-medium">{producto.name}</CardTitle>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => handleEdit(producto)}><Pencil className="h-4 w-4" /></Button>
                {/* MODIFICADO: de producto.id a producto._id */}
                <Button size="icon" variant="ghost" onClick={() => handleDelete(producto._id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                {/* MODIFICADO: de producto.descripcion a producto.description */}
                <p className="text-xs text-muted-foreground line-clamp-2">{producto.description}</p>
                <p className="text-muted-foreground">
                  {/* MODIFICADO: de producto.precioVenta a producto.salePrice */}
                  <span className="font-medium">Precio:</span> ${producto.salePrice.toFixed(2)}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Stock:</span> {producto.stock} unidades
                </p>
                <p className="text-xs text-muted-foreground">
                  {/* MODIFICADO: de producto.categoria a producto.category */}
                  {producto.category}
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