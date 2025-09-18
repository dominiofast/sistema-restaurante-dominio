import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProBadge } from '@/components/ui/pro-badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
// SUPABASE REMOVIDO
import { ExternalLink, Printer, ShieldCheck, RefreshCcw, Save, TestTube2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PrintNodePrinter {
  id: number;
  name: string;
  description?: string | null;
  state?: string | null;
  computer?: { id: number; name?: string | null };
}

const SEO = () => {
  useEffect(() => {
    const title = 'Integração PrintNode | Impressão em Nuvem';
    const description = 'Configure e teste a integração com a PrintNode para impressão em nuvem.';
    document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;
  }, []);
  return null;
};

const PrintNodeIntegrationPage: React.FC = () => {
  const { toast } = useToast();
  const { currentCompany } = useAuth();

  const companyId = currentCompany?.id as string | undefined;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [printers, setPrinters] = useState<PrintNodePrinter[]>([]);

  // Per-loja (company) settings
  const [enabled, setEnabled] = useState<boolean>(true);
  const [childAccountId, setChildAccountId] = useState<string>('');
  const [childEmail, setChildEmail] = useState<string>('');
  const [defaultPrinterId, setDefaultPrinterId] = useState<string>('');
  const [defaultPrinterName, setDefaultPrinterName] = useState<string>('');

  const childHeaders = useMemo(() => ({
    childAccountId: childAccountId ? Number(childAccountId) : undefined,
    childAccountEmail: childEmail || undefined,
  }), [childAccountId, childEmail]);

  const openDocs = () => {
    window.open('https://www.printnode.com/en/docs/api/curl', '_blank', 'noopener,noreferrer');
  };

  // Load existing settings for the company
  useEffect(() => {
    if (!companyId) return;
    (async () => {
      const { data, error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'company_settings')
        /* .select\( REMOVIDO */ ; //'printnode_enabled, printnode_child_account_id, printnode_child_email, printnode_default_printer_id, printnode_default_printer_name')
        /* .eq\( REMOVIDO */ ; //'company_id', companyId)
        /* .maybeSingle\( REMOVIDO */ ; //);

      if (error) {
        console.error('Erro carregando settings PrintNode:', error);
        return;
      }
      if (data) {
        setEnabled(Boolean(data.printnode_enabled));
        setChildAccountId(data.printnode_child_account_id ? String(data.printnode_child_account_id) : '');
        setChildEmail(data.printnode_child_email || '');
        setDefaultPrinterId(data.printnode_default_printer_id ? String(data.printnode_default_printer_id) : '');
        setDefaultPrinterName(data.printnode_default_printer_name || '');
      }
    })();
  }, [companyId]);

  const saveSettings = async () => {
    if (!companyId) {
      toast({ title: 'Empresa não selecionada', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'company_settings')
        /* .upsert\( REMOVIDO */ ; //
          {
            company_id: companyId,
            printnode_enabled: enabled,
            printnode_child_account_id: childAccountId ? Number(childAccountId) : null,
            printnode_child_email: childEmail || null,
            printnode_default_printer_id: defaultPrinterId ? Number(defaultPrinterId) : null,
            printnode_default_printer_name: defaultPrinterName || null,
          },
          { onConflict: 'company_id' }
        );
      if (error) throw error;
      toast({ title: 'Configurações salvas' });
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Erro ao salvar', description: err?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setAccountInfo(null);
    try {
      const { data, error } = await /* supabase REMOVIDO */ null; //functions.invoke('printnode-proxy', {
        body: { action: 'whoami', ...childHeaders },
      });
      if (error) throw error;
      setAccountInfo(data);
      toast({ title: 'Conexão OK', description: 'Credenciais válidas com a PrintNode.' });
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Falha ao conectar',
        description: err?.message || 'Verifique a PRINTNODE_API_KEY e o child selecionado.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPrinters = async () => {
    setLoading(true);
    try {
      const { data, error } = await /* supabase REMOVIDO */ null; //functions.invoke('printnode-proxy', {
        body: { action: 'printers', ...childHeaders },
      });
      if (error) throw error;
      const arr: PrintNodePrinter[] = Array.isArray(data) ? (data as PrintNodePrinter[]) : [];
      setPrinters(arr);
      // Auto-selecionar padrão se ainda não houver um
      if (!defaultPrinterId && arr.length > 0) {
        const firstOnline = arr.find((p) => String(p.state || '').toLowerCase() === 'online') ?? arr[0];
        if (firstOnline) {
          setDefaultPrinterId(String(firstOnline.id));
          setDefaultPrinterName(firstOnline.name);
        }
      }
      toast({ title: 'Impressoras carregadas', description: `${arr.length} encontrada(s).` });
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Falha ao listar impressoras', description: err?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const printTest = async () => {
    if (!defaultPrinterId) {
      toast({ title: 'Selecione e salve uma impressora', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const content = btoa('Teste de impressão via PrintNode\nDomínio Tech POS\n\nObrigado!');
      const { data, error } = await /* supabase REMOVIDO */ null; //functions.invoke('printnode-proxy', {
        body: {
          action: 'print',
          printerId: Number(defaultPrinterId),
          title: 'Teste POS',
          contentType: 'raw_base64',
          content,
          source: 'Dominio POS',
          ...childHeaders,
        },
      });
      if (error) throw error;
      toast({ title: 'Job enviado', description: 'Verifique a fila do PrintNode.' });
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Erro ao imprimir', description: err?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 space-y-6">
      <SEO />
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Integração PrintNode</h1>
          <ProBadge size="md" />
        </div>
        <Button variant="outline" onClick={openDocs}>
          Abrir Docs <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </header>

      {/* Aviso PRÓ */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <ProBadge size="md" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-1">Funcionalidade Premium</h3>
              <p className="text-sm text-amber-800 mb-3">
                A integração PrintNode permite impressão em nuvem diretamente do seu sistema, 
                sem necessidade de configurar impressoras localmente. Ideal para múltiplas lojas 
                ou impressão remota.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">✨ Impressão em nuvem</Badge>
                <Badge variant="secondary" className="text-xs">🌐 Múltiplas lojas</Badge>
                <Badge variant="secondary" className="text-xs">🔧 Fácil configuração</Badge>
                <Badge variant="secondary" className="text-xs">📱 Sem instalação local</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Configuração por Loja
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1">Child Account ID (PrintNode)</label>
                <Input inputMode="numeric" value={childAccountId} onChange={(e) => setChildAccountId(e.target.value)} placeholder="Ex.: 473644" />
              </div>
              <div>
                <label className="block mb-1">Child Email (opcional)</label>
                <Input type="email" value={childEmail} onChange={(e) => setChildEmail(e.target.value)} placeholder="loja@exemplo.com" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1">Impressora Padrão (ID)</label>
                <Input inputMode="numeric" value={defaultPrinterId} onChange={(e) => setDefaultPrinterId(e.target.value)} placeholder="ID da impressora" />
              </div>
              <div>
                <label className="block mb-1">Impressora Padrão (Nome)</label>
                <Input value={defaultPrinterName} onChange={(e) => setDefaultPrinterName(e.target.value)} placeholder="Nome para referência" />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={saveSettings} disabled={saving}>
                <Save className="mr-2 h-4 w-4" /> Salvar
              </Button>
              <Button variant="secondary" onClick={testConnection} disabled={loading}>
                Testar Conexão
              </Button>
              <Button variant="secondary" onClick={loadPrinters} disabled={loading}>
                <RefreshCcw className="mr-2 h-4 w-4" /> Listar Impressoras
              </Button>
              <Button onClick={printTest} disabled={loading || !defaultPrinterId}>
                <TestTube2 className="mr-2 h-4 w-4" /> Imprimir Teste
              </Button>
            </div>
            <div className="pt-2">
              <Badge variant="secondary">Base URL: api.printnode.com</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {accountInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Conta (whoami)</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
                  {JSON.stringify(accountInfo, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" /> Impressoras do Child
              </CardTitle>
            </CardHeader>
            <CardContent>
              {printers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma impressora carregada ainda.</p>
              ) : (
                <ul className="divide-y rounded-md border">
                  {printers.map((p) => (
                    <li key={p.id} className="p-3 text-sm flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-muted-foreground">
                          ID: {p.id} • Estado: {p.state || 'desconhecido'}
                          {p.computer?.name ? ` • Computador: ${p.computer.name}` : ''}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDefaultPrinterId(String(p.id));
                          setDefaultPrinterName(p.name);
                          toast({ title: 'Selecionada', description: `${p.name} (ID ${p.id})` });
                        }}
                      >
                        Usar como padrão
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default PrintNodeIntegrationPage;
