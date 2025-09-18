import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

// Import direto apenas do cardápio (página crítica)
import CardapioPublico from "@/pages/CardapioPublico";

// Lazy loading para páginas secundárias
const ConfirmarEndereco = lazy(() => import("@/pages/ConfirmarEndereco"))
const AcompanharPedidoRefatorado = lazy(() => import("@/pages/AcompanharPedidoRefatorado").then(m => ({ default: m.AcompanharPedidoRefatorado })))
const VagaPublica = lazy(() => import("@/components/vagas/VagaPublica"))
const VagasPublicas = lazy(() => import("@/pages/VagasPublicas"))
const ProdutoAdicionado = lazy(() => import("@/pages/ProdutoAdicionado"))
const AutoatendimentoTablet = lazy(() => import("@/pages/AutoatendimentoTablet"))
const NotFound = lazy(() => import("@/pages/NotFound"))
const ShortLinkRedirect = lazy(() => import("@/pages/ShortLinkRedirect"))
const LinksDemo = lazy(() => import("@/pages/LinksDemo"))

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
)

const PublicRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Rota para a raiz - também carrega o cardápio público */}
        <Route path="/" element={<CardapioPublico />} />
        {/* Demo dos links curtos */}
        <Route path="/links-demo" element={<LinksDemo />} />
        {/* Rota para links curtos - similar ao Anota AI */}
        <Route path="/c/:short_id" element={<ShortLinkRedirect />} />
        {/* Rota para autoatendimento em tablet */}
        <Route path="/autoatendimento/:company_slug" element={<AutoatendimentoTablet />} />
        {/* Rota principal para cardápio - deve capturar qualquer coisa após / */}
        <Route path="/:company_slug" element={<CardapioPublico />} />
        <Route path="/:company_slug/produto-adicionado" element={<ProdutoAdicionado />} />
        <Route path="/:company_slug/carrinho" element={<CardapioPublico />} />
        <Route path="/:company_slug/checkout" element={<CardapioPublico />} />
        <Route path="/:company_slug/pedido/:numero_pedido" element={<AcompanharPedidoRefatorado />} />
        <Route path="/acompanhar-pedido/:numero_pedido" element={<AcompanharPedidoRefatorado />} />
        <Route path="/vagas/:slug/:vagaId" element={<VagaPublica />} />
        <Route path="/confirmar-endereco" element={<ConfirmarEndereco />} />
        <Route path="/vagas-publicas/:slug_empresa" element={<VagasPublicas />} />
        
        {/* Rota não encontrada para o subdomínio de pedidos */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>;
  )
};

export default PublicRoutes;
