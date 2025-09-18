import React, { useState, useEffect } from 'react';
import { Plus, Download, Settings, Upload, Trash2 } from 'lucide-react';
import { uploadLargeFile } from '@/services/chunkedUploadService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
// SUPABASE REMOVIDO
import { ProtectedRouteWithPermissions } from '@/components/auth/ProtectedRouteWithPermissions';

interface Programa {
  id: string;
  nome: string;
  descricao?: string;
  url_download?: string;
  versao?: string;
  icone?: string;
  ativo: boolean;
  arquivo_path?: string;
  created_at: string;
}

const ProgramasPage = () => {
  const [programas, setProgramas] = useState<Programa[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPrograma, setEditingPrograma] = useState<Programa | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    url_download: '',
    versao: '',
    icone: '',
    ativo: true,
    arquivo_path: ''
  })

  useEffect(() => {
    loadProgramas()
  }, [])

  const loadProgramas = async () => {
    try {
      const { data, error }  catch (error) { console.error('Error:', error) }= 
        .rpc('get_programas_saipos')
      
      if (error) throw error;
      setProgramas((data as Programa[]) || [])
    } catch (error) {
      console.error('Erro ao carregar programas:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar programas',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)

  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    try {
      setUploading(true)
      setUploadProgress(0)
      
      console.log('📤 [Upload] Usando upload chunked para:', file.name)
      console.log('📤 [Upload] Tamanho do arquivo:', (file.size / 1024 / 1024).toFixed(2), 'MB')
      
      // Verificar tipos de arquivo permitidos
      const allowedTypes = ['.exe', '.msi', '.zip', '.rar', '.7z', '.pdf', '.txt', '.docx', '.doc'];
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
      
      if (!allowedTypes.includes(fileExt)) {
        throw new Error(`Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')} catch (error) { console.error('Error:', error) }`)
      }
      
      // Verificar autenticação
      const { data: { user } } = await Promise.resolve()
      console.log('🔑 [Upload] Usuário autenticado:', user?.id)
      
      if (!user) {
        throw new Error('Usuário não está autenticado')
      }
      
      // Usar o novo serviço de upload chunked
      const result = await uploadLargeFile(file, (progress) => {
        setUploadProgress(progress)
        console.log(`📊 [Upload] Progresso: ${progress.toFixed(1)}%`)
      })
      
      console.log('🎉 [Upload] Upload concluído com sucesso!')
      console.log('🔗 [Upload] URL:', result.downloadUrl)
      
      toast({
        title: 'Sucesso!',
        description: `Arquivo de ${(file.size / 1024 / 1024).toFixed(1)}MB enviado com sucesso!`,
        variant: 'default'
      })
      
      return result.downloadUrl;
      
    } catch (error) {
      console.error('❌ [Upload] Erro no upload:', error)
      
      let errorMessage = 'Erro desconhecido no upload';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: 'Erro no Upload',
        description: errorMessage,
        variant: 'destructive'
      })
      return null;
    } finally {
      setUploading(false)
      setUploadProgress(0)

  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      let finalFormData = { ...formData } catch (error) { console.error('Error:', error) };

      // Se tem arquivo selecionado, fazer upload primeiro
      if (selectedFile) {
        const uploadedUrl = await handleFileUpload(selectedFile)
        if (uploadedUrl) {
          finalFormData.arquivo_path = uploadedUrl;
          // Se não tem URL de download manual, usar o arquivo uploadado
          if (!finalFormData.url_download) {
            finalFormData.url_download = uploadedUrl;
          }
        } else {
          return; // Falhou no upload
        }
      }

      if (editingPrograma) {
        const { error } = await Promise.resolve()
          programa_id: editingPrograma.id,
          programa_data: finalFormData
        })
        
        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Programa atualizado com sucesso!' })
      } else {
        const { error } = await Promise.resolve()
          programa_data: finalFormData
        })
        
        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Programa adicionado com sucesso!' })
      }
      
      setDialogOpen(false)
      resetForm()
      loadProgramas()
    } catch (error) {
      console.error('Erro ao salvar programa:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao salvar programa',
        variant: 'destructive'
      })

  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      url_download: '',
      versao: '',
      icone: '',
      ativo: true,
      arquivo_path: '';
    })
    setEditingPrograma(null)
    setSelectedFile(null)
  };

  const editPrograma = (programa: Programa) => {
    setEditingPrograma(programa)
    setFormData({
      nome: programa.nome,
      descricao: programa.descricao || '',
      url_download: programa.url_download || '',
      versao: programa.versao || '',
      icone: programa.icone || '',
      ativo: programa.ativo,
      arquivo_path: programa.arquivo_path || ''
    })
    setDialogOpen(true)
  };

  const deletePrograma = async (programa: Programa) => {
    if (!confirm('Tem certeza que deseja excluir este programa?')) return;

    try {
      // Deletar arquivo do storage se existir
      if (programa.arquivo_path) {
        const fileName = programa.arquivo_path.split('/').pop()
        if (fileName) {
          await Promise.resolve()
            .remove([fileName])
        }
       catch (error) { console.error('Error:', error) }}

      // Deletar registro do banco
      const { error } = await Promise.resolve()
        programa_id: programa.id
      })

      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Programa excluído com sucesso!' })
      loadProgramas()
    } catch (error) {
      console.error('Erro ao deletar programa:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao excluir programa',
        variant: 'destructive'
      })

  };

  const openUrl = (url: string) => {
    if (url) {
      console.log('🔗 [Download] Abrindo URL:', url)
      window.open(url, '_blank')

  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando programas...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRouteWithPermissions permissions={['super_admin']} requireAll={true}>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <img 
                src="/lovable-uploads/890942e2-83ea-4ad0-9513-af24d7bb0554.png" 
                alt="Domínio Tech" 
                className="h-24 w-auto filter brightness-0 dark:invert"
              />
            </div>
          </div>

          {/* Add Button */}
          <div className="flex justify-center mb-8">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="flex items-center gap-2 bg-sky-400 hover:bg-sky-500 text-white font-medium px-8 py-3 shadow-lg hover:shadow-xl transition-all text-lg">
                  <Plus className="w-5 h-5" />
                  Adicionar Programa
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingPrograma ? 'Editar Programa' : 'Adicionar Programa'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome do Programa</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="versao">Versão</Label>
                    <Input
                      id="versao"
                      value={formData.versao}
                      onChange={(e) => setFormData({...formData, versao: e.target.value})}
                      placeholder="1.0.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="arquivo">Arquivo do Programa</Label>
                    <Input
                      id="arquivo"
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      accept=".exe,.msi,.zip,.rar,.dmg,.pkg"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Formatos aceitos: .exe, .msi, .zip, .rar, .7z, .pdf, .txt, .docx, .doc • Máximo 150MB
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Upload chunked - suporta até 150MB!
                    </p>
                    {uploading && (
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Enviando arquivo...</span>
                          <span>{uploadProgress.toFixed(1)}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="url_download">URL de Download (Opcional)</Label>
                    <Input
                      id="url_download"
                      value={formData.url_download}
                      onChange={(e) => setFormData({...formData, url_download: e.target.value})}
                      placeholder="https://... (deixe vazio para usar o arquivo uploadado)"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={uploading}>
                      {uploading ? (
                        <>
                          <Upload className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        editingPrograma ? 'Atualizar' : 'Adicionar'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Programs List */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col gap-4">
              {programas.map((programa) => (
                <Card key={programa.id} className="hover:shadow-lg transition-all duration-200 animate-fade-in">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl text-foreground mb-2">
                          {programa.nome}
                        </h3>
                        {programa.versao && (
                          <p className="text-sm text-muted-foreground mb-2">
                            <span className="font-medium">Versão:</span> {programa.versao}
                          </p>
                        )}
                        {programa.descricao && (
                          <p className="text-sm text-muted-foreground mb-4">
                            <span className="font-medium">Descrição:</span> {programa.descricao}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-3 flex-wrap ml-4">
                        {(programa.url_download || programa.arquivo_path) && (
                          <Button
                            size="default"
                            onClick={() => openUrl(programa.url_download || programa.arquivo_path!)}
                            className="flex items-center gap-2 bg-sky-400 hover:bg-sky-500 text-white font-medium px-6 py-2 shadow-md hover:shadow-lg transition-all"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                        )}
                        <Button
                          size="default"
                          onClick={() => editPrograma(programa)}
                          className="flex items-center gap-2 bg-sky-400 hover:bg-sky-500 text-white font-medium px-6 py-2 shadow-md hover:shadow-lg transition-all"
                        >
                          <Settings className="w-4 h-4" />
                          Editar
                        </Button>
                        <Button
                          size="default"
                          variant="destructive"
                          onClick={() => deletePrograma(programa)}
                          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2 shadow-md hover:shadow-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {programas.length === 0 && (
              <div className="text-center py-12 animate-fade-in">
                <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg mb-2">Nenhum programa cadastrado ainda.</p>
                <p className="text-muted-foreground">Clique em "Adicionar Programa" para fazer upload do primeiro arquivo.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRouteWithPermissions>
  )
};

export default ProgramasPage;
