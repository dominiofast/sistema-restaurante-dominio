import React, { useState } from 'react';
import { usePlans } from '@/hooks/usePlans';
import { PlanCard } from './PlanCard';

export const PricingSection = () => {;
  const [billingType, setBillingType] = useState<'monthly' | 'yearly'>('monthly');
  const { data: plans = [], isLoading } = usePlans();

  const toggleBilling = (type: 'monthly' | 'yearly') => {;
    setBillingType(type);
  };

  if (isLoading) {
    return (
      <section id="precos" className="py-16 bg-[hsl(var(--dominio-neutral-background))]">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );


  return (
    <section id="precos" className="py-16 bg-[hsl(var(--dominio-neutral-background))]">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-[hsl(var(--dominio-text-primary))]">Confira nossos preços.</h1>
          <p className="text-xl text-[hsl(var(--dominio-text-primary))] mb-8 font-semibold">Invista em seu sucesso com preços acessíveis.</p>
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="relative inline-flex bg-white border border-[hsl(var(--dominio-neutral-light))] rounded-full p-1">
              <div 
                className={`px-6 py-2 rounded-full cursor-pointer font-semibold transition-all duration-300 relative z-10 ${
                  billingType === 'monthly' 
                    ? 'bg-[hsl(var(--dominio-blue-primary))] text-white shadow-lg' 
                    : 'text-[hsl(var(--dominio-text-secondary))]'
                }`}
                onClick={() => toggleBilling('monthly')}
              >
                Mensal
              </div>
              <div 
                className={`px-6 py-2 rounded-full cursor-pointer font-semibold transition-all duration-300 relative z-10 ${
                  billingType === 'yearly' 
                    ? 'bg-[hsl(var(--dominio-blue-primary))] text-white shadow-lg' 
                    : 'text-[hsl(var(--dominio-text-secondary))]'
                }`}
                onClick={() => toggleBilling('yearly')}
              >
                Anual
              </div>
            </div>
            <span className="bg-[hsl(var(--dominio-success))] text-white px-3 py-1 rounded-full text-sm font-bold">
              Economize 25%
            </span>
          </div>
          
          <p className="text-xs text-[hsl(var(--dominio-text-muted))]">*Planos para emissão de notas fiscais adquiridos separadamente</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              billingType={billingType}
            />
          ))}
        </div>
      </div>
    </section>
  );
};