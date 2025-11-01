import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, UserCheck, UserX, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { clientSchema } from "@/lib/validators"; // Importas tu esquema de Zod

// Importamos las funciones del servicio
import { getAllClients, createClient, updateClient, deleteClient } from "../../SERVICES/clientService";

// (La interfaz Cliente se mantiene igual)
interface Cliente {
  _id: string;
  personType: 'Fisica' | 'moral';
  name: string;
  rfc: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    personType: 'Fisica' as 'Fisica' | 'moral',
    name: '',
    rfc: '',
    email: '',
    phone: '',
    address: '',
    isActive: true,
  });

  // Estado para los errores del formulario
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // loadClients con la corrección defensiva
  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await getAllClients(currentPage); 
      console.log("Datos recibidos en Clientes.tsx:", data);
      // Verificamos si 'data.clients' es un array
      setClientes(Array.isArray(data?.clients) ? data.clients : []);
      // Ponemos un valor por defecto para totalPages
      setTotalPages(data?.totalPages || 1);

    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes.",
        variant: "destructive",
      });
      setClientes([]); // Asegura que 'clientes' sea un array en caso de error
    } finally {
      setLoading(false);
    }
  };

  // useEffect ahora depende de 'currentPage'
  useEffect(() => {
    loadClients();
  }, [currentPage]); // Se ejecutará cada vez que 'currentPage' cambie


  // handleSubmit ahora incluye la validación de Zod
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({}); // Limpia errores antiguos

    // 1. Validar con Zod
    const result = clientSchema.safeParse(formData);

    // 2. Si hay errores, mostrarlos y detener
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        errors[issue.path[0]] = issue.message;
      });
      setFormErrors(errors);
      toast({ title: "Error de validación", description: "Corrige los campos.", variant: "destructive" });
      return;
    }

    // 3. Si la validación es exitosa, usar 'result.data'
    try {
      if (editingCliente) {
        await updateClient(editingCliente._id, result.data);
        toast({ title: "Cliente actualizado" });
      } else {
        await createClient(result.data);
        toast({ title: "Cliente creado" });
      }
      
      if (!editingCliente) setCurrentPage(1); 
      
      loadClients(); // Recargamos la lista
      setOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar el cliente.", variant: "destructive" });
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      personType: cliente.personType,
      name: cliente.name,
      rfc: cliente.rfc,
      email: cliente.email,
      phone: cliente.phone,
      address: cliente.address,
      isActive: cliente.isActive,
    });
    setFormErrors({}); // Limpia errores al abrir para editar
    setOpen(true);
  };

  // (handleDelete se mantiene igual)
  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
      try {
        await deleteClient(id);
        loadClients();
        toast({ title: "Cliente eliminado" });
      } catch (error) {
        toast({ title: "Error", description: "No se pudo eliminar.", variant: "destructive" });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      personType: 'Fisica', name: '', rfc: '', email: '', phone: '', address: '', isActive: true,
    });
    setEditingCliente(null);
    setFormErrors({}); // Limpia errores al resetear
  };

  if (loading) {
    return <p>Cargando clientes...</p>;
  }

  // AHORA ESTE RETURN INCLUYE EL FORMULARIO COMPLETO
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Clientes</h2>
        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val);
          if (!val) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                
                <div>
                  <Label htmlFor="personType">Tipo de Persona</Label>
                  <Select 
                    value={formData.personType} 
                    onValueChange={(val: 'Fisica' | 'moral') => setFormData({ ...formData, personType: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fisica">Persona Física</SelectItem>
                      <SelectItem value="moral">Persona Moral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="name">Nombre / Razón Social</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>
                
                <div>
                  <Label htmlFor="rfc">RFC</Label>
                  <Input
                    id="rfc"
                    value={formData.rfc}
                    onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
                  />
                  {formErrors.rfc && <p className="text-red-500 text-xs mt-1">{formErrors.rfc}</p>}
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>
                
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                </div>

                <div className="col-span-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                  {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(val) => setFormData({ ...formData, isActive: val })}
                  />
                  <Label htmlFor="isActive">Cliente Activo</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCliente ? 'Actualizar' : 'Crear'}
                </Button>
                                  console.log("Submitting form data:", formData);                
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clientes.map((cliente) => (
          <Card key={cliente._id}> 
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {cliente.isActive ? (
                  <UserCheck className="h-4 w-4 text-secondary inline mr-2" />
                ) : (
                  <UserX className="h-4 w-4 text-muted-foreground inline mr-2" />
                )}
                {cliente.name} 
              </CardTitle>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => handleEdit(cliente)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(cliente._id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium">RFC:</span> {cliente.rfc}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Email:</span> {cliente.email}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Tel:</span> {cliente.phone}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {cliente.personType === 'Fisica' ? 'Persona Física' : 'Persona Moral'}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clientes.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay clientes registrados</p>
          </CardContent>
        </Card>
      )}

      {/* Controles de Paginación */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <Button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
          Anterior
        </Button>
        <span>Página {currentPage} de {totalPages}</span>
        <Button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}