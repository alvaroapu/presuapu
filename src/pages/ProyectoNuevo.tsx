import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useCreateProyecto } from "@/hooks/useProyectos";
import { useClientes } from "@/hooks/useClientes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProyectoNuevo() {
  const navigate = useNavigate();
  const createProyecto = useCreateProyecto();
  const { data: clientes } = useClientes();
  const { toast } = useToast();
  const [clienteOpen, setClienteOpen] = useState(false);

  const [form, setForm] = useState({
    titulo: "",
    cliente_id: null as string | null,
    cliente_nombre: "",
    estado: "nuevo",
    prioridad: "media",
    descripcion: "",
    medidas: "",
    materiales_necesarios: "",
    coste_estimado: "",
    notas: "",
    fecha_limite: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) return;

    try {
      const result = await createProyecto.mutateAsync({
        titulo: form.titulo.trim(),
        cliente_id: form.cliente_id,
        cliente_nombre: form.cliente_nombre || null,
        estado: form.estado,
        prioridad: form.prioridad,
        descripcion: form.descripcion.trim() || null,
        medidas: form.medidas.trim() || null,
        materiales_necesarios: form.materiales_necesarios.trim() || null,
        coste_estimado: form.coste_estimado ? Number(form.coste_estimado) : null,
        notas: form.notas.trim() || null,
        fecha_limite: form.fecha_limite || null,
      });
      toast({ title: "Proyecto creado" });
      navigate(`/proyectos/${result.id}`);
    } catch {
      toast({ title: "Error al crear proyecto", variant: "destructive" });
    }
  };

  const handleSelectCliente = (clienteId: string) => {
    const cliente = clientes?.find((c) => c.id === clienteId);
    setForm({
      ...form,
      cliente_id: clienteId,
      cliente_nombre: cliente?.nombre || "",
    });
    setClienteOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate("/proyectos")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Nuevo Proyecto</h1>
        </div>
        <Button type="submit" disabled={!form.titulo.trim() || createProyecto.isPending}>
          {createProyecto.isPending ? "Creando..." : "Crear Proyecto"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Proyecto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Título del proyecto *</Label>
                <Input
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ej: Rotulación furgoneta empresa X"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows={3}
                  placeholder="¿Qué necesita el cliente? Descripción general del proyecto..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalles Técnicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Medidas</Label>
                <Textarea
                  value={form.medidas}
                  onChange={(e) => setForm({ ...form, medidas: e.target.value })}
                  rows={3}
                  placeholder="Dimensiones, tamaños, superficies..."
                />
              </div>
              <div className="space-y-2">
                <Label>Materiales / Qué pedir</Label>
                <Textarea
                  value={form.materiales_necesarios}
                  onChange={(e) => setForm({ ...form, materiales_necesarios: e.target.value })}
                  rows={3}
                  placeholder="Materiales necesarios, qué hay que pedir a proveedores..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notas Internas</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                rows={4}
                placeholder="Cualquier anotación adicional..."
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estado y Prioridad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nuevo">Nuevo</SelectItem>
                    <SelectItem value="recopilando">Recopilando info</SelectItem>
                    <SelectItem value="listo">Listo para presupuesto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <Select value={form.prioridad} onValueChange={(v) => setForm({ ...form, prioridad: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fecha límite</Label>
                <Input
                  type="date"
                  value={form.fecha_limite}
                  onChange={(e) => setForm({ ...form, fecha_limite: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente existente</Label>
                <Popover open={clienteOpen} onOpenChange={setClienteOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      type="button"
                      className="w-full justify-between font-normal"
                    >
                      {form.cliente_id
                        ? clientes?.find((c) => c.id === form.cliente_id)?.nombre || "Cliente"
                        : "Seleccionar cliente..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar cliente..." />
                      <CommandList>
                        <CommandEmpty>No encontrado.</CommandEmpty>
                        <CommandGroup>
                          {clientes?.map((c) => (
                            <CommandItem
                              key={c.id}
                              value={c.nombre}
                              onSelect={() => handleSelectCliente(c.id)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  form.cliente_id === c.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div>
                                <div>{c.nombre}</div>
                                {c.nombre_comercial && (
                                  <div className="text-xs text-muted-foreground">{c.nombre_comercial}</div>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>O nombre libre</Label>
                <Input
                  value={form.cliente_nombre}
                  onChange={(e) => setForm({ ...form, cliente_nombre: e.target.value, cliente_id: null })}
                  placeholder="Nombre del cliente"
                  disabled={!!form.cliente_id}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coste Estimado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  value={form.coste_estimado}
                  onChange={(e) => setForm({ ...form, coste_estimado: e.target.value })}
                  placeholder="0.00"
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  €
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
