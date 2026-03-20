import { useState, useEffect } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { useProyecto, useUpdateProyecto, useDeleteProyecto } from "@/hooks/useProyectos";
import { useClientes } from "@/hooks/useClientes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  ArrowLeft,
  Save,
  Trash2,
  ChevronsUpDown,
  Check,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProyectoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: proyecto, isLoading } = useProyecto(id);
  const { data: clientes } = useClientes();
  const updateProyecto = useUpdateProyecto();
  const deleteProyecto = useDeleteProyecto();
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

  useEffect(() => {
    if (proyecto) {
      setForm({
        titulo: proyecto.titulo || "",
        cliente_id: proyecto.cliente_id || null,
        cliente_nombre: proyecto.cliente_nombre || "",
        estado: proyecto.estado || "nuevo",
        prioridad: proyecto.prioridad || "media",
        descripcion: proyecto.descripcion || "",
        medidas: proyecto.medidas || "",
        materiales_necesarios: proyecto.materiales_necesarios || "",
        coste_estimado: proyecto.coste_estimado != null ? String(proyecto.coste_estimado) : "",
        notas: proyecto.notas || "",
        fecha_limite: proyecto.fecha_limite || "",
      });
    }
  }, [proyecto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !form.titulo.trim()) return;

    try {
      await updateProyecto.mutateAsync({
        id,
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
      toast({ title: "Proyecto guardado" });
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("¿Eliminar este proyecto? Esta acción no se puede deshacer.")) return;
    try {
      await deleteProyecto.mutateAsync(id);
      toast({ title: "Proyecto eliminado" });
      navigate("/proyectos");
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
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

  const clearCliente = () => {
    setForm({ ...form, cliente_id: null, cliente_nombre: "" });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!proyecto) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Proyecto no encontrado</h1>
        <Button asChild variant="outline">
          <NavLink to="/proyectos">Volver</NavLink>
        </Button>
      </div>
    );
  }

  const estadoColors: Record<string, string> = {
    nuevo: "bg-blue-100 text-blue-800",
    recopilando: "bg-amber-100 text-amber-800",
    listo: "bg-green-100 text-green-800",
    presupuestado: "bg-purple-100 text-purple-800",
    descartado: "bg-gray-100 text-gray-500",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate("/proyectos")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{proyecto.titulo}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={estadoColors[form.estado] || ""}>
                {form.estado}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {form.estado === "listo" && (
            <Button type="button" variant="outline" asChild>
              <NavLink to="/presupuestos/nuevo">
                <FileText className="w-4 h-4 mr-2" />
                Crear Presupuesto
              </NavLink>
            </Button>
          )}
          <Button type="button" variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button type="submit" disabled={updateProyecto.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {updateProyecto.isPending ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info - 2 cols */}
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
                  placeholder="Dimensiones, tamaños, superficies... Toda info de medidas necesaria"
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
                placeholder="Cualquier anotación adicional, detalles importantes, cosas a tener en cuenta..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 col */}
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
                    <SelectItem value="presupuestado">Presupuestado</SelectItem>
                    <SelectItem value="descartado">Descartado</SelectItem>
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
                      className="w-full justify-between font-normal"
                    >
                      {form.cliente_id
                        ? clientes?.find((c) => c.id === form.cliente_id)?.nombre || form.cliente_nombre
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
                {form.cliente_id && (
                  <Button type="button" variant="ghost" size="sm" onClick={clearCliente} className="text-xs">
                    Quitar cliente
                  </Button>
                )}
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
              <div className="space-y-2">
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
                <p className="text-xs text-muted-foreground">
                  Estimación aproximada del coste del proyecto
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
