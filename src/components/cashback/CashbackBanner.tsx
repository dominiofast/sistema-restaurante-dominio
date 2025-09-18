import React from 'react';
import { Wallet, Gift, TrendingUp } from 'lucide-react';
import { useCashbackConfig } from '@/hooks/useCashbackConfig';
import styles from './CashbackBanner.module.css';

interface CashbackBannerProps {
  companyId: string;
  className?: string;
  variant?: 'default' | 'prominent' | 'minimal';
}

export const CashbackBanner: React.FC<CashbackBannerProps> = ({ 
  companyId, 
  className = '',
  variant = 'default'
}) => {
  const { data: cashbackConfig, isLoading } = useCashbackConfig(companyId)

  // Se não há configuração ou não está ativo, não renderiza
  if (!cashbackConfig || !cashbackConfig.is_active || isLoading) {
    return null;
  }

  const percentual = Number(cashbackConfig.percentual_cashback).toFixed(0)

  if (variant === 'minimal') {
    return (
      <div className={`${styles.minimalBanner} ${className}`}>
        <div className={styles.minimalContent}>
          <Wallet className={styles.minimalIcon} />
          <span className={styles.minimalText}>
            Ganhe {percentual}% de volta em todas as compras
          </span>
        </div>
      </div>
    )
  }

  if (variant === 'prominent') {
    return (
      <div className={`${styles.prominentBanner} ${className}`}>
        <div className={styles.prominentContent}>
          <div className={styles.prominentLeft}>
            <div className={styles.prominentIconContainer}>
              <Gift className={styles.prominentIcon} />
            </div>
            <div className={styles.prominentText}>
              <h3 className={styles.prominentTitle}>Programa de Fidelidade</h3>
              <p className={styles.prominentSubtitle}>
                A cada compra você acumula pontos e recebe {percentual}% de volta
              </p>
            </div>
          </div>
          <div className={styles.prominentRight}>
            <div className={styles.prominentBadge}>
              <span className={styles.prominentPercentual}>{percentual}%</span>
              <span className={styles.prominentLabel}>CASHBACK</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Variant default
  return (
    <div className={`${styles.defaultBanner} ${className}`}>
      <div className={styles.defaultContent}>
        <div className={styles.defaultLeft}>
          <TrendingUp className={styles.defaultIcon} />
          <div className={styles.defaultText}>
            <h3 className={styles.defaultTitle}>Ganhe Cashback</h3>
            <p className={styles.defaultSubtitle}>
              Receba {percentual}% de volta em todas as suas compras
            </p>
          </div>
        </div>
        <div className={styles.defaultRight}>
          <div className={styles.defaultBadge}>
            <span className={styles.defaultPercentual}>{percentual}%</span>
          </div>
        </div>
      </div>
    </div>
  )
};
