import React from 'react';
import { Send, CheckCircle } from 'lucide-react';

export const FeaturesSection = () => {
  return (
    <section id="recursos" className="py-20 overflow-hidden relative" style={{ background: 'linear-gradient(180deg, #F7FAFC 0%, #FFFFFF 100%)' }}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Conteúdo Principal */}
          <div className="max-w-xl">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-3 mb-6 py-2 px-4 rounded-full" style={{ backgroundColor: '#E8F4FF' }}>
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                ✓
              </div>
              <span className="text-sm font-medium" style={{ color: '#224276' }}>Aprovado por +500 empresas</span>
            </div>
            
            {/* Título com foco no benefício */}
            <h1 className="text-4xl lg:text-5xl font-bold mb-5 leading-tight" style={{ color: '#224276' }}>
              Atenda 10x mais clientes no WhatsApp com{' '}
              <span style={{ color: '#00D4FF' }}>IA que vende</span>
            </h1>
            
            {/* Benefício claro e direto */}
            <p className="text-xl mb-10 leading-relaxed" style={{ color: '#6B7C93' }}>
              Transforme cada conversa em venda. Nossa IA responde em segundos, 
              entende o contexto e fecha negócios 24/7 - enquanto você foca no mais importante.
            </p>
            
            {/* 3 Value Props principais */}
            <div className="flex flex-col gap-4 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-1" style={{ backgroundColor: '#00D4FF' }}>
                  ✓
                </div>
                <p className="text-gray-800 leading-relaxed">
                  <strong style={{ color: '#224276' }}>Resposta em 3 segundos:</strong> Nenhum cliente espera. 
                  IA treinada responde naturalmente.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-1" style={{ backgroundColor: '#00D4FF' }}>
                  ✓
                </div>
                <p className="text-gray-800 leading-relaxed">
                  <strong style={{ color: '#224276' }}>Vende no piloto automático:</strong> Envia catálogo, 
                  calcula frete e processa pagamento.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-1" style={{ backgroundColor: '#00D4FF' }}>
                  ✓
                </div>
                <p className="text-gray-800 leading-relaxed">
                  <strong style={{ color: '#224276' }}>Aprende com seu negócio:</strong> IA melhora a cada 
                  interação, conhecendo seus clientes.
                </p>
              </div>
            </div>
            
            {/* CTA único e forte */}
            <div className="flex items-center gap-6 mb-8">
              <button 
                className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                style={{ backgroundColor: '#224276' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1A3556';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(34, 66, 118, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#224276';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Testar 14 dias grátis
                <span>→</span>
              </button>
              <p className="text-sm" style={{ color: '#6B7C93' }}>Sem cartão • Cancele quando quiser</p>
            </div>
            
            {/* Social Proof */}
            <div className="flex items-center gap-6 pt-8 border-t border-gray-200">
              <div className="flex" style={{ marginRight: '12px' }}>
                <div className="w-10 h-10 rounded-full border-3 border-white bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 -ml-3 first:ml-0" style={{ backgroundColor: '#E3E8EF' }}>
                  JM
                </div>
                <div className="w-10 h-10 rounded-full border-3 border-white bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 -ml-3" style={{ backgroundColor: '#E3E8EF' }}>
                  AS
                </div>
                <div className="w-10 h-10 rounded-full border-3 border-white bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 -ml-3" style={{ backgroundColor: '#E3E8EF' }}>
                  RF
                </div>
                <div className="w-10 h-10 rounded-full border-3 border-white bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 -ml-3" style={{ backgroundColor: '#E3E8EF' }}>
                  +
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-yellow-500 mb-1">
                  ★★★★★
                </div>
                <p className="text-sm" style={{ color: '#6B7C93' }}>4.9 de 523 avaliações</p>
              </div>
            </div>
          </div>
          
          {/* Demo Visual Simplificado */}
          <div className="relative flex justify-center items-center">
            <div className="w-90 h-180 bg-gray-900 rounded-[36px] p-3 shadow-2xl" style={{ width: '360px', height: '720px' }}>
              <div className="w-full h-full bg-white rounded-[24px] overflow-hidden flex flex-col">
                {/* Header WhatsApp */}
                <div className="bg-green-600 text-white p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: '#224276' }}>
                    DT
                  </div>
                  <div>
                    <div className="font-semibold">Sua Empresa</div>
                    <div className="text-xs opacity-90">Online • IA Ativa</div>
                  </div>
                </div>
                
                {/* Chat Demo - Apenas 1 interação poderosa */}
                <div className="flex-1 p-6 flex flex-col justify-center gap-5" style={{ backgroundColor: '#E5DDD5' }}>
                  <div className="flex justify-start">
                    <div className="max-w-xs bg-white p-4 rounded-2xl shadow-sm">
                      <div className="text-sm text-gray-800">
                        Olá, vocês tem o produto X em estoque? Preciso de 50 unidades
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="max-w-xs bg-green-100 p-4 rounded-2xl shadow-sm" style={{ backgroundColor: '#DCF8C6' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#00D4FF' }}></span>
                        <span className="text-xs font-semibold" style={{ color: '#00D4FF' }}>IA Respondendo</span>
                      </div>
                      <div className="text-sm text-gray-800 mb-2">
                        Oi! 😊 Sim, temos 127 unidades do Produto X disponíveis. 
                        Para 50 unidades, consigo um desconto especial de 15%, 
                        ficando R$ 2.125,00. Posso preparar seu pedido?
                      </div>
                      <div className="text-xs" style={{ color: '#6B7C93' }}>Respondido em 3 segundos</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Métrica de destaque */}
            <div className="absolute -top-5 -right-5 bg-white p-4 rounded-xl shadow-lg">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: '#224276' }}>87%</div>
                <div className="text-sm leading-tight" style={{ color: '#6B7C93' }}>conversão<br/>em vendas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};