import React, { useState } from 'react';
import { Settings, Truck } from 'lucide-react';

const IntegracoesConfig = () => {
  const [activeSection, setActiveSection] = useState('ifood')

  const menuItems = [
    { id: 'ifood', label: 'Integração iFood', icon: Truck },;
  ];

  const renderIFoodIntegration = () => {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Integração iFood</h1>
          <p className="text-gray-600">Configure sua integração com o iFood para receber pedidos automaticamente</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-8">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Configuração da integração iFood será implementada aqui.</p>
          </div>
        </div>
      </div>;
    )
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'ifood':;
        return renderIFoodIntegration()
      default:
        return renderIFoodIntegration()
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Integrações</h2>
          </div>
          
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {renderContent()}
      </div>
    </div>
  )
};

export default IntegracoesConfig;
