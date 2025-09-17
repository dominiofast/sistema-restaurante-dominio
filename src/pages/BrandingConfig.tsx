import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BrandingManager } from '@/components/branding/BrandingManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const BrandingConfig: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user?.user_metadata?.company_id) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            Erro: Empresa não identificada. Faça login novamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Palette className="h-8 w-8" />
              Configurações de Marca
            </h1>
            <p className="text-muted-foreground">
              Personalize a aparência do seu cardápio digital
            </p>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Preview do Cardápio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              Visualização em tempo real das suas configurações:
            </p>
            <div className="bg-white rounded-lg p-4 border">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Palette className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-semibold">Sua Empresa</h3>
                <p className="text-sm text-muted-foreground">
                  As alterações aparecerão aqui em tempo real
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branding Manager */}
      <BrandingManager 
        companyId={user.user_metadata.company_id}
        onBrandingUpdate={() => {
          // Aqui podemos atualizar o preview ou mostrar uma mensagem
          console.log('Branding atualizado!');
        }}
      />

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Como usar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div>
              <h4 className="font-medium">Upload de Arquivos</h4>
              <p className="text-sm text-muted-foreground">
                Faça upload do logo e banner da sua empresa. Recomendamos imagens em alta qualidade.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div>
              <h4 className="font-medium">Configurações de Exibição</h4>
              <p className="text-sm text-muted-foreground">
                Escolha se deseja mostrar logo e/ou banner no seu cardápio digital.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div>
              <h4 className="font-medium">Paleta de Cores</h4>
              <p className="text-sm text-muted-foreground">
                Personalize as cores do seu cardápio para combinar com a identidade da sua marca.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
              4
            </div>
            <div>
              <h4 className="font-medium">Salvar Configurações</h4>
              <p className="text-sm text-muted-foreground">
                Clique em "Salvar Configurações" para aplicar as mudanças ao seu cardápio digital.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
