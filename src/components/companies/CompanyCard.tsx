import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  plan: string;
  status: string;
  user_count: number;
  created_at: string;
  store_code: number;
}

interface CompanyCardProps {
  company: Company;
  isSelected?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const getPlanColor = (plan: string) => {
  switch (plan) {
    case 'basic': return 'bg-gray-100 text-gray-700';
    case 'pro': return 'bg-blue-100 text-blue-700';
    case 'enterprise': return 'bg-green-100 text-green-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getStatusIcon = (status: string) => {
  return status === 'active' ? (
    <CheckCircle className="h-4 w-4 text-green-600" />
  ) : (
    <XCircle className="h-4 w-4 text-red-600" />
  );
};

const getStatusColor = (status: string) => {
  return status === 'active' 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  isSelected = false,
  className = '',
  children
}) => {
  return (
    <div className={`p-6 bg-gray-50 rounded-lg border ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''} ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
          {company.logo ? (
            <span className="text-3xl">{company.logo}</span>
          ) : (
            <Building2 className="h-8 w-8 text-blue-600" />
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
          <p className="text-gray-600">{company.domain}</p>
        </div>
        {children && (
          <div className="flex items-center gap-2">
            {children}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">
            {company.user_count} usuários
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getPlanColor(company.plan)}>
            {company.plan}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(company.status)}
          <Badge className={getStatusColor(company.status)}>
            {company.status === 'active' ? 'Ativa' : 'Inativa'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">
            Criada em {formatDate(company.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
};