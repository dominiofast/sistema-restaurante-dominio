import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Building2, CheckCircle, XCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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

interface CompanyTableProps {
  companies: Company[];
  selectedCompanyId?: string;
  onRowClick?: (company: Company) => void;
  isLoading?: boolean;
  actionColumn?: (company: Company) => React.ReactNode;
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
    <XCircle className="h-4 w-4 text-red-600" />;
  )
};

const getStatusColor = (status: string) => {
  return status === 'active' 
    ? 'bg-green-100 text-green-800' ;
    : 'bg-red-100 text-red-800';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR')
};

export const CompanyTable: React.FC<CompanyTableProps> = ({
  companies,
  selectedCompanyId,
  onRowClick,
  isLoading = false,
  actionColumn
}) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="text-gray-500 mt-2">Carregando empresas...</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold text-gray-700">Logo</TableHead>
            <TableHead className="font-semibold text-gray-700">Nome</TableHead>
            <TableHead className="font-semibold text-gray-700">Domínio</TableHead>
            <TableHead className="font-semibold text-gray-700">Código da Loja</TableHead>
            <TableHead className="font-semibold text-gray-700">Plano</TableHead>
            <TableHead className="font-semibold text-gray-700">Status</TableHead>
            <TableHead className="font-semibold text-gray-700">Usuários</TableHead>
            <TableHead className="font-semibold text-gray-700">Criada em</TableHead>
            {actionColumn && (
              <TableHead className="font-semibold text-gray-700">Ações</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.length === 0 ? (
            <TableRow>
              <TableCell colSpan={actionColumn ? 9 : 8} className="text-center py-8 text-gray-500">
                Nenhuma empresa encontrada
              </TableCell>
            </TableRow>
          ) : (
            companies.map((company) => (
              <TableRow 
                key={company.id} 
                className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${
                  selectedCompanyId === company.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => onRowClick?.(company)}
              >
                <TableCell>
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                    {company.logo ? (
                      <span className="text-lg">{company.logo}</span>
                    ) : (
                      <Building2 className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-gray-900">
                  {company.name}
                </TableCell>
                <TableCell className="text-gray-700">
                  {company.domain}
                </TableCell>
                <TableCell className="text-gray-700">
                  #{company.store_code}
                </TableCell>
                <TableCell>
                  <Badge className={getPlanColor(company.plan)}>
                    {company.plan}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(company.status)}
                    <Badge className={getStatusColor(company.status)}>
                      {company.status === 'active' ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-gray-700">
                  {company.user_count}
                </TableCell>
                <TableCell className="text-gray-700">
                  {formatDate(company.created_at)}
                </TableCell>
                {actionColumn && (
                  <TableCell>
                    {actionColumn(company)}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
};
