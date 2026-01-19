import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, User, Building, Phone, Mail, MapPin } from "lucide-react";
import { useClientes, type Cliente } from "@/hooks/useClientes";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClienteForm } from "./ClienteForm";

interface ClienteSelectorProps {
  value: Cliente | null;
  onChange: (cliente: Cliente | null) => void;
}

export function ClienteSelector({ value, onChange }: ClienteSelectorProps) {
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(!value);
  const [showNuevoCliente, setShowNuevoCliente] = useState(false);
  const { data: clientes } = useClientes(search);

  const handleSelect = (cliente: Cliente) => {
    onChange(cliente);
    setShowSearch(false);
    setSearch("");
  };

  const handleCreated = (cliente: Cliente) => {
    onChange(cliente);
    setShowNuevoCliente(false);
    setShowSearch(false);
  };

  if (value && !showSearch) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{value.nombre}</span>
              </div>
              {value.nombre_comercial && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="w-4 h-4" />
                  <span>{value.nombre_comercial}</span>
                </div>
              )}
              {value.numero_documento && (
                <p className="text-sm text-muted-foreground">CIF/NIF: {value.numero_documento}</p>
              )}
              {value.direccion && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{value.direccion}, {value.codigo_postal} {value.ciudad}</span>
                </div>
              )}
              <div className="flex gap-4 text-sm text-muted-foreground">
                {value.telefono && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {value.telefono}
                  </div>
                )}
                {value.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {value.email}
                  </div>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowSearch(true)}>
              Cambiar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cliente por nombre o email..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      {search && clientes && clientes.length > 0 && (
        <div className="border rounded-lg max-h-60 overflow-auto">
          {clientes.map((c) => (
            <button
              key={c.id}
              className="w-full text-left p-3 hover:bg-muted border-b last:border-0 transition-colors"
              onClick={() => handleSelect(c)}
            >
              <p className="font-medium">{c.nombre}</p>
              <p className="text-sm text-muted-foreground">
                {c.nombre_comercial && `${c.nombre_comercial} • `}
                {c.email || c.telefono}
              </p>
            </button>
          ))}
        </div>
      )}

      {search && clientes?.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No se encontraron clientes
        </p>
      )}

      <Button variant="outline" className="w-full" onClick={() => setShowNuevoCliente(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Crear cliente nuevo
      </Button>

      <Dialog open={showNuevoCliente} onOpenChange={setShowNuevoCliente}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
          </DialogHeader>
          <ClienteForm onSuccess={handleCreated} onCancel={() => setShowNuevoCliente(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
