import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

import { getAllProducts, createProduct, updateProduct, deleteProduct } from "../../SERVICES/productService";

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
  const [productos, setProductos] = useState<Producto[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Input temporal para el buscador
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [open, setOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    acquisitionPrice: 0,
    salePrice: 0,
    stock: 0,
    imageUrl: '',
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts(currentPage, searchTerm, 24);
      
      console.log("API Response:", data); // Para debugging
      
      // Manejar diferentes estructuras de respuesta de la API
      if (data.products && Array.isArray(data.products)) {
        // Si la API devuelve { products: [...], totalPages: X, total: Y }
        setProductos(data.products);
        setTotalPages(data.totalPages || 1);
        setTotalProducts(data.total || data.products.length);
      } else if (Array.isArray(data)) {
        // Si la API devuelve directamente un array [...]
        setProductos(data);
        setTotalPages(1);
        setTotalProducts(data.length);
      } else {
        setProductos([]);
        setTotalPages(1);
        setTotalProducts(0);
      }
      
    } catch (error) {
      console.error("Error loading products:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos.",
        variant: "destructive",
      });
      setProductos([]); 
      setTotalPages(1);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [currentPage, searchTerm]);

  // Manejador de búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1); // Reset a la primera página al buscar
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProducto) {
        await updateProduct(editingProducto._id, formData);
        toast({
          title: "Producto actualizado",
          description: `${formData.name} ha sido actualizado exitosamente.`,
        });
      } else {
        await createProduct(formData);
        toast({
          title: "Producto creado",
          description: `${formData.name} ha sido registrado exitosamente.`,
        });
      }
      loadProducts();
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

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      try {
        await deleteProduct(id);
        loadProducts();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg">Cargando productos...</p>
      </div>
    );
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

      {/* BARRA DE BÚSQUEDA */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar por nombre, categoría o descripción..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Buscar</Button>
            {searchTerm && (
              <Button type="button" variant="outline" onClick={clearSearch}>
                Limpiar
              </Button>
            )}
          </form>
          
          {/* Información de resultados */}
          <div className="mt-3 text-sm text-muted-foreground">
            {searchTerm ? (
              <span>
                Mostrando {productos.length} resultado(s) de {totalProducts} para "{searchTerm}"
              </span>
            ) : (
              <span>Total de productos: {totalProducts}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* GRID DE PRODUCTOS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {productos.map((producto) => (
          <Card key={producto._id} className="overflow-hidden">
            <div className="aspect-square bg-muted relative">
              {producto.imageUrl ? (
                <img src={producto.imageUrl} alt={producto.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{producto.name}</CardTitle>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => handleEdit(producto)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(producto._id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="text-xs text-muted-foreground line-clamp-2">{producto.description}</p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Precio:</span> ${producto.salePrice.toFixed(2)}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Stock:</span> {producto.stock} unidades
                </p>
                <p className="text-xs text-muted-foreground">
                  {producto.category}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MENSAJE CUANDO NO HAY PRODUCTOS */}
      {productos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? `No se encontraron productos para "${searchTerm}"` : 'No hay productos registrados'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* PAGINACIÓN */}
      {productos.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <Button 
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm font-medium">
            Página {currentPage} de {totalPages}
          </span>
          <Button 
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}