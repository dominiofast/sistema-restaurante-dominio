
import React from 'react';
import { usePedidosDashboardLogic } from '../hooks/usePedidosDashboardLogic';
import { PedidosDashboardHeader } from '../components/pedidos/PedidosDashboardHeader';
import { PedidosContainer } from '../components/pedidos/PedidosContainer';
import { PedidosDashboardModals } from '../components/pedidos/PedidosDashboardModals';
import { PedidosDashboardStates } from '../components/pedidos/PedidosDashboardStates';

export default function PedidosDashboard() {
  const {
    busca,
    setBusca,
    tipoSelecionado,
    setTipoSelecionado,
    pedidoSelecionado,
    mostrarFiltros,
    setMostrarFiltros,
    filtrosAtivos,
    setFiltrosAtivos,
    intervaloHorasEntregue,
    setIntervaloHorasEntregue,
    pedidos,
    loading,
    error,
    companyId,
    dadosProcessados,
    updatePedidoStatus,
    reloadPedidos,
    onDragEnd,
    onSelectPedido,
    onCloseModal,
    onStatusChange,
    testarCampainha,
    campainhaInfo
  } = usePedidosDashboardLogic();

  // Verificar estados de carregamento, erro ou falta de empresa
  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <span className="ml-4 text-lg text-blue-700 font-semibold">Carregando pedidos...</span>
      </div>
    );

  
  if (error) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="h-10 w-10 text-red-500 mb-2">⚠️</div>
        <span className="text-lg text-red-700 font-semibold mb-2">Erro ao carregar pedidos</span>
        <span className="text-gray-700 mb-4">{error}</span>
        <button 
          onClick={reloadPedidos} 
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Recarregar Pedidos
        </button>
      </div>
    );


  if (!companyId) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="h-10 w-10 text-yellow-500 mb-2">⚠️</div>
        <span className="text-lg text-yellow-700 font-semibold mb-2">Nenhuma empresa selecionada</span>
        <span className="text-gray-700">Selecione uma empresa para visualizar os pedidos</span>
      </div>
    );


  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <PedidosDashboardHeader
        busca={busca}
        setBusca={setBusca}
        filtrosAtivos={filtrosAtivos}
        setMostrarFiltros={setMostrarFiltros}
        tipoSelecionado={tipoSelecionado}
        setTipoSelecionado={setTipoSelecionado}
      />

      <div className="flex-1 overflow-hidden">
        <PedidosContainer
          pedidos={pedidos}
          pedidosPorStatus={dadosProcessados.pedidosPorStatus}
          busca={busca}
          setBusca={setBusca}
          tipoSelecionado={tipoSelecionado}
          setTipoSelecionado={setTipoSelecionado}
          intervaloHorasEntregue={intervaloHorasEntregue}
          setIntervaloHorasEntregue={setIntervaloHorasEntregue}
          onDragEnd={onDragEnd}
          onUpdateStatus={updatePedidoStatus}
          onSelectPedido={onSelectPedido}
          onShowFilters={() => setMostrarFiltros(true)}
          filtrosAtivos={filtrosAtivos}
          campainhaInfo={campainhaInfo}
        />
      </div>
      
      <PedidosDashboardModals
        pedidos={pedidos}
        pedidoSelecionado={pedidoSelecionado}
        onCloseModal={onCloseModal}
        onStatusChange={onStatusChange}
        mostrarFiltros={mostrarFiltros}
        setMostrarFiltros={setMostrarFiltros}
        setFiltrosAtivos={setFiltrosAtivos}
      />
    </div>
  );

