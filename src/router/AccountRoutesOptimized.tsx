import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ProtectedRouteWithPermissions } from "@/components/auth/ProtectedRouteWithPermissions";
import AppLayout from "@/layouts/AppLayout";

// Import principais páginas diretamente
import PedidosDashboard from "@/pages/PedidosDashboard";
import PDVPage from "@/pages/PDVPage";
import LoginPage from '@/pages/LoginPage';
import NotFound from "@/pages/NotFound";
import Unauthorized from "@/pages/Unauthorized";

const ProtectedAppLayout = () => (
  <ProtectedRoute>
    <AppLayout />
  </ProtectedRoute>
);

const AccountRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Rotas Principais com Layout */}
      <Route element={<ProtectedAppLayout />}>
        <Route path="/pdv" element={<PDVPage />} />
        <Route path="/pedidos" element={<PedidosDashboard />} />
      </Route>
      
      {/* Página de acesso negado */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Rota não encontrada */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AccountRoutes;
