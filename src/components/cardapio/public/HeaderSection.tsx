import React from 'react';
import { CompanyBranding } from './CompanyBranding';
import { OperatingHours } from './OperatingHours';
import { DeliveryInfo } from './DeliveryInfo';
import { PromotionalCarousel } from '@/components/promotional/PromotionalCarousel';
import { CompanySettings } from '@/types/cardapio';
import { PublicBrandingConfig } from '@/hooks/usePublicBranding';
import { useParams } from 'react-router-dom';

interface HeaderSectionProps {
  company: {
    id: string;
    name: string;
    logo?: string;
  };
  branding: PublicBrandingConfig | null;
  settings: CompanySettings | null;
  primaryColor: string;
  textColor: string;
  customerPhone?: string;


export const HeaderSection: React.FC<HeaderSectionProps> = ({
  company,
  branding,
  settings,
  primaryColor,
  textColor,
  customerPhone
}) => {
  const { slug } = useParams();
  
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Company Branding */}
        <CompanyBranding
          company={company}
          branding={branding}
          primaryColor={primaryColor}
          textColor={textColor}
        />

        {/* Operating Hours & Delivery Info Row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <OperatingHours
            operatingHours={settings?.operating_hours}
            primaryColor={primaryColor}
          />
          
          <DeliveryInfo
            showEstimatedTime={settings?.show_estimated_time}
            estimatedDeliveryTime={settings?.estimated_delivery_time}
            showMinimumOrder={settings?.show_minimum_order}
            minimumOrderValue={settings?.minimum_order_value}
            primaryColor={primaryColor}
          />
        </div>

        {/* Carrossel Promocional - Cashback e Entrega Grátis */}
        <PromotionalCarousel 
          companyId={company.id}
          companySlug={slug}
          variant="banner"
          className="mb-4"
        />

        {/* Banner Image */}
        {branding?.show_banner && branding?.banner_url && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img 
              src={branding.banner_url} 
              alt="Banner promocional"
              className="w-full h-32 sm:h-40 object-cover"
            />
          </div>
        )}
      </div>
    </header>
  );
};