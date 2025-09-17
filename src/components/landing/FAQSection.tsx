import React from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const FAQSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-xl text-gray-600">
            Tire suas dúvidas sobre nossa plataforma
          </p>
        </div>
        
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="item-1" className="bg-gray-50 rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold text-slate-800 hover:text-blue-600">
              Como funciona o período de teste gratuito?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 pt-2">
              Você tem acesso completo à plataforma por 14 dias, sem necessidade de cartão de crédito. 
              Durante este período, pode usar todos os recursos do plano escolhido e cancelar a qualquer momento.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="bg-gray-50 rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold text-slate-800 hover:text-blue-600">
              Posso mudar de plano a qualquer momento?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 pt-2">
              Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
              As mudanças são aplicadas imediatamente e o valor é ajustado proporcionalmente.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="bg-gray-50 rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold text-slate-800 hover:text-blue-600">
              Quais formas de pagamento vocês aceitam?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 pt-2">
              Aceitamos cartões de crédito (Visa, MasterCard, American Express), 
              PIX e boleto bancário. Todos os pagamentos são processados com segurança.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="bg-gray-50 rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold text-slate-800 hover:text-blue-600">
              Meus dados estão seguros?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 pt-2">
              Sim! Utilizamos criptografia de ponta a ponta, backups automáticos diários e 
              seguimos as melhores práticas de segurança. Seus dados são protegidos pela LGPD.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="bg-gray-50 rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold text-slate-800 hover:text-blue-600">
              Vocês oferecem treinamento para minha equipe?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 pt-2">
              Sim! Todos os planos incluem onboarding gratuito. Para planos Enterprise, 
              oferecemos treinamento personalizado e um gerente de conta dedicado.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};