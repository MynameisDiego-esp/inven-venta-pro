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
import { clientSchema } from "@/lib/validators"; // <-- 1. Importa el esquema


// NUEVO: Importamos las funciones del servicio que se comunican con la API
import { getAllClients, createClient, updateClient, deleteClient } from "../../SERVICES/clientService";

// MODIFICADO: Ajustamos el tipo para que coincida con el backend (_id en lugar de id, etc.)
interface Cliente {
  _id: string;
  personType: 'Fisica' | 'moral';
  name: string;
  rfc: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  // createdAt y updatedAt son opcionales porque vienen del backend
  createdAt?: string;
  updatedAt?: string;
}

export default function Clientes() {
  // MODIFICADO: El estado inicial ahora es un array vacío. Se cargará desde la API.
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true); // NUEVO: Estado para la carga inicial
  const [open, setOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const { toast } = useToast();

  // MODIFICADO: El estado del formulario ahora coincide con los nombres de la API
  const [formData, setFormData] = useState({
    personType: 'Fisica' as 'Fisica' | 'moral',
    name: '',
    rfc: '',
    email: '',
    phone: '',
    address: '',
    isActive: true,
  });

  // NUEVO: Función para cargar o recargar los clientes desde la API
  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await getAllClients();
      setClientes(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // NUEVO: useEffect para cargar los datos cuando el componente se monta
  useEffect(() => {
    loadClients();
  }, []);


  // MODIFICADO: La función ahora es asíncrona y llama a la API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCliente) {
        // Lógica de Actualización
        await updateClient(editingCliente._id, formData);
        toast({
          title: "Cliente actualizado",
          description: `${formData.name} ha sido actualizado exitosamente.`,
        });
      } else {
        // Lógica de Creación
        await createClient(formData);
        toast({
          title: "Cliente creado",
          description: `${formData.name} ha sido registrado exitosamente.`,
        });
      }
      loadClients(); // Recargamos la lista de clientes
      setOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el cliente.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    // MODIFICADO: Ajustamos los nombres de los campos
    setFormData({
      personType: cliente.personType,
      name: cliente.name,
      rfc: cliente.rfc,
      email: cliente.email,
      phone: cliente.phone,
      address: cliente.address,
      isActive: cliente.isActive,
    });
    setOpen(true);
  };

  // MODIFICADO: La función ahora es asíncrona y llama a la API
  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
      try {
        await deleteClient(id);
        loadClients(); // Recargamos la lista
        toast({
          title: "Cliente eliminado",
          description: "El cliente ha sido eliminado exitosamente.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el cliente.",
          variant: "destructive",
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      personType: 'Fisica',
      name: '',
      rfc: '',
      email: '',
      phone: '',
      address: '',
      isActive: true,
    });
    setEditingCliente(null);
  };

  // NUEVO: Renderizado condicional mientras cargan los datos
  if (loading) {
    return <p>Cargando clientes...</p>;
  }

  return (
    <div className="space-y-6">
      {/* ... El resto del JSX no necesita cambios significativos ... */}
      {/* ... Solo asegúrate de que los campos del formulario y los datos que muestras ... */}
      {/* ... coincidan con los nuevos nombres de propiedad (ej. cliente._id, cliente.personType) ... */}

      {/* POR EJEMPLO, ESTA PARTE CAMBIA: */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clientes.map((cliente) => (
          // MODIFICADO: de cliente.id a cliente._id
          <Card key={cliente._id}> 
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {cliente.isActive ? (
                  <UserCheck className="h-4 w-4 text-secondary inline mr-2" />
                ) : (
                  <UserX className="h-4 w-4 text-muted-foreground inline mr-2" />
                )}
                {/* MODIFICADO: de cliente.nombre a cliente.name */}
                {cliente.name} 
              </CardTitle>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => handleEdit(cliente)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                {/* MODIFICADO: de cliente.id a cliente._id */}
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
                  {/* MODIFICADO: de cliente.telefono a cliente.phone */}
                  <span className="font-medium">Tel:</span> {cliente.phone}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {/* MODIFICADO: de cliente.tipo a cliente.personType */}
                  {cliente.personType === 'Fisica' ? 'Persona Física' : 'Persona Moral'}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* El resto de tu JSX debería funcionar, ya que los nombres en formData también los hemos actualizado */}
      {/* ... tu código del formulario y la tarjeta de "no hay clientes" ... */}
    </div>
  );
}