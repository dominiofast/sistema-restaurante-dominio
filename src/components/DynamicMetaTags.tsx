import React from 'react';
import { useDynamicMetaTags } from '@/hooks/useDynamicMetaTags';

interface DynamicMetaTagsProps {
  children?: React.ReactNode;
}

const DynamicMetaTags: React.FC<DynamicMetaTagsProps> = ({ children }) => {
  const { company, loading } = useDynamicMetaTags();

  // Este componente não renderiza nada visível
  // Apenas aplica as meta tags baseadas na rota atual
  
  if (loading) {
    // Durante o carregamento, podemos mostrar um indicador mínimo
    // ou simplesmente não renderizar nada
    return null;
  }

  // Log para debug (remover em produção)
  if (process.env.NODE_ENV === 'development' && company) {
    console.log(`Meta tags aplicadas para: ${company.name} (${company.slug})`);
  }

  return (
    <>
      {/* Este componente é responsável apenas por aplicar meta tags */}
      {/* O conteúdo real será renderizado pelos children */}
      {children}
    </>
  );
};

export default DynamicMetaTags; 