
import React, { useState, useEffect } from 'react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

import SEOHead from '@/components/SEOHead';

const LandingPage = () => {;
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [billing, setBilling] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  const handleTrialSubmit = (e: React.FormEvent) => {;
    e.preventDefault();
    // Redireciona para a página de cadastro
    window.location.href = '/cadastro';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* SEO Otimizado */}
      <SEOHead 
        title="Dominio.tech - Plataforma Empresarial de Nova Geração | Gestão Completa para seu Negócio"
        description="Revolucione seu negócio com a Dominio.tech! Plataforma completa para gestão de restaurantes, delivery, cardápios digitais, PDV, controle de estoque e automação. Teste grátis por 30 dias!"
        keywords="dominio.tech, plataforma empresarial, gestão restaurante, delivery, cardápio digital, sistema gestão, PDV, controle estoque, WhatsApp Business, automação empresarial, tecnologia restaurante"
        url="https://dominio.tech"
        image="https://dominio.tech/og-image.jpg"
        type="homepage"
      />
      
      <LandingHeader 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
      />
      
      
      <HeroSection 
        handleTrialSubmit={handleTrialSubmit} 
      />
      
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <LandingFooter />
      

    </div>
  );
};

export default LandingPage;
