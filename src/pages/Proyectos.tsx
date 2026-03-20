import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useProyectos } from "@/hooks/useProyectos";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardList,
  Plus,
  Search,
  Calendar,
  User,
  Euro,
  AlertCircle,
} from "lucide-react";

const estadoLabels: Record<string, string> = {
  nuevo: "Nuevo",
  recopilando: "Recopilando info",
  listo: "Listo para presupuesto",
  presupuestado: "Presupuestado",
  descartado: "Descartado",
};

const estadoColors: Record<string, string> = {
  nuevo: "bg-blue-100 text-blue-800",
  recopilando: "bg-amber-100 text-amber-800",
  listo: "bg-green-100 text-green-800",
  presupuestado: "bg-purple-100 text-purple-800",
  descartado: "bg-gray-100 text-gray-500",
};

const prioridadColors: Record<string, string> = {
  baja: "bg-gray-100 text-gray-600",
  media: "bg-blue-100 text-blue-700",
  alta: "bg-orange-100 text-orange-700",
  urgente: "bg-red-100 text-red-700",
};

const prioridadLabels: Record<string, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente",
};

export default function Proyectos() {
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const { data: proyectos, isLoading } = useProyectos(estadoFilter);

  const filtered = proyectos?.filter((p: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      p.titulo.toLowerCase().includes(s) ||
      (p.cliente_nombre && p.cliente_nombre.toLowerCase().includes(s)) ||
      (p.clientes?.nombre && p.clientes.nombre.toLowerCase().includes(s)) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(s))
    );
  });

  const counts = {
    todos: proyectos?.length || 0,
    nuevo: proyectos?.filter((p: any) => p.estado === "nuevo").length || 0,
    recopilando: proyectos?.filter((p: any) => p.estado === "recopilando").length || 0,
    listo: proyectos?.filter((p: any) => p.estado === "listo").length || 0,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Próximos Proyectos</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Próximos Proyectos</h1>
            <p className="text-muted-foreground text-sm">
              Recogida de información previa al presupuesto
            </p>
          </div>
        </div>
        <Button asChild>
          <NavLink to="/proyectos/nuevo">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proyecto
          </NavLink>
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setEstadoFilter("todos")}>
          <CardContent className="pt-4 pb-3">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{counts.todos}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setEstadoFilter("nuevo")}>
          <CardContent className="pt-4 pb-3">
            <div className="text-sm text-muted-foreground">Nuevos</div>
            <div className="text-2xl font-bold text-blue-600">{counts.nuevo}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setEstadoFilter("recopilando")}>
          <CardContent className="pt-4 pb-3">
            <div className="text-sm text-muted-foreground">Recopilando</div>
            <div className="text-2xl font-bold text-amber-600">{counts.recopilando}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setEstadoFilter("listo")}>
          <CardContent className="pt-4 pb-3">
            <div className="text-sm text-muted-foreground">Listos</div>
            <div className="text-2xl font-bold text-green-600">{counts.listo}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar proyecto o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={estadoFilter} onValueChange={setEstadoFilter}>
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="nuevo">Nuevos</TabsTrigger>
            <TabsTrigger value="recopilando">Recopilando</TabsTrigger>
            <TabsTrigger value="listo">Listos</TabsTrigger>
            <TabsTrigger value="presupuestado">Presupuestados</TabsTrigger>
            <TabsTrigger value="descartado">Descartados</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Project list */}
      {!filtered?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hay proyectos{estadoFilter !== "todos" ? ` con estado "${estadoLabels[estadoFilter]}"` : ""}.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((p: any) => {
            const clientName = p.clientes?.nombre || p.cliente_nombre;
            const isOverdue = p.fecha_limite && new Date(p.fecha_limite) < new Date() && !['presupuestado', 'descartado'].includes(p.estado);

            return (
              <NavLink key={p.id} to={`/proyectos/${p.id}`}>
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-base truncate">
                            {p.titulo}
                          </h3>
                          <Badge className={`text-xs shrink-0 ${estadoColors[p.estado] || ""}`}>
                            {estadoLabels[p.estado] || p.estado}
                          </Badge>
                          <Badge className={`text-xs shrink-0 ${prioridadColors[p.prioridad] || ""}`}>
                            {prioridadLabels[p.prioridad] || p.prioridad}
                          </Badge>
                        </div>

                        {p.descripcion && (
                          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                            {p.descripcion}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {clientName && (
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {clientName}
                            </span>
                          )}
                          {p.coste_estimado != null && (
                            <span className="flex items-center gap-1">
                              <Euro className="w-3.5 h-3.5" />
                              {Number(p.coste_estimado).toLocaleString("es-ES", { minimumFractionDigits: 2 })} €
                            </span>
                          )}
                          {p.fecha_limite && (
                            <span className={`flex items-center gap-1 ${isOverdue ? "text-red-600 font-medium" : ""}`}>
                              {isOverdue && <AlertCircle className="w-3.5 h-3.5" />}
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(p.fecha_limite).toLocaleDateString("es-ES")}
                            </span>
                          )}
                          <span className="text-muted-foreground/60">
                            Creado {new Date(p.created_at).toLocaleDateString("es-ES")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}
