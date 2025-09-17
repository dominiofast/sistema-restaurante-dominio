import React from 'react';
import { Plan } from '@/hooks/usePlans';

interface PlanCardProps {
  plan: Plan;
  billingType: 'monthly' | 'yearly';
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, billingType }) => {
  const price = billingType === 'monthly' ? plan.price_monthly : plan.price_yearly;
  const period = billingType === 'monthly' ? '/mês' : '/mês (cobrado anualmente)';

  const getCardStyle = () => {
    if (plan.type === 'trial') {
      return 'bg-[hsl(var(--dominio-success))] text-white shadow-[0_4px_20px_rgba(40,167,69,0.15)]';
    }
    if (plan.badge) {
      return 'bg-white border-2 border-[hsl(var(--dominio-blue-cyan))] transform scale-105 relative shadow-[0_8px_30px_rgba(0,212,255,0.15)]';
    }
    return 'bg-white border border-[hsl(var(--dominio-neutral-light))] shadow-[0_4px_20px_rgba(34,66,118,0.08)]';
  };

  const getButtonStyle = () => {
    if (plan.type === 'trial') {
      return 'bg-white/20 border-2 border-white/30 text-white hover:bg-white/30 hover:border-white/50 backdrop-blur-sm';
    }
    if (plan.badge) {
      return 'bg-[hsl(var(--dominio-blue-primary))] text-white hover:bg-[hsl(var(--dominio-blue-dark))] shadow-lg hover:shadow-xl';
    }
    return 'bg-[hsl(var(--dominio-blue-primary))] text-white hover:bg-[hsl(var(--dominio-blue-dark))]';
  };

  const includeFeatures = plan.plan_features?.filter(pf => pf.included) || [];
  const excludeFeatures = plan.plan_features?.filter(pf => !pf.included) || [];

  return (
    <div className={`${getCardStyle()} rounded-xl p-8 hover:shadow-[0_12px_40px_rgba(34,66,118,0.12)] transition-all duration-300 hover:-translate-y-1 flex flex-col h-full`}>
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-[hsl(var(--dominio-error))] text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
            {plan.badge}
          </span>
        </div>
      )}
      
      <div className="text-center mb-8">
        <h2 className={`text-2xl font-bold mb-2 ${plan.type === 'trial' ? 'text-white' : 'text-[hsl(var(--dominio-blue-primary))]'}`}>
          {plan.name}
        </h2>
        <p className={`text-sm mb-4 min-h-[2rem] leading-tight ${
          plan.type === 'trial' ? 'text-white/90' : 'text-[hsl(var(--dominio-text-secondary))]'
        }`}>
          {plan.description}
        </p>
        <div className={`text-3xl font-bold mb-1 ${plan.type === 'trial' ? 'text-white' : plan.badge ? 'text-[hsl(var(--dominio-blue-primary))] text-4xl' : 'text-[hsl(var(--dominio-blue-primary))]'}`}>
          {plan.type === 'trial' ? `${plan.duration_days} dias` : `R$ ${price.toFixed(2).replace('.', ',')}`}
        </div>
        <div className={`text-sm ${plan.type === 'trial' ? 'text-white/90' : 'text-[hsl(var(--dominio-text-secondary))]'}`}>
          {plan.type === 'trial' ? 'sem compromisso' : period}
        </div>
      </div>

      <ul className="space-y-3 mb-8 flex-grow text-sm">
        {includeFeatures.map((pf) => (
          <li key={pf.feature_id} className="flex items-center">
            <span className={`mr-3 font-semibold ${plan.type === 'trial' ? 'text-white' : plan.badge ? 'text-[hsl(var(--dominio-blue-cyan))]' : 'text-[hsl(var(--dominio-success))]'}`}>✓</span>
            <span className={plan.type === 'trial' ? 'text-white/95' : 'text-[hsl(var(--dominio-text-primary))]'}>
              {pf.features.name}
            </span>
          </li>
        ))}
        {excludeFeatures.map((pf) => (
          <li key={pf.feature_id} className="flex items-center">
            <span className="text-[hsl(var(--dominio-error))] mr-3 font-semibold">✗</span>
            <span className="text-[hsl(var(--dominio-text-muted))] line-through">
              {pf.features.name}
            </span>
          </li>
        ))}
      </ul>

      <a 
        href="#" 
        className={`block w-full py-4 rounded-lg text-center font-semibold transition-all duration-200 hover:-translate-y-1 shadow-md hover:shadow-lg ${getButtonStyle()}`}
      >
        {plan.type === 'trial' ? 'Começar Teste Gratuito' : `Assinar ${plan.name}`}
      </a>
    </div>
  );
};