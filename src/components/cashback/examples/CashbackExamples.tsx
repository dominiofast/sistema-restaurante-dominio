import React from 'react';
import { CashbackCard } from '../CashbackCard';
import { CashbackBanner } from '../CashbackBanner';

interface CashbackExamplesProps {
  companyId: string;
}

export const CashbackExamples: React.FC<CashbackExamplesProps> = ({ companyId }) => {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Exemplos de Componentes de Cashback
      </h2>

      {/* Exemplo 1: CashbackCard - Design compacto */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          1. CashbackCard - Card Compacto
        </h3>
        <p className="text-sm text-gray-600">
          Ideal para exibição discreta no header ou em seções específicas.
        </p>
        <div className="flex justify-center">
          <CashbackCard companyId={companyId} />
        </div>
      </div>

      {/* Exemplo 2: CashbackBanner - Variante Minimal */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          2. CashbackBanner - Variante Minimal
        </h3>
        <p className="text-sm text-gray-600">
          Banner discreto com fundo azul claro, perfeito para notificações sutis.
        </p>
        <CashbackBanner companyId={companyId} variant="minimal" />
      </div>

      {/* Exemplo 3: CashbackBanner - Variante Default */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          3. CashbackBanner - Variante Default
        </h3>
        <p className="text-sm text-gray-600">
          Banner verde com design equilibrado, ideal para destaque moderado.
        </p>
        <CashbackBanner companyId={companyId} variant="default" />
      </div>

      {/* Exemplo 4: CashbackBanner - Variante Prominent */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          4. CashbackBanner - Variante Prominent
        </h3>
        <p className="text-sm text-gray-600">
          Banner roxo com design chamativo, perfeito para promoções especiais.
        </p>
        <CashbackBanner companyId={companyId} variant="prominent" />
      </div>

      {/* Exemplo 5: Layout Combinado */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          5. Layout Combinado - Diferentes Contextos
        </h3>
        <p className="text-sm text-gray-600">
          Como usar os componentes em diferentes partes do cardápio digital.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna 1: Header */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Header da Loja</h4>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <CashbackCard companyId={companyId} />
            </div>
          </div>

          {/* Coluna 2: Seção Promocional */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Seção Promocional</h4>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <CashbackBanner companyId={companyId} variant="prominent" />
            </div>
          </div>

          {/* Coluna 3: Entre Produtos */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Entre Produtos</h4>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <CashbackBanner companyId={companyId} variant="minimal" />
            </div>
          </div>

          {/* Coluna 4: Footer */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Footer</h4>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <CashbackBanner companyId={companyId} variant="default" />
            </div>
          </div>
        </div>
      </div>

      {/* Informações Técnicas */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Informações Técnicas
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Todos os componentes se conectam automaticamente com os dados reais de cashback</li>
          <li>• Só são exibidos quando o cashback está ativo para a empresa</li>
          <li>• Totalmente responsivos e adaptáveis a diferentes tamanhos de tela</li>
          <li>• Usam CSS Modules para estilos isolados e manuteníveis</li>
          <li>• Integrados com o hook useCashbackConfig para dados em tempo real</li>
        </ul>
      </div>
    </div>
  )
};
