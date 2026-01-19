import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClienteForm } from "@/components/presupuestos/ClienteForm";
import type { Cliente } from "@/hooks/useClientes";

export default function ClienteNuevo() {
  const navigate = useNavigate();

  const handleSuccess = (cliente: Cliente) => {
    navigate(`/clientes/${cliente.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Nuevo Cliente</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <ClienteForm onSuccess={handleSuccess} onCancel={() => navigate(-1)} />
        </CardContent>
      </Card>
    </div>
  );
}
