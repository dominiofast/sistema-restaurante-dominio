
import React from 'react';

interface VagasFooterProps {
  companyName: string;
  primaryColor?: string;
  logoUrl?: string; // Mantemos para compatibilidade, mas não usaremos
}

const VagasFooter: React.FC<VagasFooterProps> = ({ companyName, primaryColor = '#000000' }) => {
  return (
    <footer 
      className="text-center py-3 fixed bottom-0 left-0 right-0 z-10 w-full"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="flex items-center justify-center space-x-2">
        <span className="text-sm text-white">Portal de vagas criado com</span>
        <img 
          src="/lovable-uploads/890942e2-83ea-4ad0-9513-af24d7bb0554.png" 
          alt="Dominio.tech" 
          className="h-8 filter brightness-0 invert" 
        />
      </div>
    </footer>
  )
};

export default VagasFooter;
