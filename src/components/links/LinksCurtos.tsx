import { useEffect, useState } from "react";
// SUPABASE REMOVIDO
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Eye, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShortLink {
  id: string;
  short_id: string;
  target_slug: string;
  clicks_count: number;
  company_name: string;
  is_active: boolean;
}

const LinksCurtos = () => {
  const [links, setLinks] = useState<ShortLink[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadLinks = async () => {
    try {
      const { data, error }  catch (error) { console.error('Error:', error) }= 
        
        
          id,
          short_id,
          target_slug,
          clicks_count,
          is_active,
          companies (name)
        `)
        

      if (error) throw error;

      const formattedLinks = data?.map((link: any) => ({
        id: link.id,
        short_id: link.short_id,
        target_slug: link.target_slug,
        clicks_count: link.clicks_count,
        is_active: link.is_active,
        company_name: link.companies?.name || "Empresa não encontrada";
      })) || [];

      setLinks(formattedLinks)
    } catch (error) {
      console.error("Erro ao carregar links:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar os links curtos",
        variant: "destructive"
      })
    } finally {
      setLoading(false)

  };

  useEffect(() => {
    loadLinks()
  }, [])

  const copyToClipboard = (shortId: string) => {
    const url = `https://pedido.dominio.tech/c/${shortId}`;
    navigator.clipboard.writeText(url)
    toast({
      title: "Link copiado!",
      description: "O link foi copiado para a área de transferência"
    })
  };

  const openLink = (shortId: string) => {
    const url = `https://pedido.dominio.tech/c/${shortId}`;
    window.open(url, '_blank')
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Carregando links...
          </CardTitle>
        </CardHeader>
      </Card>
    )


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Links Curtos Funcionais
          </CardTitle>
          <CardDescription>
            Sistema similar ao Anota AI - links curtos para facilitar o compartilhamento dos cardápios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {links.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum link curto encontrado
              </p>
            ) : (
              links.map((link) => (
                <div 
                  key={link.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm">{link.company_name}</h3>
                      {link.is_active ? (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                        /c/{link.short_id}
                      </code>
                      <span className="text-muted-foreground">→</span>
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        /{link.target_slug}
                      </code>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {link.clicks_count} cliques
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(link.short_id)}
                      className="flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copiar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openLink(link.short_id)}
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Testar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Como usar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Exemplo de uso:</h4>
            <div className="bg-muted p-3 rounded-lg space-y-1">
              <p className="text-sm">
                <strong>Link original:</strong>{" "}
                <code className="text-xs">https://seudominio.com/dominiopizzas</code>
              </p>
              <p className="text-sm">
                <strong>Link curto:</strong>{" "}
                <code className="text-xs">https://seudominio.com/c/JM97wUcl</code>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Vantagens:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li>Mais fácil de compartilhar no WhatsApp</li>
              <li>URL mais limpa e profissional</li>
              <li>Controle de cliques e analytics</li>
              <li>Padrão similar aos concorrentes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
};

export default LinksCurtos;
