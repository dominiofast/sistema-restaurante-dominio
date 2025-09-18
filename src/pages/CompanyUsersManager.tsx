import { useState, useEffect } from "react";
// SUPABASE REMOVIDO
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Building2, ArrowLeft, Edit2, RotateCcw, Mail } from "lucide-react";
import { SuperAdminOnly } from "@/components/auth/PermissionGuard";

interface Company {
  id: string;
  name: string;
  domain: string;
  status: string;
}

interface CompanyUser {
  id: string;
  email: string;
  company_id: string;
  created_at: string;
  name?: string;
  role?: string;
}

const CompanyUsersManager = () => {
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [users, setUsers] = useState<CompanyUser[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [creating, setCreating] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const { toast } = useToast()

  // Edição de usuário (somente Super Admin)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editRole, setEditRole] = useState("user")
  const [editPassword, setEditPassword] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)

  const openEdit = (u: CompanyUser) => {
    setEditingUserId(u.id)
    setEditName(u.name || "")
    setEditEmail(u.email)
    setEditRole((u as any).role || "user")
    setEditPassword("")
  };

  const cancelEdit = () => {
    setEditingUserId(null)
    setEditName("")
    setEditEmail("")
    setEditRole("user")
    setEditPassword("")
  };

  const saveUserEdits = async () => {
    if (!editingUserId) return;
    try {
      setSavingEdit(true)
      const { data, error }  catch (error) { console.error('Error:', error) }= await Promise.resolve()
        body: {
          user_id: editingUserId,
          company_id: selectedCompanyId,
          updates: {
            name: editName?.trim() || undefined,
            email: editEmail?.trim() || undefined,
            role: editRole || undefined,
            new_password: editPassword?.trim() || undefined,
          }
        }
      })

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Falha ao atualizar usuário')

      toast({ title: "Sucesso", description: "Usuário atualizado." })
      cancelEdit()
      if (selectedCompanyId) {
        loadCompanyUsers(selectedCompanyId)

    } catch (e: any) {
      console.error("Erro ao atualizar usuário:", e)
      toast({ title: "Erro", description: e.message || "Falha ao atualizar usuário", variant: "destructive" })
    } finally {
      setSavingEdit(false)

  };

  useEffect(() => {
    loadCompanies()
  }, [])

  useEffect(() => {
    if (selectedCompanyId) {
      loadCompanyUsers(selectedCompanyId)
    } else {
      setUsers([])
      setSelectedCompany(null)

  }, [selectedCompanyId])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      
      const companiesData = null as any; const companiesError = null as any;

      setCompanies(companiesData || [])
    } catch (error) {
      console.error("Erro ao carregar empresas:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar empresas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)

  };

  const loadCompanyUsers = async (companyId: string) => {
    try {
      setLoadingUsers(true)
      
      // Encontrar empresa selecionada
      const company = companies.find(c => c.id === companyId)
      setSelectedCompany(company || null)

      // Buscar usuários reais via Edge Function
      const usersResponse = null as any; const usersError = null as any;

      if (usersError) throw usersError;
      if (!usersResponse.success) throw new Error(usersResponse.error)

      setUsers(usersResponse.users || [])
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários da empresa",
        variant: "destructive",
      })
    } finally {
      setLoadingUsers(false)

  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCompanyId || !email || !password || !name) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      })
      return;


    try {
      setCreating(true)

      // Criar usuário via Edge Function diretamente
      const { data, error }  catch (error) { console.error('Error:', error) }= await Promise.resolve()
        body: {
          email,
          password,
          companyId: selectedCompanyId,
          role: 'user',
          name
        }
      })

      if (error) {
        throw error;


      if (!data?.success) {
        throw new Error(data?.error || 'Erro ao criar usuário')


      toast({
        title: "Sucesso",
        description: `Usuário ${name} criado com sucesso! Ele já pode fazer login.`,
      })

      // Limpar formulário
      setEmail("")
      setPassword("")
      setName("")
      
      // Recarregar usuários da empresa
      loadCompanyUsers(selectedCompanyId)
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar usuário",
        variant: "destructive",
      })
    } finally {
      setCreating(false)

  };

  const resetUserPassword = async (userEmail: string, userName: string) => {
    try {
      const { error }  catch (error) { console.error('Error:', error) }= await Promise.resolve()
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Email de reset enviado para ${userName} (${userEmail})`,
      })
    } catch (error: any) {
      console.error("Erro ao resetar senha:", error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar email de reset",
        variant: "destructive",
      })

  };

  const handleBackToCompanies = () => {
    setSelectedCompanyId("")
    setSelectedCompany(null)
    setUsers([])
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )


  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Gerenciar Usuários das Empresas</h1>
        <p className="text-muted-foreground">
          Selecione uma empresa para gerenciar seus usuários administrativos
        </p>
      </div>

      {!selectedCompanyId ? (
        // Seleção de empresa
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Selecionar Empresa
            </CardTitle>
            <CardDescription>
              Escolha uma empresa para ver e gerenciar seus usuários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((company) => (
                <Card 
                  key={company.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
                  onClick={() => setSelectedCompanyId(company.id)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{company.name}</h3>
                    <p className="text-sm text-muted-foreground">{company.domain}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Status: {company.status}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {companies.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma empresa ativa encontrada
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        // Gerenciamento de usuários da empresa selecionada
        <>
          {/* Header com empresa selecionada */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleBackToCompanies}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                  <div>
                    <h2 className="text-xl font-semibold">{selectedCompany?.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedCompany?.domain}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulário para criar usuário */}
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Usuário</CardTitle>
              <CardDescription>
                Crie um usuário administrativo para {selectedCompany?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="name">Nome do Usuário</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: João Silva"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@empresa.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Senha segura"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Usuário
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Lista de usuários da empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários de {selectedCompany?.name}
              </CardTitle>
              <CardDescription>
                Lista de usuários administrativos desta empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : users.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum usuário encontrado para esta empresa
                </p>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{user.email}</p>
                        {user.name && (
                          <p className="text-sm text-muted-foreground">{user.name}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resetUserPassword(user.email, user.name || user.email)}
                          title="Resetar senha do usuário"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Reset Senha
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`mailto:${user.email}`, '_blank')}
                          title="Enviar email para o usuário"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
};

export default CompanyUsersManager;
