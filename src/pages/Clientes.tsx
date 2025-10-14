import { useState } from "react";
import { Plus, Pencil, Trash2, UserCheck, UserX, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Cliente } from "@/types";
import { getClientes, saveCliente, deleteCliente } from "@/lib/storage";

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>(getClientes());
  const [open, setOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<Cliente>>({
    tipo: 'fisica',
    nombre: '',
    rfc: '',
    email: '',
    telefono: '',
    direccion: '',
    activo: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cliente: Cliente = {
      id: editingCliente?.id || crypto.randomUUID(),
      tipo: formData.tipo as 'fisica' | 'moral',
      nombre: formData.nombre || '',
      rfc: formData.rfc || '',
      email: formData.email || '',
      telefono: formData.telefono || '',
      direccion: formData.direccion || '',
      activo: formData.activo ?? true,
      fechaRegistro: editingCliente?.fechaRegistro || new Date().toISOString(),
    };

    saveCliente(cliente);
    setClientes(getClientes());
    setOpen(false);
    resetForm();
    toast({
      title: editingCliente ? "Cliente actualizado" : "Cliente creado",
      description: `${cliente.nombre} ha sido ${editingCliente ? 'actualizado' : 'registrado'} exitosamente.`,
    });
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData(cliente);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
      deleteCliente(id);
      setClientes(getClientes());
      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido eliminado exitosamente.",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: 'fisica',
      nombre: '',
      rfc: '',
      email: '',
      telefono: '',
      direccion: '',
      activo: true,
    });
    setEditingCliente(null);
  };

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
                  <Label htmlFor="tipo">Tipo de Persona</Label>
                  <Select value={formData.tipo} onValueChange={(val) => setFormData({ ...formData, tipo: val as 'fisica' | 'moral' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fisica">Persona Física</SelectItem>
                      <SelectItem value="moral">Persona Moral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nombre">Nombre / Razón Social</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rfc">RFC</Label>
                  <Input
                    id="rfc"
                    value={formData.rfc}
                    onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="activo"
                    checked={formData.activo}
                    onCheckedChange={(val) => setFormData({ ...formData, activo: val })}
                  />
                  <Label htmlFor="activo">Cliente Activo</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCliente ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clientes.map((cliente) => (
          <Card key={cliente.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {cliente.activo ? (
                  <UserCheck className="h-4 w-4 text-secondary inline mr-2" />
                ) : (
                  <UserX className="h-4 w-4 text-muted-foreground inline mr-2" />
                )}
                {cliente.nombre}
              </CardTitle>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => handleEdit(cliente)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(cliente.id)}>
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
                  <span className="font-medium">Tel:</span> {cliente.telefono}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {cliente.tipo === 'fisica' ? 'Persona Física' : 'Persona Moral'}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clientes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay clientes registrados</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
