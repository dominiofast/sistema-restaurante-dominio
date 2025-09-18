
import React from 'react';
import { FileText } from 'lucide-react';
import { CurriculoUploadSupabase } from '../CurriculoUploadSupabase';

interface DocumentsSectionProps {
  companyId: string;
  primaryColor: string;
  onCurriculoUpload: (url: string, fileName: string) => void;
  curriculo?: {
    url: string;
    nome: string;
  };
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  companyId,
  primaryColor,
  onCurriculoUpload,
  curriculo = { url: '', nome: '' }
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100">
      <div className="flex items-center mb-6">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
          style={{ backgroundColor: `${primaryColor}10` }}
        >
          <FileText size={16} style={{ color: primaryColor }} />
        </div>
        <h2 className="text-lg font-semibold text-gray-700">Documentos</h2>
      </div>
      
      <CurriculoUploadSupabase 
        curriculo={curriculo}
        onUploadSuccess={onCurriculoUpload}
        companyId={companyId}
        primaryColor={primaryColor}
      />
    </div>
  )
};

export default DocumentsSection;
