import React from 'react';
import { CheckCircle } from 'lucide-react';

interface AutoatendimentoSuccessProps {
  companyName: string;
  primaryColor: string;
}

export const AutoatendimentoSuccess: React.FC<AutoatendimentoSuccessProps> = ({
  companyName,
  primaryColor
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6 md:p-8">
        <div className="text-center max-w-2xl">
          {/* Ícone de sucesso */}
          <div className="mb-6 md:mb-8">
            <CheckCircle 
              className="mx-auto h-24 w-24 md:h-32 md:w-32"
              style={{ color: primaryColor }}
            />
          </div>

          {/* Título */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6" style={{ color: primaryColor }}>
            Pedido Confirmado!
          </h1>

          {/* Mensagem */}
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 md:mb-8 leading-relaxed">
            Seu pedido foi recebido com sucesso pela {companyName}.
          </p>

          {/* Informações adicionais */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border max-w-lg mx-auto">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6" style={{ color: primaryColor }}>
              O que acontece agora?
            </h2>
            
            <div className="space-y-4 md:space-y-6 text-left">
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 font-bold text-sm md:text-base">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-base md:text-lg mb-1">Pedido Recebido</h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Nossa equipe já foi notificada sobre seu pedido
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-bold text-sm md:text-base">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-base md:text-lg mb-1">Em Preparação</h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Seus itens estão sendo preparados com carinho
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange-600 font-bold text-sm md:text-base">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-base md:text-lg mb-1">Pronto para Retirada</h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Você será chamado quando seu pedido estiver pronto
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mensagem final */}
          <div className="mt-6 md:mt-8">
            <p className="text-base md:text-lg text-muted-foreground">
              Obrigado por escolher a {companyName}!
            </p>
            <p className="text-sm md:text-base text-muted-foreground mt-2">
              Volte sempre! 😊
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 md:p-8 text-center border-t">
        <p className="text-sm md:text-base text-muted-foreground">
          Sistema de autoatendimento da {companyName}
        </p>
      </div>
    </div>
  )
};
