import React from 'react';
import { Wallet } from 'lucide-react';
import { useCashbackConfig } from '@/hooks/useCashbackConfig';
import styles from './CashbackCard.module.css';

interface CashbackCardProps {
  companyId: string;
  className?: string;
}

export const CashbackCard: React.FC<CashbackCardProps> = ({ 
  companyId, 
  className = '' 
}) => {
  const { data: cashbackConfig, isLoading } = useCashbackConfig(companyId);

  // Se não há configuração ou não está ativo, não renderiza
  if (!cashbackConfig || !cashbackConfig.is_active || isLoading) {
    return null;
  }

  const percentual = Number(cashbackConfig.percentual_cashback).toFixed(0);

  return (
    <div className={`${styles.cashbackCard} ${className}`}>
      <div className={styles.cardIcon}>
        <Wallet className="w-9 h-9" />
      </div>
      
      <div className={styles.cardText}>
        <p className={styles.textTitle}>Ganhe Cashback</p>
        <p className={styles.textSubtitle}>Receba de volta em todas as compras</p>
      </div>
      
      <div className={styles.cardBadgeContainer}>
        <span className={styles.badgeValue}>{percentual}%</span>
      </div>
    </div>
  );
};
