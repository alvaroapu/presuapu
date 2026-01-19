import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useCliente, useUpdateCliente } from "@/hooks/useClientes";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

export default function ClienteEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: cliente, isLoading } = useCliente(id);
  const updateCliente = useUpdateCliente();

  const [formData, setFormData] = useState({
    nombre: "",
    nombre_comercial: "",
    tipo_documento: "CIF",
    numero_documento: "",
    email: "",
    telefono: "",
    telefono_secundario: "",
    direccion: "",
    ciudad: "",
    provincia: "",
    codigo_postal: "",
    pais: "España",
    persona_contacto: "",
    notas: "",
  });

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre || "",
        nombre_comercial: cliente.nombre_comercial || "",
        tipo_documento: cliente.tipo_documento || "CIF",
        numero_documento: cliente.numero_documento || "",
        email: cliente.email || "",
        telefono: cliente.telefono || "",
        telefono_secundario: cliente.telefono_secundario || "",
        direccion: cliente.direccion || "",
        ciudad: cliente.ciudad || "",
        provincia: cliente.provincia || "",
        codigo_postal: cliente.codigo_postal || "",
        pais: cliente.pais || "España",
        persona_contacto: cliente.persona_contacto || "",
        notas: cliente.notas || "",
      });
    }
  }, [cliente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre es obligatorio",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateCliente.mutateAsync({
        id: id!,
        ...formData,
      });
      toast({
        title: "Cliente actualizado",
        description: "Los datos del cliente se han guardado correctamente",
      });
      navigate(`/clientes/${id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el cliente",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Cliente no encontrado</p>
        <Button variant="link" onClick={() => navigate('/clientes')}>
          Volver a clientes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Editar Cliente</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nombre_comercial">Nombre comercial</Label>
            <Input
              id="nombre_comercial"
              value={formData.nombre_comercial}
              onChange={(e) => setFormData({ ...formData, nombre_comercial: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tipo_documento">Tipo de documento</Label>
            <Select
              value={formData.tipo_documento}
              onValueChange={(value) => setFormData({ ...formData, tipo_documento: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CIF">CIF</SelectItem>
                <SelectItem value="NIF">NIF</SelectItem>
                <SelectItem value="NIE">NIE</SelectItem>
                <SelectItem value="Pasaporte">Pasaporte</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="numero_documento">Número de documento</Label>
            <Input
              id="numero_documento"
              value={formData.numero_documento}
              onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="persona_contacto">Persona de contacto</Label>
            <Input
              id="persona_contacto"
              value={formData.persona_contacto}
              onChange={(e) => setFormData({ ...formData, persona_contacto: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono_secundario">Teléfono secundario</Label>
            <Input
              id="telefono_secundario"
              value={formData.telefono_secundario}
              onChange={(e) => setFormData({ ...formData, telefono_secundario: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="direccion">Dirección</Label>
          <Input
            id="direccion"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="codigo_postal">Código postal</Label>
            <Input
              id="codigo_postal"
              value={formData.codigo_postal}
              onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ciudad">Ciudad</Label>
            <Input
              id="ciudad"
              value={formData.ciudad}
              onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="provincia">Provincia</Label>
            <Input
              id="provincia"
              value={formData.provincia}
              onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pais">País</Label>
            <Input
              id="pais"
              value={formData.pais}
              onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notas">Notas</Label>
          <Textarea
            id="notas"
            value={formData.notas}
            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
            rows={3}
          />
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={updateCliente.isPending}>
            {updateCliente.isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}
