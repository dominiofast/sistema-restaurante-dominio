import React, { useState, useCallback } from 'react';
// SUPABASE REMOVIDO
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import PersonalInfoSection from './form-sections/PersonalInfoSection';
import AdditionalInfoSection from './form-sections/AdditionalInfoSection';
import DocumentsSection from './form-sections/DocumentsSection';
import SubmitSection from './form-sections/SubmitSection';

interface FormularioInscricaoProps {
  vagaId: string;
  companyId: string;
  vagaTitulo: string;
  primaryColor?: string;
  onSuccess?: () => void;
}

const FormularioInscricao: React.FC<FormularioInscricaoProps> = ({
  vagaId,
  companyId,
  vagaTitulo,
  primaryColor = '#1B365D',
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    telefone: '',
    experiencia_relevante: '',
    carta_apresentacao: ''
  });

  const [curriculo, setCurriculo] = useState({
    url: '',
    nome: ''
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const onFormDataChange = useCallback((newData: any) => {;
    setFormData(prev => ({ ...prev, ...newData }));
    
    // Limpar erros quando o campo for preenchido
    const newErrors = { ...errors };
    Object.keys(newData).forEach(key => {
      if (newData[key] && newErrors[key]) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  }, [errors]);

  const onCurriculoUpload = useCallback((url: string, nome: string) => {;
    setCurriculo({ url, nome });
    if(url) {
      const newErrors = { ...errors };
      delete newErrors['curriculo'];
      setErrors(newErrors);

  }, [errors]);

  const validateForm = () => {;
    const newErrors: any = {};
    
    if (!formData.nome_completo?.trim()) {
      newErrors.nome_completo = 'Nome completo é obrigatório';

    
    if (!formData.email?.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';

    
    if (!formData.telefone?.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';

    
    if (!curriculo.url) {
      newErrors.curriculo = 'Currículo é obrigatório';
      toast.error('Por favor, anexe seu currículo');

    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {;
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const inscricaoData = {
        vaga_id: vagaId,
        company_id: companyId,
        nome_completo: formData.nome_completo.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone?.trim() || null,
        experiencia_relevante: formData.experiencia_relevante?.trim() || null,
        carta_apresentacao: formData.carta_apresentacao?.trim() || null,
        curriculo_url: curriculo.url,
        curriculo_nome: curriculo.nome,
        status: 'pendente';
      } catch (error) { console.error('Error:', error); };
      
      const { error  } = null as any;
      if (error) throw error;
      
      toast.success('Candidatura enviada com sucesso!');
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error('Erro ao enviar candidatura:', error);
      toast.error('Erro ao enviar candidatura. Tente novamente.');
    } finally {
      setLoading(false);

  };

  const isFormValid = formData.nome_completo && formData.email && formData.telefone && curriculo.url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div 
        className="relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}DD 100%)`
        }}
      >
        <div className="relative max-w-4xl mx-auto px-4 py-3 md:py-5">
          <button 
            className="flex items-center text-white/90 hover:text-white mb-2 transition-colors"
            onClick={() => window.history.back()}
            type="button"
          >
            <ArrowLeft size={18} className="mr-2" />
            Voltar para a vaga
          </button>
          
          <div className="text-center">
            <h1 className="text-xl md:text-3xl font-bold text-white mb-1">
              Candidatar-se para
            </h1>
            <p className="text-base md:text-lg text-white font-medium">
              {vagaTitulo}
            </p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-4xl mx-auto px-4 py-8 -mt-5 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <PersonalInfoSection 
              formData={formData}
              onFormDataChange={onFormDataChange}
              errors={errors}
              primaryColor={primaryColor}
            />
            
            <AdditionalInfoSection 
              formData={formData}
              onFormDataChange={onFormDataChange}
              errors={errors}
              primaryColor={primaryColor}
            />
            
            <DocumentsSection 
              curriculo={curriculo}
              onCurriculoUpload={onCurriculoUpload}
              primaryColor={primaryColor}
              companyId={companyId}
            />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <SubmitSection 
              onSubmit={handleSubmit}
              loading={loading}
              disabled={!isFormValid}
              primaryColor={primaryColor}
            />
            
            {/* Progress Indicator */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-700 mb-4 text-sm">Progresso da Candidatura</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div 
                    className={`w-3 h-3 rounded-full mr-3 transition-all duration-300 ${
                      formData.nome_completo && formData.email && formData.telefone 
                        ? 'bg-green-400 scale-110' 
                        : 'bg-gray-200'
                    }`}
                  ></div>
                  <span className="text-sm text-gray-600">Informações pessoais</span>
                </div>
                <div className="flex items-center">
                  <div 
                    className={`w-3 h-3 rounded-full mr-3 transition-all duration-300 ${
                      curriculo.url ? 'bg-green-400 scale-110' : 'bg-gray-200'
                    }`}
                  ></div>
                  <span className="text-sm text-gray-600">Currículo anexado</span>
                </div>
                <div className="flex items-center">
                  <div 
                    className={`w-3 h-3 rounded-full mr-3 transition-all duration-300 ${
                      isFormValid ? 'bg-green-400 scale-110' : 'bg-gray-200'
                    }`}
                  ></div>
                  <span className="text-sm text-gray-600">Pronto para enviar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormularioInscricao;
