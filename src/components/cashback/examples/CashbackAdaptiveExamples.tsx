import React, { useState } from 'react';
import { CashbackCardAdaptive } from '../CashbackCardAdaptive';

// Simulação de diferentes marcas para demonstração
const brandExamples = [
  {
    name: '300 Graus Pizzas',
    slug: '300-graus',
    primaryColor: '#DC2626', // Vermelho vibrante
    accentColor: '#B91C1C',
    logo: '🍕'
  },
  {
    name: 'Burger King Clone',
    slug: 'burger-king',
    primaryColor: '#F97316', // Laranja
    accentColor: '#EA580C',
    logo: '🍔'
  },
  {
    name: 'Sushi Express',
    slug: 'sushi-express',
    primaryColor: '#0F172A', // Preto/Cinza escuro
    accentColor: '#1E293B',
    logo: '🍱'
  },
  {
    name: 'Açaí Natural',
    slug: 'acai-natural',
    primaryColor: '#7C3AED', // Roxo
    accentColor: '#6D28D9',
    logo: '🥤'
  },
  {
    name: 'Padaria Doce Lar',
    slug: 'padaria-doce',
    primaryColor: '#92400E', // Marrom
    accentColor: '#78350F',
    logo: '🥐'
  }
];

export const CashbackAdaptiveExamples: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState(0);
  const brand = brandExamples[selectedBrand];

  // Mock do branding para demonstração
  const mockBranding = {
    primary_color: brand.primaryColor,
    accent_color: brand.accentColor,
    text_color: '#1F2937',
    background_color: '#FFFFFF'
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Cashback Adaptativo - Exemplos por Marca
        </h2>
        <p className="text-gray-600 mb-8">
          O card de cashback se adapta automaticamente às cores e identidade visual de cada loja
        </p>

        {/* Seletor de Marca */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Selecione uma marca:</h3>
          <div className="flex flex-wrap gap-3">
            {brandExamples.map((b, index) => (
              <button
                key={index}
                onClick={() => setSelectedBrand(index)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  selectedBrand === index 
                    ? 'border-gray-900 bg-gray-900 text-white' 
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <span className="mr-2">{b.logo}</span>
                {b.name}
              </button>
            ))}
          </div>
        </div>

        {/* Preview da Marca */}
        <div 
          className="mb-8 p-6 rounded-xl shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${brand.primaryColor}10 0%, ${brand.primaryColor}05 100%)`,
            borderLeft: `4px solid ${brand.primaryColor}`
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${brand.primaryColor}20` }}
            >
              {brand.logo}
            </div>
            <div>
              <h3 className="text-2xl font-bold" style={{ color: brand.primaryColor }}>
                {brand.name}
              </h3>
              <p className="text-gray-600">Exemplo de integração visual</p>
            </div>
          </div>
        </div>

        {/* Variantes do Card */}
        <div className="space-y-8">
          {/* Variant Full */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Variante Full - Card Principal
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Ideal para destaque no header ou seções principais
            </p>
            <div className="flex justify-center">
              <div style={{ '--primary-color': brand.primaryColor } as any}>
                <MockCashbackCard variant="full" brand={mockBranding} />
              </div>
            </div>
          </div>

          {/* Variant Banner */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Variante Banner - Destaque Promocional
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Perfeito para campanhas e promoções especiais
            </p>
            <MockCashbackCard variant="banner" brand={mockBranding} />
          </div>

          {/* Variant Compact */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Variante Compact - Badge Discreto
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Para uso em cards de produtos ou áreas com espaço limitado
            </p>
            <div className="flex justify-center">
              <MockCashbackCard variant="compact" brand={mockBranding} />
            </div>
          </div>
        </div>

        {/* Comparação Antes/Depois */}
        <div className="mt-12 bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">
            Comparação: Genérico vs Personalizado
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-gray-600 mb-4">❌ Antes (Genérico)</h4>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="bg-green-100 text-green-800 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold">Ganhe Cashback</p>
                    <p className="text-sm">Receba de volta em todas as compras</p>
                  </div>
                  <div className="text-2xl font-bold">10%</div>
                </div>
              </div>
              <ul className="mt-4 text-sm text-gray-600 space-y-1">
                <li>• Cores genéricas (sempre verde)</li>
                <li>• Não reflete a identidade da marca</li>
                <li>• Parece desconectado do site</li>
                <li>• Menor engajamento visual</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-600 mb-4">✅ Depois (Personalizado)</h4>
              <div className="p-4 bg-gray-50 rounded-lg">
                <MockCashbackCard variant="full" brand={mockBranding} />
              </div>
              <ul className="mt-4 text-sm text-gray-600 space-y-1">
                <li>• Cores da marca integradas</li>
                <li>• Consistência visual total</li>
                <li>• Parece parte nativa do site</li>
                <li>• Maior confiança e engajamento</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Benefícios */}
        <div className="mt-12 bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-xl p-8">
          <h3 className="text-2xl font-bold mb-6">
            🎯 Benefícios da Personalização Automática
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-400">Para o Cliente:</h4>
              <ul className="space-y-2 text-sm">
                <li>✓ Experiência visual consistente</li>
                <li>✓ Maior confiança na marca</li>
                <li>✓ Interface mais profissional</li>
                <li>✓ Fácil identificação do benefício</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-blue-400">Para a Loja:</h4>
              <ul className="space-y-2 text-sm">
                <li>✓ Reforça identidade visual</li>
                <li>✓ Aumenta engajamento</li>
                <li>✓ Destaque competitivo</li>
                <li>✓ Zero configuração manual</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Mock para demonstração (simula o CashbackCardAdaptive)
const MockCashbackCard: React.FC<{ variant: string; brand: any }> = ({ variant, brand }) => {
  const percentual = '10';
  
  const createGradient = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const lighterR = Math.min(255, r + 30);
    const lighterG = Math.min(255, g + 30);
    const lighterB = Math.min(255, b + 30);
    const darkerR = Math.max(0, r - 20);
    const darkerG = Math.max(0, g - 20);
    const darkerB = Math.max(0, b - 20);
    return `linear-gradient(135deg, rgb(${lighterR}, ${lighterG}, ${lighterB}) 0%, rgb(${darkerR}, ${darkerG}, ${darkerB}) 100%)`;
  };

  const isLightColor = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  };

  const isDark = !isLightColor(brand.primary_color);
  const contrastColor = isDark ? '#FFFFFF' : '#1F2937';

  if (variant === 'compact') {
    return (
      <div 
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm shadow-md hover:shadow-lg transition-all"
        style={{
          background: createGradient(brand.primary_color),
          color: contrastColor
        }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <span>Cashback {percentual}%</span>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div 
        className="w-full rounded-xl border overflow-hidden hover:shadow-lg transition-all"
        style={{
          background: `linear-gradient(135deg, ${brand.primary_color}15 0%, ${brand.primary_color}05 100%)`,
          borderColor: `${brand.primary_color}30`
        }}
      >
        <div className="flex items-center justify-between p-6 gap-6">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: brand.primary_color }}
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: brand.text_color }}>
                Programa de Cashback
              </h3>
              <p className="text-sm opacity-75" style={{ color: brand.text_color }}>
                Ganhe {percentual}% de volta em todas as suas compras
              </p>
            </div>
          </div>
          <div 
            className="px-6 py-4 rounded-xl text-center shadow-md"
            style={{
              background: createGradient(brand.primary_color),
              color: contrastColor
            }}
          >
            <div className="text-2xl font-black">{percentual}%</div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-90">DE VOLTA</div>
          </div>
        </div>
      </div>
    );
  }

  // Full variant (default)
  return (
    <div 
      className="w-full max-w-md rounded-xl p-5 shadow-lg hover:shadow-xl transition-all"
      style={{
        background: createGradient(brand.primary_color),
        boxShadow: `0 4px 20px ${brand.primary_color}20`
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={contrastColor}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-base" style={{ color: contrastColor }}>
              Ganhe Cashback
            </p>
            <p className="text-sm opacity-90" style={{ color: contrastColor }}>
              Receba de volta em todas as compras
            </p>
          </div>
        </div>
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-lg border-2"
          style={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : brand.accent_color,
            borderColor: 'rgba(255, 255, 255, 0.3)',
            color: '#FFFFFF'
          }}
        >
          {percentual}%
        </div>
      </div>
    </div>
  );
};
