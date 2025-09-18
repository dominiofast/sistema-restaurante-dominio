import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Star, Zap, Shield, TrendingUp } from 'lucide-react';

interface HeroSectionProps {
  handleTrialSubmit: (e: React.FormEvent) => void;
}

export const HeroSection = ({ handleTrialSubmit }: HeroSectionProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    ordersPerDay: '',
    hasComputer: '',
    acceptTerms: false;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {;
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-background via-accent to-muted overflow-hidden pt-24 sm:pt-28 lg:pt-32">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-muted via-transparent to-transparent"></div>
      </div>


      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-12rem)]">
          
          {/* Content Side */}
          <div className="space-y-8">
            {/* Professional Badge */}
            <div className="inline-flex items-center gap-2 bg-card backdrop-blur-md border border-border rounded-full px-4 py-2 shadow-lg">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-foreground">Plataforma empresarial líder no mercado</span>
            </div>

            {/* Professional Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-foreground">
                  Automatize seu
                </span>
                <br />
                <span className="text-primary">
                  WhatsApp Business
                </span>
                <br />
                <span className="text-secondary">com inteligência artificial</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Plataforma empresarial completa para automatizar atendimentos, 
                aumentar conversões e otimizar processos comerciais com tecnologia de ponta.
              </p>
            </div>

            {/* Corporate Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 bg-card backdrop-blur-md rounded-lg border border-border shadow-sm">
                <div className="text-2xl font-bold text-primary mb-1">+40%</div>
                <div className="text-sm text-muted-foreground">Aumento em Vendas</div>
              </div>
              <div className="text-center p-4 bg-card backdrop-blur-md rounded-lg border border-border shadow-sm">
                <div className="text-2xl font-bold text-secondary mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">Atendimento Automatizado</div>
              </div>
              <div className="text-center p-4 bg-card backdrop-blur-md rounded-lg border border-border shadow-sm">
                <div className="text-2xl font-bold text-primary mb-1">90%</div>
                <div className="text-sm text-muted-foreground">Redução de Tarefas</div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700">Configuração em menos de 5 minutos</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-700">IA que aprende com seu negócio</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-gray-700">100% seguro e LGPD compliance</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Começar Grátis por 14 Dias
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600 bg-white/80 backdrop-blur-md"
              >
                Ver Demonstração
              </Button>
            </div>
          </div>

          {/* Form Side */}
          <div className="relative">
            {/* Main Form Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
              
              {/* Form Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-full px-4 py-2 mb-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-700">✨ Acesso Imediato</span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Comece sua transformação
                </h3>
                <p className="text-gray-600">
                  Sem cartão de crédito • Cancelamento a qualquer momento
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleTrialSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome do Negócio *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Nome da sua empresa"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Pedidos por dia *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center p-3 bg-gray-50/50 border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
                      <input
                        type="radio"
                        name="ordersPerDay"
                        value="menos10"
                        checked={formData.ordersPerDay === 'menos10'}
                        onChange={handleInputChange}
                        className="mr-3 text-blue-600"
                        required
                      />
                      <span className="text-sm font-medium">Menos de 10</span>
                    </label>
                    <label className="flex items-center p-3 bg-gray-50/50 border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
                      <input
                        type="radio"
                        name="ordersPerDay"
                        value="mais10"
                        checked={formData.ordersPerDay === 'mais10'}
                        onChange={handleInputChange}
                        className="mr-3 text-blue-600"
                        required
                      />
                      <span className="text-sm font-medium">Mais de 10</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Tem computador? *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center p-3 bg-gray-50/50 border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
                      <input
                        type="radio"
                        name="hasComputer"
                        value="sim"
                        checked={formData.hasComputer === 'sim'}
                        onChange={handleInputChange}
                        className="mr-3 text-blue-600"
                        required
                      />
                      <span className="text-sm font-medium">Sim</span>
                    </label>
                    <label className="flex items-center p-3 bg-gray-50/50 border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
                      <input
                        type="radio"
                        name="hasComputer"
                        value="nao"
                        checked={formData.hasComputer === 'nao'}
                        onChange={handleInputChange}
                        className="mr-3 text-blue-600"
                        required
                      />
                      <span className="text-sm font-medium">Não</span>
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                  disabled={!formData.name || !formData.email || !formData.phone || !formData.businessName || !formData.ordersPerDay || !formData.hasComputer || !formData.acceptTerms}
                >
                  🚀 Começar Transformação Grátis
                </Button>

                <div className="text-center">
                  <div className="flex items-start justify-center gap-3 mt-4">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      required
                    />
                    <label htmlFor="acceptTerms" className="text-xs text-gray-600 leading-relaxed">
                      Aceito os{' '}
                      <a href="#" className="text-blue-600 hover:underline font-medium">
                        termos de uso
                      </a>{' '}
                      e{' '}
                      <a href="#" className="text-blue-600 hover:underline font-medium">
                        política de privacidade
                      </a>
                    </label>
                  </div>
                </div>
              </form>

              {/* Removed trust indicators and configuration text */}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};