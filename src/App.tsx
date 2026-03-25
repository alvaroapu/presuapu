import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Presupuestos from "@/pages/Presupuestos";
import PresupuestoNuevo from "@/pages/PresupuestoNuevo";
import PresupuestoDetalle from "@/pages/PresupuestoDetalle";
import PresupuestoEditar from "@/pages/PresupuestoEditar";
import PresupuestoDuplicar from "@/pages/PresupuestoDuplicar";
import Facturas from "@/pages/Facturas";
import FacturaDetalle from "@/pages/FacturaDetalle";
import FacturaEditar from "@/pages/FacturaEditar";
import FacturaNueva from "@/pages/FacturaNueva";
import DashboardFacturas from "@/pages/DashboardFacturas";
import InformeCobrosPendientes from "@/pages/InformeCobrosPendientes";
import Clientes from "@/pages/Clientes";
import ClienteNuevo from "@/pages/ClienteNuevo";
import ClienteDetalle from "@/pages/ClienteDetalle";
import ClienteEditar from "@/pages/ClienteEditar";
import Catalogo from "@/pages/Catalogo";
import ProductoNuevo from "@/pages/ProductoNuevo";
import ProductoEditar from "@/pages/ProductoEditar";
import ProductoDuplicar from "@/pages/ProductoDuplicar";
import Configuracion from "@/pages/Configuracion";
import Stock from "@/pages/Stock";
import Proyectos from "@/pages/Proyectos";
import ProyectoNuevo from "@/pages/ProyectoNuevo";
import ProyectoDetalle from "@/pages/ProyectoDetalle";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="presupuestos" element={<Presupuestos />} />
            <Route path="presupuestos/nuevo" element={<PresupuestoNuevo />} />
            <Route path="presupuestos/:id" element={<PresupuestoDetalle />} />
            <Route path="presupuestos/:id/editar" element={<PresupuestoEditar />} />
            <Route path="presupuestos/:id/duplicar" element={<PresupuestoDuplicar />} />
            <Route path="facturas" element={<Facturas />} />
            <Route path="facturas/nueva" element={<FacturaNueva />} />
            <Route path="facturas/dashboard" element={<DashboardFacturas />} />
            <Route path="facturas/cobros-pendientes" element={<InformeCobrosPendientes />} />
            <Route path="facturas/:id" element={<FacturaDetalle />} />
            <Route path="facturas/:id/editar" element={<FacturaEditar />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="clientes/nuevo" element={<ClienteNuevo />} />
            <Route path="clientes/:id" element={<ClienteDetalle />} />
            <Route path="clientes/:id/editar" element={<ClienteEditar />} />
            <Route path="catalogo" element={<Catalogo />} />
            <Route path="catalogo/productos/nuevo" element={<ProductoNuevo />} />
            <Route path="catalogo/productos/:id" element={<ProductoEditar />} />
            <Route path="catalogo/productos/:id/duplicar" element={<ProductoDuplicar />} />
            <Route path="proyectos" element={<Proyectos />} />
            <Route path="proyectos/nuevo" element={<ProyectoNuevo />} />
            <Route path="proyectos/:id" element={<ProyectoDetalle />} />
            <Route path="configuracion" element={<Configuracion />} />
            <Route path="stock" element={<Stock />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
