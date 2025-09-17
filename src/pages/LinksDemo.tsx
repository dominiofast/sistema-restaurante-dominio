import LinksCurtos from "@/components/links/LinksCurtos";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LinksDemo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-800">
              Links Curtos - Sistema Funcional
            </h1>
            <p className="text-slate-600">
              Sistema de encurtamento de links similar ao Anota AI, para facilitar o compartilhamento de cardápios
            </p>
          </div>
        </div>

        <LinksCurtos />
      </div>
    </div>
  );
};

export default LinksDemo;