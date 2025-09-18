import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SignupPage = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    ordersPerDay: '',
    hasComputer: '',
    acceptTerms: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;

    // Validação
    if (!formData.phone.trim()) {
      toast.error('Celular é obrigatório');
      return;
    }

    if (!formData.acceptTerms) {
      toast.error('Você deve aceitar os termos e condições');
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 Iniciando cadastro:', formData);
      
      // Gerar um domain/slug único para a empresa baseado no nome do negócio
      const companyDomain = formData.businessName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '') // Remove espaços
        .substring(0, 20); // Limita tamanho
      
      // Adicionar timestamp para garantir unicidade
      const uniqueDomain = `${companyDomain}${Date.now().toString().slice(-4)}`;
      
      console.log('🏢 Criando empresa com domain:', uniqueDomain);
      
      // 1. Primeiro criar a empresa
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: formData.businessName,
          domain: uniqueDomain,
          slug: uniqueDomain,
          status: 'active',
          plan: 'trial', // Plano de teste
          user_count: 1
        })
        .select()
        .single();

      if (companyError) {
        console.error('❌ Erro ao criar empresa:', companyError);
        toast.error('Erro ao criar empresa: ' + companyError.message);
        return;
      }

      console.log('✅ Empresa criada:', companyData);
      
      // 2. Criar usuário no Supabase Auth com a empresa associada
      // Gerar senha temporária para o usuário (será solicitada para trocar no primeiro login)
      const tempPassword = `temp${Date.now()}`;
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: tempPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: formData.name,
            phone: formData.phone,
            businessName: formData.businessName,
            company_id: companyData.id,
            company_domain: uniqueDomain,
            role: 'admin',
            orders_per_day: formData.ordersPerDay,
            has_computer: formData.hasComputer
          }
        }
      });

      if (authError) {
        console.error('❌ Erro na autenticação:', authError);
        
        // Se falhou ao criar usuário, deletar a empresa criada
        try {
          await fetch(`/api/companies?id=${companyData.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (deleteError) {
          console.error('Erro ao deletar empresa após falha na autenticação:', deleteError);
        }
        
        if (authError.message.includes('already registered')) {
          toast.error('Este email já está em uso');
        } else {
          toast.error('Erro ao criar conta: ' + authError.message);
        }
        return;
      }

      console.log('✅ Usuário criado no auth:', authData);

      // 3. Criar credenciais da empresa para login direto
      if (authData.user) {
        const { error: credentialsError } = await supabase
          .from('company_credentials')
          .insert({
            email: formData.email,
            password_hash: tempPassword, // Será processado pelo trigger
            company_id: companyData.id,
            is_hashed: false
          });

        if (credentialsError) {
          console.warn('⚠️ Aviso ao criar credenciais:', credentialsError);
        }
      }

      // Se chegou até aqui, o cadastro foi bem-sucedido
      toast.success('Conta criada com sucesso! Seu teste gratuito de 14 dias já começou. Verifique seu email para confirmar.');
      
      // Limpar formulário
      setFormData({
        name: '',
        email: '',
        phone: '',
        businessName: '',
        ordersPerDay: '',
        hasComputer: '',
        acceptTerms: false
      });
      
      // Redirecionar para login após um delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);

    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      toast.error('Erro inesperado ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden" style={{ backgroundColor: '#F7FAFC' }}>
      {/* Main Container */}
      <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen">
        {/* Form Section */}
        <div className="flex-1 flex flex-col justify-center px-5 py-8 bg-white lg:px-10 lg:py-8 min-h-screen lg:min-h-0"
             style={{ boxShadow: '0 4px 20px rgba(34, 66, 118, 0.08)' }}>
          <div className="max-w-md mx-auto w-full">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img 
                src="/lovable-uploads/057589e1-6783-40ef-af0b-474b1e4c1d6b.png" 
                alt="dominio.tech" 
                className="h-12 w-auto"
                style={{ filter: 'brightness(0) saturate(100%) invert(21%) sepia(77%) saturate(1084%) hue-rotate(202deg) brightness(95%) contrast(95%)' }}
              />
            </div>

            <h1 className="text-xl font-bold mb-2 leading-tight lg:text-3xl" style={{ color: '#224276' }}>
              Teste grátis e automatize seu atendimento hoje
            </h1>
            <p className="mb-4 lg:text-base" style={{ color: '#6B7C93' }}>
              não é necessário incluir dados do cartão de crédito
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block mb-2 text-sm font-semibold" style={{ color: '#224276' }}>
                    Nome <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 rounded-lg text-sm transition-colors focus:outline-none"
                    style={{ 
                      borderColor: '#E3E8EF',
                      color: '#2D3748'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#224276'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#E3E8EF'}
                    placeholder="Seu nome"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block mb-2 text-sm font-semibold" style={{ color: '#224276' }}>
                    Celular <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 rounded-lg text-sm transition-colors focus:outline-none"
                    style={{ 
                      borderColor: '#E3E8EF',
                      color: '#2D3748'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#224276'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#E3E8EF'}
                    placeholder="(xx) xxxxx-xxxx"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-semibold" style={{ color: '#224276' }}>
                  Email <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 rounded-lg text-sm transition-colors focus:outline-none"
                  style={{ 
                    borderColor: '#E3E8EF',
                    color: '#2D3748'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#224276'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E3E8EF'}
                  placeholder="Seu email pessoal"
                  required
                />
              </div>

              <div>
                <label htmlFor="businessName" className="block mb-2 text-sm font-semibold" style={{ color: '#224276' }}>
                  Nome do seu restaurante <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 rounded-lg text-sm transition-colors focus:outline-none"
                  style={{ 
                    borderColor: '#E3E8EF',
                    color: '#2D3748'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#224276'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E3E8EF'}
                  placeholder="Nome do seu restaurante"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-3 text-sm font-semibold" style={{ color: '#224276' }}>
                    Quantos pedidos por dia? <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="ordersPerDay"
                        value="menos10"
                        checked={formData.ordersPerDay === 'menos10'}
                        onChange={handleInputChange}
                        className="w-4 h-4 mr-2"
                        style={{ accentColor: '#224276' }}
                        required
                      />
                      <span className="text-sm" style={{ color: '#2D3748' }}>Menos de 10</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="ordersPerDay"
                        value="mais10"
                        checked={formData.ordersPerDay === 'mais10'}
                        onChange={handleInputChange}
                        className="w-4 h-4 mr-2"
                        style={{ accentColor: '#224276' }}
                        required
                      />
                      <span className="text-sm" style={{ color: '#2D3748' }}>Mais de 10</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block mb-3 text-sm font-semibold" style={{ color: '#224276' }}>
                    Tem computador/notebook? <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hasComputer"
                        value="sim"
                        checked={formData.hasComputer === 'sim'}
                        onChange={handleInputChange}
                        className="w-4 h-4 mr-2"
                        style={{ accentColor: '#224276' }}
                        required
                      />
                      <span className="text-sm" style={{ color: '#2D3748' }}>Sim</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hasComputer"
                        value="nao"
                        checked={formData.hasComputer === 'nao'}
                        onChange={handleInputChange}
                        className="w-4 h-4 mr-2"
                        style={{ accentColor: '#224276' }}
                        required
                      />
                      <span className="text-sm" style={{ color: '#2D3748' }}>Não</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded focus:ring-2 mt-1"
                  style={{ 
                    accentColor: '#224276',
                    borderColor: '#E3E8EF'
                  }}
                  required
                />
                <label htmlFor="acceptTerms" className="text-sm cursor-pointer leading-relaxed" style={{ color: '#6B7C93' }}>
                  Aceito os{' '}
                  <a href="#" className="underline" style={{ color: '#224276' }}>
                    termos e condições
                  </a>
                  {' '}e{' '}
                  <a href="#" className="underline" style={{ color: '#224276' }}>
                    política de privacidade
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-white rounded-xl text-base font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-8 shadow-lg"
                style={{ backgroundColor: '#224276' }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#1A3556')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#224276')}
              >
                {loading ? 'Criando conta...' : 'Começar teste grátis →'}
              </button>

              <p className="text-center text-sm mt-4" style={{ color: '#6B7C93' }}>
                Teste grátis por 14 dias. Sem cartão de crédito.
              </p>
            </form>

            <div className="text-center mt-6 text-sm" style={{ color: '#6B7C93' }}>
              Já tem uma conta?{' '}
              <a href="/login" className="transition-colors" style={{ color: '#224276' }}
                 onMouseEnter={(e) => e.currentTarget.style.color = '#00D4FF'}
                 onMouseLeave={(e) => e.currentTarget.style.color = '#224276'}>
                Faça login
              </a>
            </div>
          </div>
        </div>

        {/* Image Section - Hidden on mobile */}
        <div className="hidden lg:flex flex-1 lg:h-screen order-first lg:order-last relative">
          <img
            src="/lovable-uploads/0e4e69d8-c0b2-4e4a-80e7-38dbe237d5a7.png"
            alt="Mulher empreendedora com tablet"
            className="w-full h-full object-cover"
          />
          
          {/* Benefits Overlay */}
          <div className="absolute inset-0 flex items-end justify-start p-8 lg:p-12" style={{ backgroundColor: 'rgba(26, 53, 86, 0.6)' }}>
            <div className="max-w-md">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#00D4FF' }}>
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white font-medium text-lg">Crie seu menu digital</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#00D4FF' }}>
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white font-medium text-lg">Receba pedidos diretamente pelo WhatsApp</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#00D4FF' }}>
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white font-medium text-lg">Ferramentas avançadas de gestão e análise</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#00D4FF' }}>
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white font-medium text-lg">Automatize seu atendimento com agente de ia</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#00D4FF' }}>
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white font-medium text-lg">Controle seu inventário em tempo real</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;