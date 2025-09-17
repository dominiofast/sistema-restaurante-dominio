import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageSquare, Bot, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LandingHeader } from '@/components/landing/LandingHeader';

interface DemoForm {
  nome: string;
  telefone: string;
  email: string;
  tipoEstabelecimento: string;
  tipoOperacao: string;
  desafios: string[];
}

const DemonstracaoPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState<DemoForm>({
    nome: '',
    telefone: '',
    email: '',
    tipoEstabelecimento: '',
    tipoOperacao: '',
    desafios: []
  });

  const handleDesafioChange = (desafio: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      desafios: checked 
        ? [...prev.desafios, desafio]
        : prev.desafios.filter(d => d !== desafio)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke('send-demo-request', {
        body: {
          ...formData,
          timestamp: new Date().toISOString()
        }
      });

      if (error) throw error;

      toast({
        title: "Solicitação enviada!",
        description: "Nossa equipe entrará em contato em breve para agendar sua demonstração.",
      });

      // Reset form
      setFormData({
        nome: '',
        telefone: '',
        email: '',
        tipoEstabelecimento: '',
        tipoOperacao: '',
        desafios: []
      });

    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente ou entre em contato conosco.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <LandingHeader 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
      />

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Conteúdo Explicativo */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Solicite uma demonstração
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Aprenda como nossa plataforma pode ajudar a expandir seu negócio.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Preencha o formulário e entraremos em contato para ajudá-lo a aumentar suas vendas e automatizar o seu negócio.
              </h3>
              <p className="text-gray-600 mb-6">
                A demonstração inclui uma explicação detalhada do Sistema focada exclusivamente em atender o seu negócio.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Pedidos WhatsApp</h4>
                  <p className="text-sm text-gray-600">Receba pedidos direto no WhatsApp com cardápio digital</p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">IA 24/7</h4>
                  <p className="text-sm text-gray-600">Atendimento automatizado inteligente</p>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Send className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Marketing</h4>
                  <p className="text-sm text-gray-600">Disparos automatizados e campanhas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Seu Nome"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="telefone">Melhor telefone (DDD + Número) *</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  placeholder="(11) 99999-5111"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="seu@email.com"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="tipo-estabelecimento">Tipo de estabelecimento *</Label>
                <Select value={formData.tipoEstabelecimento} onValueChange={(value) => setFormData(prev => ({ ...prev, tipoEstabelecimento: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione seu tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurante">Restaurante</SelectItem>
                    <SelectItem value="lanchonete">Lanchonete</SelectItem>
                    <SelectItem value="pizzaria">Pizzaria</SelectItem>
                    <SelectItem value="hamburgueria">Hamburgueria</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="cafe">Café</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tipo-operacao">Principais tipos de operação do restaurante</Label>
                <Select value={formData.tipoOperacao} onValueChange={(value) => setFormData(prev => ({ ...prev, tipoOperacao: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione a operação do seu restaurante" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="balcao">Balcão</SelectItem>
                    <SelectItem value="mesa">Mesa</SelectItem>
                    <SelectItem value="misto">Misto (Delivery + Balcão + Mesa)</SelectItem>
                    <SelectItem value="delivery-balcao">Delivery + Balcão</SelectItem>
                    <SelectItem value="balcao-mesa">Balcão + Mesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Quais são os principais desafios do seu negócio? *</Label>
                <div className="mt-3 space-y-3">
                  {[
                    'Muitos pedidos para dar conta',
                    'Modernizar meu atendimento',
                    'Organizar meu delivery próprio',
                    'Aumentar margem de lucros',
                    'Aumentar minhas vendas',
                    'Controle de caixa e financeiro',
                    'Automatizar processos via WhatsApp'
                  ].map((desafio) => (
                    <div key={desafio} className="flex items-center space-x-2">
                      <Checkbox
                        id={desafio}
                        checked={formData.desafios.includes(desafio)}
                        onCheckedChange={(checked) => handleDesafioChange(desafio, checked as boolean)}
                      />
                      <Label htmlFor={desafio} className="text-sm font-normal cursor-pointer">
                        {desafio}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Solicitar Demonstração'}
              </Button>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DemonstracaoPage;