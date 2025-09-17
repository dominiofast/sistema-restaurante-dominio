import React from 'react';
import { useParams } from 'react-router-dom';
import { CashbackCardAdaptive } from '@/components/cashback/CashbackCardAdaptive';
import { useCashbackConfig } from '@/hooks/useCashbackConfig';
import { useCompanyData } from '@/hooks/useCompanyData';

interface CashbackSectionProps {
  variant?: 'compact' | 'full' | 'banner';
  className?: string;
}

export const CashbackSection: React.FC<CashbackSectionProps> = ({ 
  variant = 'full',
  className = ''
}) => {
  const { slug } = useParams();
  const { company } = useCompanyData(slug || '');
  const { data: cashbackConfig } = useCashbackConfig(company?.id);

  if (!company || !cashbackConfig || !cashbackConfig.is_active) {
    return null;
  }

  return (
    <CashbackCardAdaptive
      companyId={company.id}
      companySlug={slug}
      variant={variant}
      className={className}
    />
  );
};
