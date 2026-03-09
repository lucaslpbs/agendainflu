import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import CadastroInfluenciadora from "./pages/CadastroInfluenciadora";
import InfluencerProfile from "./pages/InfluencerProfile";
import ListaEspera from "./pages/ListaEspera";
import Dashboard from "./pages/panel/Dashboard";
import CalendarioPage from "./pages/panel/CalendarioPage";
import AgendamentosPage from "./pages/panel/AgendamentosPage";
import ServicosPage from "./pages/panel/ServicosPage";
import ClientesPage from "./pages/panel/ClientesPage";
import WaitlistPage from "./pages/panel/WaitlistPage";
import PerfilPage from "./pages/panel/PerfilPage";
import { AdminDashboard, AdminInfluenciadoras, AdminClientes } from "./pages/admin/AdminPages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) => {
  const { user, loading, roles, isAdmin } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requiredRole === "admin" && !isAdmin) return <Navigate to="/" />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro-influenciadora" element={<CadastroInfluenciadora />} />
            <Route path="/lista-espera" element={<ListaEspera />} />
            <Route path="/lista-espera/:username" element={<ListaEspera />} />

            {/* Influencer panel */}
            <Route path="/painel" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/painel/calendario" element={<ProtectedRoute><CalendarioPage /></ProtectedRoute>} />
            <Route path="/painel/agendamentos" element={<ProtectedRoute><AgendamentosPage /></ProtectedRoute>} />
            <Route path="/painel/servicos" element={<ProtectedRoute><ServicosPage /></ProtectedRoute>} />
            <Route path="/painel/clientes" element={<ProtectedRoute><ClientesPage /></ProtectedRoute>} />
            <Route path="/painel/lista-espera" element={<ProtectedRoute><WaitlistPage /></ProtectedRoute>} />
            <Route path="/painel/perfil" element={<ProtectedRoute><PerfilPage /></ProtectedRoute>} />

            {/* Admin panel */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/influenciadoras" element={<ProtectedRoute requiredRole="admin"><AdminInfluenciadoras /></ProtectedRoute>} />
            <Route path="/admin/clientes" element={<ProtectedRoute requiredRole="admin"><AdminClientes /></ProtectedRoute>} />

            {/* Public influencer profile - must be last */}
            <Route path="/:username" element={<InfluencerProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
