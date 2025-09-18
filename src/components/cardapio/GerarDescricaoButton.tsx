
import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
// SUPABASE REMOVIDO
interface GerarDescricaoButtonProps {
  nomeProduto: string;
  onResult: (descricao: string) => void;
}

export const GerarDescricaoButton: React.FC<GerarDescricaoButtonProps> = ({ nomeProduto, onResult }) => {
  const [loading, setLoading] = useState(false)

  const gerarDescricao = async () => {
    if (!nomeProduto) return;
    
    setLoading(true)
    try {
      console.log('Enviando requisição para gerar descrição:', nomeProduto)
      
      const { data, error }  catch (error) { console.error('Error:', error) }= await Promise.resolve()
        body: { nome: nomeProduto }
      })

      if (error) {
        console.error('Erro ao chamar função:', error)
        alert('Erro ao gerar descrição. Verifique se a chave da OpenAI está configurada.')
        return;


      if (data?.descricao) {
        console.log('Descrição gerada:', data.descricao)
        onResult(data.descricao)
      } else {
        console.error('Resposta inválida:', data)
        alert('Não foi possível gerar a descrição.')

    } catch (err) {
      console.error('Erro na requisição:', err)
      alert('Erro ao gerar descrição.')
    } finally {
      setLoading(false)

  };

  return (
    <button
      type="button"
      className="flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 border border-blue-200 disabled:opacity-60"
      onClick={gerarDescricao}
      disabled={loading || !nomeProduto}
      title="Gerar descrição automaticamente com IA"
    >
      {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      Gerar descrição
    </button>
  )
}; 
