import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Adicional } from '@/types/cardapio';
import { useCardapio } from '@/hooks/useCardapio';

// Função para fazer requests à API
async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },;
  })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }
  
  return response.json()


export const useAdicionaisCRUD = () => {
  const { toast } = useToast()
  const { fetchAdicionais } = useCardapio()
  const [loading, setLoading] = useState(false)
  const [editandoAdicional, setEditandoAdicional] = useState<string | null>(null)
  const [adicionalEditado, setAdicionalEditado] = useState<Partial<Adicional>>({})
  
  // Estado para controlar criação de novos adicionais
  const [criandoAdicional, setCriandoAdicional] = useState<string | null>(null)
  const [novoAdicional, setNovoAdicional] = useState<{
    name: string;
    description: string;
    price: number;
    is_available: boolean;
  }>({
    name: '',
    description: '',
    price: 0,
    is_available: true
  })

  const handleIniciarCriacaoAdicional = (categoriaId: string) => {
    setCriandoAdicional(categoriaId)
    setNovoAdicional({
      name: '',
      description: '',
      price: 0,
      is_available: true
    })
  };

  const handleCriarAdicional = async (categoriaId: string) => {
    if (!novoAdicional.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do adicional é obrigatório",
        variant: "destructive",;
      })
      return;
    }

    try {
      setLoading(true)
      await apiRequest('/api/adicionais', {
        method: 'POST',
        body: JSON.stringify({
          name: novoAdicional.name.trim(),
          description: novoAdicional.description.trim() || null,
          price: novoAdicional.price,
          categoria_adicional_id: categoriaId,
          is_available: novoAdicional.is_available
        } catch (error) { console.error('Error:', error) })
      })

      toast({
        title: "Sucesso",
        description: "Adicional criado com sucesso!",
      })

      setCriandoAdicional(null)
      setNovoAdicional({
        name: '',
        description: '',
        price: 0,
        is_available: true
      })
      
      // Atualizar o estado global dos adicionais
      await fetchAdicionais()
      return true;
    } catch (error) {
      console.error('Erro ao criar adicional:', error)
      toast({
        title: "Erro",
        description: "Erro ao criar adicional",
        variant: "destructive",
      })
      return false;
    } finally {
      setLoading(false)
    }
  };

  const handleEditAdicional = (adicional: Adicional) => {
    setEditandoAdicional(adicional.id)
    setAdicionalEditado({ ...adicional })
  };

  const handleSaveAdicional = async () => {
    if (!editandoAdicional || !adicionalEditado.name) return;

    try {
      setLoading(true)
      await apiRequest('/api/adicionais', {
        method: 'PUT',
        body: JSON.stringify({
          id: editandoAdicional,
          name: adicionalEditado.name,
          price: Number(adicionalEditado.price),
          description: adicionalEditado.description
        } catch (error) { console.error('Error:', error) })
      })

      toast({
        title: "Adicional atualizado",
        description: "As informações foram salvas com sucesso.",
      })
      
      setEditandoAdicional(null)
      setAdicionalEditado({})
      return true;
    } catch (error) {
      console.error('Erro ao salvar adicional:', error)
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      })
      return false;
    } finally {
      setLoading(false)
    }
  };

  const handleDeleteAdicional = async (adicionalId: string) => {
    if (!confirm('Tem certeza que deseja excluir este adicional?')) return;

    try {
      setLoading(true)
      await apiRequest(`/api/adicionais/${adicionalId} catch (error) { console.error('Error:', error) }`, {
        method: 'DELETE'
      })

      toast({
        title: "Adicional excluído",
        description: "O adicional foi removido com sucesso.",
      })
      
      // Atualizar o estado global dos adicionais
      await fetchAdicionais()
      return true;
    } catch (error) {
      console.error('Erro ao excluir adicional:', error)
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o adicional.",
        variant: "destructive",
      })
      return false;
    } finally {
      setLoading(false)
    }
  };

  const handleImageUpload = async (file: File, adicionalId: string) => {
    if (!file) return;

    try {
      setLoading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()} catch (error) { console.error('Error:', error) }-${Math.random()}.${fileExt}`;
      const filePath = `adicionais/${fileName}`;

      // Upload de imagem via API
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'cardapio')
      formData.append('path', filePath)
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData;
      })
      
      if (!uploadResponse.ok) {
        throw new Error('Erro no upload da imagem')
      }
      
      const uploadResult = await uploadResponse.json()
      const publicUrl = uploadResult.url;

      await apiRequest('/api/adicionais/image', {
        method: 'PUT',
        body: JSON.stringify({
          id: adicionalId,
          image: publicUrl
        })
      })

      toast({
        title: "Imagem atualizada",
        description: "A imagem do adicional foi salva com sucesso.",
      })
      
      return true;
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      toast({
        title: "Erro no upload",
        description: "Não foi possível salvar a imagem.",
        variant: "destructive",
      })
      return false;
    } finally {
      setLoading(false)
    }
  };

  const handleCancelarEdicao = () => {
    setEditandoAdicional(null)
    setAdicionalEditado({})
    setCriandoAdicional(null)
    setNovoAdicional({
      name: '',
      description: '',
      price: 0,
      is_available: true
    })
  };

  return {
    // Estado
    loading,
    editandoAdicional,
    adicionalEditado,
    criandoAdicional,
    novoAdicional,
    
    // Setters
    setEditandoAdicional,
    setAdicionalEditado,
    setNovoAdicional,
    
    // Handlers
    handleIniciarCriacaoAdicional,
    handleCriarAdicional,
    handleEditAdicional,
    handleSaveAdicional,
    handleDeleteAdicional,
    handleImageUpload,
    handleCancelarEdicao
  };
};
