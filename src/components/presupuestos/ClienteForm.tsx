import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCliente, type Cliente } from "@/hooks/useClientes";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClienteFormProps {
  onSuccess?: (cliente: Cliente) => void;
  onCancel?: () => void;
  initialData?: Partial<Cliente>;
}

export function ClienteForm({ onSuccess, onCancel, initialData }: ClienteFormProps) {
  const createCliente = useCreateCliente();
  const { toast } = useToast();
  
  const [form, setForm] = useState({
    nombre: initialData?.nombre || '',
    nombre_comercial: initialData?.nombre_comercial || '',
    tipo_documento: initialData?.tipo_documento || 'NIF',
    numero_documento: initialData?.numero_documento || '',
    email: initialData?.email || '',
    telefono: initialData?.telefono || '',
    telefono_secundario: initialData?.telefono_secundario || '',
    direccion: initialData?.direccion || '',
    ciudad: initialData?.ciudad || '',
    provincia: initialData?.provincia || '',
    codigo_postal: initialData?.codigo_postal || '',
    persona_contacto: initialData?.persona_contacto || '',
    notas: initialData?.notas || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      toast({ title: "El nombre es obligatorio", variant: "destructive" });
      return;
    }

    try {
      const cliente = await createCliente.mutateAsync(form);
      toast({ title: "Cliente creado" });
      onSuccess?.(cliente);
    } catch {
      toast({ title: "Error al crear cliente", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Nombre *</Label>
          <Input 
            value={form.nombre} 
            onChange={e => setForm({...form, nombre: e.target.value})}
            placeholder="Nombre o razón social"
          />
        </div>
        <div className="space-y-2">
          <Label>Nombre comercial</Label>
          <Input 
            value={form.nombre_comercial} 
            onChange={e => setForm({...form, nombre_comercial: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label>Tipo documento</Label>
          <Select value={form.tipo_documento} onValueChange={v => setForm({...form, tipo_documento: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NIF">NIF</SelectItem>
              <SelectItem value="CIF">CIF</SelectItem>
              <SelectItem value="NIE">NIE</SelectItem>
              <SelectItem value="Pasaporte">Pasaporte</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Número documento</Label>
          <Input 
            value={form.numero_documento} 
            onChange={e => setForm({...form, numero_documento: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input 
            type="email"
            value={form.email} 
            onChange={e => setForm({...form, email: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label>Teléfono</Label>
          <Input 
            value={form.telefono} 
            onChange={e => setForm({...form, telefono: e.target.value})}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Dirección</Label>
          <Input 
            value={form.direccion} 
            onChange={e => setForm({...form, direccion: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label>Ciudad</Label>
          <Input 
            value={form.ciudad} 
            onChange={e => setForm({...form, ciudad: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label>Código Postal</Label>
          <Input 
            value={form.codigo_postal} 
            onChange={e => setForm({...form, codigo_postal: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label>Provincia</Label>
          <Input 
            value={form.provincia} 
            onChange={e => setForm({...form, provincia: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label>Persona de contacto</Label>
          <Input 
            value={form.persona_contacto} 
            onChange={e => setForm({...form, persona_contacto: e.target.value})}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Notas</Label>
          <Textarea 
            value={form.notas} 
            onChange={e => setForm({...form, notas: e.target.value})}
            rows={2}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={createCliente.isPending}>
          {createCliente.isPending ? 'Guardando...' : 'Guardar Cliente'}
        </Button>
      </div>
    </form>
  );
}
