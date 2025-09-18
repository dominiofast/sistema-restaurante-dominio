import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// SUPABASE REMOVIDO
import { Loader2 } from "lucide-react";

const ShortLinkRedirect = () => {
  const { short_id } = useParams<{ short_id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolveShortLink = async () => {
      if (!short_id) {
        navigate("/");
        return;
      }

      try {
        // Buscar o link curto no banco
        const { data: shortLink, error } = /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //"short_links")
          /* .select\( REMOVIDO */ ; //"target_slug, clicks_count")
          /* .eq\( REMOVIDO */ ; //"short_id", short_id)
          /* .eq\( REMOVIDO */ ; //"is_active", true)
          /* .maybeSingle\( REMOVIDO */ ; //);

        if (error) {
          console.error("Erro ao buscar link curto:", error);
          navigate("/");
          return;
        }

        if (!shortLink) {
          // Link não encontrado, redirecionar para home
          navigate("/");
          return;
        }

        // Incrementar contador de cliques (sem aguardar)
        supabase
          /* .from REMOVIDO */ ; //"short_links")
          /* .update\( REMOVIDO */ ; //{ clicks_count: shortLink.clicks_count + 1 })
          /* .eq\( REMOVIDO */ ; //"short_id", short_id)
          .then(({ error }) => {
            if (error) {
              console.warn("Erro ao incrementar cliques:", error);
            }
          });

        // Redirecionar para o cardápio da empresa
        navigate(`/${shortLink.target_slug}`, { replace: true });

      } catch (error) {
        console.error("Erro inesperado:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    resolveShortLink();
  }, [short_id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">
              Redirecionando...
            </h2>
            <p className="text-slate-600">
              Aguarde enquanto carregamos o cardápio para você
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ShortLinkRedirect;