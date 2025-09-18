import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
// SUPABASE REMOVIDO
const TesteAgentePedidos = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState('')
  const [pedidoData, setPedidoData] = useState({
    nome: 'João da Silva',
    telefone: '(11) 99999-9999',
    endereco: 'Rua das Flores, 123',
    tipo: 'delivery' as 'delivery' | 'retirada',
    pagamento: 'Dinheiro',
    itens: [
      {
        produto_id: '1',
        nome_produto: 'Pizza Margherita',
        quantidade: 1,
        preco_unitario: 35.90,
        adicionais: [
          {
            nome: 'Borda Catupiry',
            preco: 8.00,
            quantidade: 1
          }
        ]

    ],
    observacoes: 'Teste do agente IA'
  })

  const handleTestarPedido = async () => {
    if (!token) {
      toast({
        title: "Erro",
        description: "Token é obrigatório",
        variant: "destructive";
      })
      return;
    }

    setLoading(true)
    
    try {
      const { data, error }  catch (error) { console.error('Error:', error) }= await Promise.resolve()
        body: pedidoData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (error) {
        console.error('Erro na função:', error)
        toast({
          title: "Erro",
          description: error.message || "Erro ao criar pedido",
          variant: "destructive"
        })
        return;


      toast({
        title: "Sucesso!",
        description: `Pedido criado com ID: ${data.pedido_id}`,
      })

      console.log('Resposta da função:', data)

    } catch (err) {
      console.error('Erro:', err)
      toast({
        title: "Erro",
        description: "Erro inesperado",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItens = [...pedidoData.itens];
    newItens[index] = { ...newItens[index], [field]: value };
    setPedidoData({ ...pedidoData, itens: newItens })
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Teste do Agente IA - Lançamento de Pedidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Token de Autenticação */}
          <div className="space-y-2">
            <Label htmlFor="token">Token de Autenticação</Label>
            <Input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Digite o token configurado no agente IA"
            />
            <p className="text-sm text-muted-foreground">
              Este token deve estar configurado no campo "token_pedidos" da configuração do agente IA
            </p>
          </div>

          {/* Dados do Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Cliente</Label>
              <Input
                id="nome"
                value={pedidoData.nome}
                onChange={(e) => setPedidoData({ ...pedidoData, nome: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={pedidoData.telefone}
                onChange={(e) => setPedidoData({ ...pedidoData, telefone: e.target.value })}
              />
            </div>
          </div>

          {/* Endereço e Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={pedidoData.endereco}
                onChange={(e) => setPedidoData({ ...pedidoData, endereco: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Entrega</Label>
              <select
                id="tipo"
                className="w-full p-2 border border-input rounded-md"
                value={pedidoData.tipo}
                onChange={(e) => setPedidoData({ ...pedidoData, tipo: e.target.value as 'delivery' | 'retirada' })}
              >
                <option value="delivery">Delivery</option>
                <option value="retirada">Retirada</option>
              </select>
            </div>
          </div>

          {/* Pagamento */}
          <div className="space-y-2">
            <Label htmlFor="pagamento">Forma de Pagamento</Label>
            <Input
              id="pagamento"
              value={pedidoData.pagamento}
              onChange={(e) => setPedidoData({ ...pedidoData, pagamento: e.target.value })}
            />
          </div>

          {/* Itens do Pedido */}
          <div className="space-y-4">
            <Label>Itens do Pedido</Label>
            {pedidoData.itens.map((item, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Produto</Label>
                    <Input
                      value={item.nome_produto}
                      onChange={(e) => updateItem(index, 'nome_produto', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      value={item.quantidade}
                      onChange={(e) => updateItem(index, 'quantidade', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preço Unitário</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.preco_unitario}
                      onChange={(e) => updateItem(index, 'preco_unitario', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtotal</Label>
                    <Input
                      value={`R$ ${(item.preco_unitario * item.quantidade).toFixed(2)}`}
                      disabled
                    />
                  </div>
                </div>
                
                {/* Adicionais */}
                {item.adicionais && item.adicionais.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm">Adicionais:</Label>
                    {item.adicionais.map((adicional, addIndex) => (
                      <div key={addIndex} className="text-sm text-muted-foreground">
                        + {adicional.nome} - R$ {adicional.preco.toFixed(2)}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={pedidoData.observacoes}
              onChange={(e) => setPedidoData({ ...pedidoData, observacoes: e.target.value })}
            />
          </div>

          {/* Total */}
          <div className="text-right">
            <p className="text-lg font-semibold">
              Total: R$ {pedidoData.itens.reduce((acc, item) => {
                const subtotalItem = item.preco_unitario * item.quantidade;
                const subtotalAdicionais = item.adicionais?.reduce((accAd, ad) => ;
                  accAd + (ad.preco * ad.quantidade), 0) || 0;
                return acc + subtotalItem + subtotalAdicionais;
              }, 0).toFixed(2)}
            </p>
          </div>

          {/* Botão de Teste */}
          <Button 
            onClick={handleTestarPedido} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testando...' : 'Testar Criação de Pedido'}
          </Button>

          {/* Instruções */}
          <div className="bg-muted p-4 rounded-md">
            <h4 className="font-semibold mb-2">Como testar:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Configure um token na configuração do agente IA (campo "token_pedidos")</li>
              <li>Ative o "habilitar_lancamento_pedidos" na configuração</li>
              <li>Cole o mesmo token no campo acima</li>
              <li>Ajuste os dados do pedido se necessário</li>
              <li>Clique em "Testar Criação de Pedido"</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
};

export default TesteAgentePedidos;
