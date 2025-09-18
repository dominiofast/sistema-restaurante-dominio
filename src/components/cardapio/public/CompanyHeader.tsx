import React, { useState, useEffect } from 'react';
import { Search, Share2, Gift } from 'lucide-react';
import { useOperatingStatus } from '@/hooks/useOperatingStatus';
import { StatusLoja } from './StatusLoja';
import { useCashbackConfig } from '@/hooks/useCashbackConfig';
import { CashbackBadge } from '@/components/cashback/CashbackBadge';
import { CashbackCard } from '@/components/cashback/CashbackCard';
import { CashbackCardAdaptive } from '@/components/cashback/CashbackCardAdaptive';
import { CompanyLogo } from '@/components/loading/CompanyLogo';

// Função para aplicar opacidade nas cores
const applyOpacity = (color: string, opacity: number) => {;
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

interface Company {
  id: string;
  name: string;
  min_order_value?: number;


interface Branding {
  logo_url?: string;
  banner_url?: string;
  show_logo?: boolean;
  show_banner?: boolean;
  primary_color?: string;
  accent_color?: string;
  text_color?: string;
  background_color?: string;


interface CompanyHeaderProps {
  company: Company & { slug?: string };
  branding?: Branding | null;
  onShare: () => void;


export const CompanyHeader: React.FC<CompanyHeaderProps> = ({ company, branding, onShare }) => {
  const { status, message, nextChange, loading } = useOperatingStatus(company.id);
  const { data: cashbackConfig } = useCashbackConfig(company?.id);

  // Cores dinâmicas do branding
  const primaryColor = branding?.primary_color || '#3B82F6';
  const textColor = branding?.text_color || '#1F2937';
  const backgroundColor = branding?.background_color || '#FFFFFF';

  // Configuração de cashback vem do hook agora

  const formatCurrency = (value: number | undefined) => {;
    if (value === undefined || value === null) return '';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const minOrderValue = company.min_order_value ?? 0;

  return (
    <div className="mb-6">
      {/* Banner com melhor gradiente */}
      <div className="relative h-36 md:h-44 w-full overflow-hidden">
        {branding?.show_banner && branding?.banner_url ? (
          <>
            <img 
              src={branding.banner_url} 
              alt="Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          </>
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${applyOpacity(primaryColor || '#000000', 0.85)})`
            }}
          />
        )}
      </div>

      {/* Linha decorativa colorida com altura reduzida */}
      <div className="w-full h-0.5" style={{ backgroundColor: primaryColor }}></div>

      {/* Conteúdo principal em card discreto de largura total */}
      <div className="w-full bg-white border-b border-gray-100">
        <div className="w-full max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-start gap-6">
            {/* Logo com container ajustado próximo à logo */}
            <div className="flex-shrink-0 w-20 h-20 md:w-28 md:h-28 bg-white rounded-xl shadow-lg border border-gray-100 p-1.5 flex items-center justify-center">
              <CompanyLogo
                logoUrl={branding?.logo_url}
                companyName={company?.name}
                context="header"
                className="max-w-full max-h-full"
                preserveAspectRatio={true}
                objectFit="contain"
                enableResponsive={true}
                fallbackIcon={
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl md:text-3xl">🍕</span>
                  </div>
                }
              />
            </div>
            
            {/* Informações com layout otimizado */}
            <div className="flex-1 min-w-0">
              {/* Layout principal com botões alinhados */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h1 className="text-lg md:text-xl font-bold leading-tight mb-2" style={{ color: textColor }}>
                    {company?.name}
                  </h1>
                  
                  {/* Status compacto */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {!loading && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium" 
                           style={{ 
                             backgroundColor: status === 'open' ? `${primaryColor}15` : '#f3f4f6',
                             color: status === 'open' ? primaryColor : '#6b7280',
                             border: `1px solid ${status === 'open' ? `${primaryColor}30` : '#e5e7eb'}`
                           }}>
                        <div className={`w-1.5 h-1.5 rounded-full ${status === 'open' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        {message}
                      </div>
                    )}
                    
                    {minOrderValue > 0 && (
                      <span className="text-sm px-3 py-1 bg-gray-50 rounded-full border border-gray-200" style={{ color: applyOpacity(textColor, 0.7) }}>
                        Pedido mín. {formatCurrency(minOrderValue)}
                      </span>
                    )}
                    
                    {/* Debug info temporário */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="text-xs bg-gray-100 p-2 rounded">
                        Debug Cashback: {JSON.stringify(cashbackConfig)}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Coluna direita com botões e perfil */}
                <div className="flex flex-col items-end gap-2">
                  {/* Botões compactos */}
                  <div className="flex gap-2">
                    <button className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm">
                      <Search className="w-3.5 h-3.5" style={{ color: applyOpacity(textColor, 0.6) }} />
                    </button>
                    <button 
                      onClick={onShare}
                      className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
                    >
                      <Share2 className="w-3.5 h-3.5" style={{ color: applyOpacity(textColor, 0.6) }} />
                    </button>
                  </div>
                  
                  {/* Link do perfil menor */}
                  <button className="text-xs font-medium hover:underline transition-colors" style={{ color: applyOpacity(primaryColor, 0.8) }}>
                    Ver perfil da loja →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Programa de Fidelidade - Adaptativo às cores da marca */}
      {cashbackConfig && cashbackConfig.is_active && (
        <div className="w-full bg-white border-b border-gray-100">
          <div className="w-full max-w-6xl mx-auto px-4 py-3">
            <div className="flex justify-center">
              <CashbackCardAdaptive 
                companyId={company.id} 
                companySlug={company.slug}
                variant="full"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
