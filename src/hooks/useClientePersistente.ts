import { useState, useEffect } from 'react';

export interface ClienteData {
  nome: string;
  telefone: string;
}

const STORAGE_KEY = 'menucloud_cliente_data';

export function useClientePersistente() {
  const [cliente, setCliente] = useState<ClienteData | null>(null)

  // Carregar dados do localStorage ao inicializar
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        console.log('🔄 Carregando dados do cliente salvos:', parsedData)
        setCliente(parsedData)
      }
     } catch (error) {
      console.error('❌ Erro ao carregar dados do cliente:', error)
      // Limpar dados corrompidos
      localStorage.removeItem(STORAGE_KEY)

  }, [])

  // Salvar dados do cliente
  const salvarCliente = (dadosCliente: ClienteData) => {
    try {
      console.log('💾 Salvando dados do cliente:', dadosCliente)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dadosCliente))
      setCliente(dadosCliente)
    } catch (error) {
      console.error('❌ Erro ao salvar dados do cliente:', error)

  };

  // Limpar dados do cliente
  const limparCliente = () => {
    try {
      console.log('🗑️ Limpando dados do cliente salvos')
      localStorage.removeItem(STORAGE_KEY)
      setCliente(null)
    } catch (error) {
      console.error('❌ Erro ao limpar dados do cliente:', error)

  };

  // Verificar se tem dados salvos
  const temDadosSalvos = cliente !== null && cliente.nome && cliente.telefone;

  return {
    cliente,
    salvarCliente,
    limparCliente,
    temDadosSalvos
  };
}
