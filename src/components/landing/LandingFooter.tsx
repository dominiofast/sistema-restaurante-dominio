import React from 'react';
import { Instagram, Youtube, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export const LandingFooter = () => {
  return (
    <footer className="bg-[hsl(var(--dominio-blue-primary))] text-white w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Company Info & Contact */}
            <div className="space-y-6">
              <div>
                <img 
                  src="/lovable-uploads/890942e2-83ea-4ad0-9513-af24d7bb0554.png" 
                  alt="Domínio Tech" 
                  className="h-16 w-auto filter brightness-0 invert mb-4"
                />
                <p className="text-[hsl(var(--dominio-blue-light))] text-sm leading-relaxed">
                  Plataforma empresarial completa para revolucionar a gestão do seu negócio.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-[hsl(var(--dominio-blue-light))] flex-shrink-0" />
                  <a 
                    href="mailto:contato@dominio.tech" 
                    className="text-[hsl(var(--dominio-blue-light))] hover:text-white transition-colors duration-300"
                  >
                    contato@dominio.tech
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-[hsl(var(--dominio-blue-light))] flex-shrink-0" />
                  <a 
                    href="tel:+5569999999999" 
                    className="text-[hsl(var(--dominio-blue-light))] hover:text-white transition-colors duration-300"
                  >
                    (69) 99999-9999
                  </a>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <MapPin size={16} className="text-[hsl(var(--dominio-blue-light))] flex-shrink-0 mt-0.5" />
                  <span className="text-[hsl(var(--dominio-blue-light))]">
                    Cacoal, Rondônia, Brasil
                  </span>
                </div>
              </div>

              {/* Social Media */}
              <div className="flex gap-4">
                <a 
                  href="https://instagram.com/dominio.tech" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center bg-[hsl(var(--dominio-blue-light))]/10 hover:bg-[hsl(var(--dominio-blue-light))]/20 rounded-lg text-[hsl(var(--dominio-blue-light))] hover:text-white transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a 
                  href="https://youtube.com/@dominio.tech" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center bg-[hsl(var(--dominio-blue-light))]/10 hover:bg-[hsl(var(--dominio-blue-light))]/20 rounded-lg text-[hsl(var(--dominio-blue-light))] hover:text-white transition-all duration-300"
                  aria-label="YouTube"
                >
                  <Youtube size={20} />
                </a>
                <a 
                  href="https://linkedin.com/company/dominio-tech" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center bg-[hsl(var(--dominio-blue-light))]/10 hover:bg-[hsl(var(--dominio-blue-light))]/20 rounded-lg text-[hsl(var(--dominio-blue-light))] hover:text-white transition-all duration-300"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
              </div>
            </div>

            {/* Soluções */}
            <div>
              <h3 className="text-white font-bold text-xl mb-6 !text-white">Soluções</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#gestao" className="text-[hsl(var(--dominio-blue-light))] hover:text-white transition-colors duration-300 text-sm">
                    Gestão Empresarial
                  </a>
                </li>
                <li>
                  <a href="#vendas" className="text-[hsl(var(--dominio-blue-light))] hover:text-white transition-colors duration-300 text-sm">
                    Sistema de Vendas
                  </a>
                </li>
                <li>
                  <a href="#estoque" className="text-[hsl(var(--dominio-blue-light))] hover:text-white transition-colors duration-300 text-sm">
                    Controle de Estoque
                  </a>
                </li>
                <li>
                  <a href="#whatsapp" className="text-[hsl(var(--dominio-blue-light))] hover:text-white transition-colors duration-300 text-sm">
                    Automação WhatsApp
                  </a>
                </li>
                <li>
                  <a href="#delivery" className="text-[hsl(var(--dominio-blue-light))] hover:text-white transition-colors duration-300 text-sm">
                    Sistema de Delivery
                  </a>
                </li>
                <li>
                  <a href="#cardapio" className="text-[hsl(var(--dominio-blue-light))] hover:text-white transition-colors duration-300 text-sm">
                    Cardápio Digital
                  </a>
                </li>
              </ul>
            </div>

            {/* Recursos */}
            <div>
              <h3 className="text-white font-bold text-xl mb-6 !text-white">Recursos</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#recursos" className="text-[hsl(var(--dominio-blue-light))] hover:text-white transition-colors duration-300 text-sm">
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a href="#precos" className="text-[hsl(var(--dominio-blue-light))] hover:text-white transition-colors duration-300 text-sm">
                    Planos e Preços
                  </a>
                </li>
                <li>
                  <a href="#depoimentos" className="text-[hsl(var(--dominio-blue-light))] hover:text-white transition-colors duration-300 text-sm">
                    Cases de Sucesso
                  </a>
                </li>
                <li>
                  <a href="#blog" className="text-[hsl(var(--dominio-blue-light))] hover:text-white transition-colors duration-300 text-sm">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#api" className="text-[hsl(var(--dominio-blue-light))] hover:text-white transition-colors duration-300 text-sm">
                    API e Integrações
                  </a>
                </li>
                <li>
                  <a href="#atualizacoes" className="text-[hsl(var(--dominio-blue-light))] hover:text-white transition-colors duration-300 text-sm">
                    Atualizações
                  </a>
                </li>
              </ul>
            </div>

            {/* Suporte */}
            <div>
              <h3 className="text-white font-bold text-xl mb-6 !text-white">Suporte</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#ajuda" className="text-[hsl(var(--dominio-blue-light))] hover:text-white transition-colors duration-300 text-sm">
                    Central de Ajuda
                  </a>
                </li>
                <li>
                  <a href="#documentacao" className="text-[hsl(var(--dominio-blue-light))] hover:text-white transition-colors duration-300 text-sm">
                    Documentação
                  </a>
                </li>
                <li>
                  <a href="#suporte" className="text-[hsl(var(--dominio-blue-light))] hover:text-white transition-colors duration-300 text-sm">
                    Suporte Técnico
                  </a>
                </li>
                <li>
                  <a href="#tutorial" className="text-[hsl(var(--dominio-blue-light))] hover:text-white transition-colors duration-300 text-sm">
                    Tutoriais
                  </a>
                </li>
                <li>
                  <a href="#treinamento" className="text-[hsl(var(--dominio-blue-light))] hover:text-white transition-colors duration-300 text-sm">
                    Treinamentos
                  </a>
                </li>
                <li>
                  <a href="#status" className="text-[hsl(var(--dominio-blue-light))] hover:text-white transition-colors duration-300 text-sm">
                    Status do Sistema
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[hsl(var(--dominio-blue-light))]/20 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <span className="text-[hsl(var(--dominio-blue-light))] text-sm">
                © 2024 dominio.tech. Todos os direitos reservados.
              </span>
              <span className="hidden sm:block text-[hsl(var(--dominio-blue-light))]/40">•</span>
              <span className="text-[hsl(var(--dominio-blue-light))]/80 text-xs">
                CNPJ: 00.000.000/0001-00
              </span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-6 text-sm">
              <a href="#termos" className="text-[hsl(var(--dominio-blue-light))] hover:text-white transition-colors duration-300">
                Termos de Uso
              </a>
              <a href="#privacidade" className="text-[hsl(var(--dominio-blue-light))] hover:text-white transition-colors duration-300">
                Política de Privacidade
              </a>
              <a href="#cookies" className="text-[hsl(var(--dominio-blue-light))] hover:text-white transition-colors duration-300">
                Política de Cookies
              </a>
              <a href="#lgpd" className="text-[hsl(var(--dominio-blue-light))] hover:text-white transition-colors duration-300">
                LGPD
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};