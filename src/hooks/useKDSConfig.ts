
import { useState, useEffect } from 'react';

export interface KDSConfig {
  layout: 'single' | 'double' | 'vertical-single' | 'vertical-double' | 'horizontal-single' | 'horizontal-double';
  visibleStatuses: string[];
  itemsPerPage?: number;
}

const DEFAULT_CONFIG: KDSConfig = {
  layout: 'double',
  visibleStatuses: ['analise', 'producao', 'pronto'],
  itemsPerPage: 12
};

const STORAGE_KEY = 'kds-config';

export const useKDSConfig = () => {
  const [config, setConfig] = useState<KDSConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  })

  const updateConfig = (newConfig: Partial<KDSConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig))
  };

  const toggleStatus = (status: string) => {
    const newStatuses = config.visibleStatuses.includes(status)
      ? config.visibleStatuses.filter(s => s !== status)
      : [...config.visibleStatuses, status];
    
    updateConfig({ visibleStatuses: newStatuses })
  };

  const setLayout = (layout: KDSConfig['layout']) => {
    updateConfig({ layout })
  };

  return {
    config,
    updateConfig,
    toggleStatus,
    setLayout
  };
};
