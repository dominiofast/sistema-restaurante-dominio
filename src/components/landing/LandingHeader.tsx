
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface LandingHeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const LandingHeader = ({ mobileMenuOpen, setMobileMenuOpen }: LandingHeaderProps) => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth';
    });
  };

  return (
    <>
      {/* Header */}
      <header className="fixed w-full top-0 z-50 backdrop-blur-md bg-[hsl(var(--dominio-blue-primary))] shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/890942e2-83ea-4ad0-9513-af24d7bb0554.png" 
                alt="Domínio Tech" 
                className="h-24 w-auto transition-transform duration-300 hover:scale-105 cursor-pointer filter brightness-0 invert"
                onClick={scrollToTop}
              />
            </div>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <a href="#recursos" className="relative text-white/90 hover:text-[hsl(var(--dominio-blue-cyan))] transition-colors duration-300 font-medium group">
                Recursos
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[hsl(var(--dominio-blue-cyan))] group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#precos" className="relative text-white/90 hover:text-[hsl(var(--dominio-blue-cyan))] transition-colors duration-300 font-medium group">
                Preços
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[hsl(var(--dominio-blue-cyan))] group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#contato" className="relative text-white/90 hover:text-[hsl(var(--dominio-blue-cyan))] transition-colors duration-300 font-medium group">
                Contato
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[hsl(var(--dominio-blue-cyan))] group-hover:w-full transition-all duration-300"></span>
              </a>
              <div className="flex items-center gap-2 sm:gap-4 ml-4">
                <a href="https://conta.dominio.tech">
                  <Button variant="outline" className="border border-white/30 text-white bg-transparent hover:bg-white/10 transition-all duration-300 hidden sm:inline-flex">
                    Login
                  </Button>
                  <Button variant="outline" size="sm" className="border border-white/30 text-white bg-transparent hover:bg-white/10 transition-all duration-300 sm:hidden">
                    <span className="sr-only">Login</span>
                    👤
                  </Button>
                </a>
                <Button 
                  className="bg-[hsl(var(--dominio-blue-cyan))] text-[hsl(var(--dominio-blue-primary))] hover:bg-[hsl(var(--dominio-blue-cyan))]/90 shadow-[0_4px_20px_rgba(0,212,255,0.3)] hover:shadow-[0_6px_25px_rgba(0,212,255,0.4)] transition-all duration-300 transform hover:scale-105 hidden sm:inline-flex font-semibold"
                  onClick={() => window.location.href = '/cadastro'}
                >
                  Cadastre-se Agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  size="sm"
                  className="bg-[hsl(var(--dominio-blue-cyan))] text-[hsl(var(--dominio-blue-primary))] hover:bg-[hsl(var(--dominio-blue-cyan))]/90 shadow-[0_4px_20px_rgba(0,212,255,0.3)] hover:shadow-[0_6px_25px_rgba(0,212,255,0.4)] transition-all duration-300 transform hover:scale-105 sm:hidden"
                  onClick={() => window.location.href = '/cadastro'}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </nav>

            {/* Mobile menu button */}
            <button 
              className="lg:hidden p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-300" 
              onClick={() => setMobileMenuOpen(true)}
            >
              <div className="w-6 h-0.5 bg-white mb-1.5 transition-all duration-300"></div>
              <div className="w-6 h-0.5 bg-white mb-1.5 transition-all duration-300"></div>
              <div className="w-6 h-0.5 bg-white transition-all duration-300"></div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex">
          <div className="w-80 p-8 flex flex-col gap-8 shadow-2xl bg-[hsl(var(--dominio-blue-primary))]">
            <div className="flex justify-between items-center">
              <img 
                src="/lovable-uploads/890942e2-83ea-4ad0-9513-af24d7bb0554.png" 
                alt="Domínio Tech" 
                className="h-20 w-auto filter brightness-0 invert"
              />
              <button 
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-300" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-3xl text-white">&times;</span>
              </button>
            </div>
            <nav className="flex flex-col gap-6">
              <a href="#recursos" className="text-lg font-medium text-white hover:text-[hsl(var(--dominio-blue-cyan))] transition-colors duration-300" onClick={() => setMobileMenuOpen(false)}>
                Recursos
              </a>
              <a href="#precos" className="text-lg font-medium text-white hover:text-[hsl(var(--dominio-blue-cyan))] transition-colors duration-300" onClick={() => setMobileMenuOpen(false)}>
                Preços
              </a>
              <a href="#contato" className="text-lg font-medium text-white hover:text-[hsl(var(--dominio-blue-cyan))] transition-colors duration-300" onClick={() => setMobileMenuOpen(false)}>
                Contato
              </a>
            </nav>
            <div className="space-y-4 mt-8">
              <a href="https://conta.dominio.tech">
                <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white hover:text-[hsl(var(--dominio-blue-primary))]" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Button>
              </a>
              <Button 
                className="w-full bg-[hsl(var(--dominio-blue-cyan))] text-[hsl(var(--dominio-blue-primary))] hover:bg-[hsl(var(--dominio-blue-cyan))]/90 font-semibold" 
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.location.href = '/cadastro';
                }}
              >
                Cadastre-se Agora
              </Button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
};
