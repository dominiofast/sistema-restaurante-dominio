
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Building2 } from "lucide-react";
import { useCompanies, useCompanyDetails } from "@/hooks/useCompanies";
import { CompanyCard } from "@/components/companies/CompanyCard";
import { CompanyTable } from "@/components/companies/CompanyTable";

export default function Empresas() {
  const { user, currentCompany } = useAuth()
  const { companies, isLoading } = useCompanies()
  const { data: companyDetails } = useCompanyDetails()

  // Só permite acesso para super_admin
  if (user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Apenas super administradores podem acessar esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-erp-blue-700 mb-2">Gerenciar Empresas</h1>
          <p className="text-gray-600">
            {currentCompany 
              ? `Visualizando detalhes de: ${currentCompany.name}` 
              : 'Selecione uma empresa no cabeçalho para ver os detalhes'
            }
          </p>
        </div>

        {/* Company Details */}
        {companyDetails && (
          <div className="mb-8">
            <CompanyCard 
              company={companyDetails} 
              isSelected={true}
            />
          </div>
        )}

        {/* No Company Selected */}
        {!currentCompany && (
          <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-center">
              <Building2 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Nenhuma empresa selecionada
              </h3>
              <p className="text-blue-700">
                Use o seletor de empresas no cabeçalho para visualizar os detalhes de uma empresa específica.
              </p>
            </div>
          </div>
        )}

        {/* Companies Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Todas as Empresas</h3>
            <p className="text-sm text-gray-600 mt-1">
              {companies.length} empresa{companies.length !== 1 ? 's' : ''} cadastrada{companies.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <CompanyTable
            companies={companies}
            selectedCompanyId={currentCompany?.id}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )

