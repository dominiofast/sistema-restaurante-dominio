
import React from 'react';
import { Building2 } from 'lucide-react';
import { Company, CompanyIntegrations } from '@/types/whatsapp';
import { Badge } from '@/components/ui/badge';

interface CompanyListProps {
  companies: Company[];
  integrations: Record<string, CompanyIntegrations>;
  selectedCompanyId: string | null;
  onSelectCompany: (company: Company) => void;
}

export const CompanyList: React.FC<CompanyListProps> = ({
  companies,
  integrations,
  selectedCompanyId,
  onSelectCompany
}) => {
  return (
    <div className="space-y-2">
      {companies.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhuma empresa encontrada
        </div>
      ) : (
        companies.map(company => {
          const ints = integrations[company.id] || {} as CompanyIntegrations;
          const hasPrimary = !!ints.primary;
          const hasMarketing = !!ints.marketing;
          return (
            <button
              key={company.id}
              className={`flex items-center gap-3 w-full px-3 py-3 text-left transition rounded-lg border ${
                selectedCompanyId === company.id 
                  ? 'bg-blue-50 border-blue-200 shadow-sm' 
                  : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
              onClick={() => onSelectCompany(company)}
            >
              <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                {company.logo ? (
                  <span className="text-xl">{company.logo}</span>
                ) : (
                  <Building2 className="h-5 w-5 text-gray-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800 text-sm">{company.name}</div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {company.domain || 'Sem domínio'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={hasPrimary ? 'default' : 'secondary'}
                  className={hasPrimary 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                  }
                >
                  Agente IA
                </Badge>
                <Badge 
                  variant={hasMarketing ? 'default' : 'secondary'}
                  className={hasMarketing 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                  }
                >
                  Marketing
                </Badge>
              </div>
            </button>
          )
        })
      )}
    </div>
  )
};
