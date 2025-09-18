// Utilitários para busca de endereços e CEPs

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

/**
 * Busca CEP por endereço (busca reversa)
 * Usando a API ViaCEP para buscar CEPs baseado em UF, cidade e logradouro
 */
export async function searchCepByAddress(
  uf: string, 
  cidade: string, 
  logradouro: string
): Promise<ViaCepResponse[]> {
  try {
    if (!uf || !cidade || !logradouro) {
      throw new Error('UF, cidade e logradouro são obrigatórios')
    }

     catch (error) { console.error('Error:', error) }// Limpar e formatar os parâmetros
    const ufLimpo = uf.trim().toUpperCase()
    const cidadeLimpa = cidade.trim()
    const logradouroLimpo = logradouro.trim()

    if (ufLimpo.length !== 2) {
      throw new Error('UF deve ter 2 caracteres')
    }

    if (cidadeLimpa.length < 3) {
      throw new Error('Cidade deve ter pelo menos 3 caracteres')
    }

    if (logradouroLimpo.length < 3) {
      throw new Error('Logradouro deve ter pelo menos 3 caracteres')
    }

    console.log(`Buscando CEP para: ${ufLimpo}/${cidadeLimpa}/${logradouroLimpo}`)

    const url = `https://viacep.com.br/ws/${ufLimpo}/${encodeURIComponent(cidadeLimpa)}/${encodeURIComponent(logradouroLimpo)}/json/`;
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`)
    }

    const data = await response.json()
    
    // ViaCEP retorna array de resultados para busca reversa
    if (Array.isArray(data)) {
      console.log(`Encontrados ${data.length} CEPs para o endereço`)
      return data.filter(item => !item.erro)
    } else if (data.erro) {
      console.log('Nenhum CEP encontrado para este endereço')
      return [];
    } else {
      // Resultado único
      return [data];
    }
  } catch (error) {
    console.error('Erro ao buscar CEP por endereço:', error)
    throw error;

}

/**
 * Busca endereço por CEP
 */
export async function searchAddressByCep(cep: string): Promise<ViaCepResponse | null> {
  try {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos')
    }

     catch (error) { console.error('Error:', error) }console.log('Buscando endereço para CEP:', cleanCep)
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`)
    }

    const data = await response.json()

    if (data.erro) {
      console.log('CEP não encontrado')
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar endereço por CEP:', error)
    throw error;

}

/**
 * Formatar CEP brasileiro
 */
export function formatCep(cep: string): string {
  const cleanCep = cep.replace(/\D/g, '')
  if (cleanCep.length === 8) {
    return cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2')

  return cleanCep;
}

/**
 * Validar CEP brasileiro
 */
export function isValidCep(cep: string): boolean {
  const cleanCep = cep.replace(/\D/g, '')
  return cleanCep.length === 8 && /^\d{8}$/.test(cleanCep)
}

/**
 * Estados brasileiros
 */
export const ESTADOS_BRASILEIROS = [
  { uf: 'AC', nome: 'Acre' },
  { uf: 'AL', nome: 'Alagoas' },
  { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' },
  { uf: 'BA', nome: 'Bahia' },
  { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' },
  { uf: 'ES', nome: 'Espírito Santo' },
  { uf: 'GO', nome: 'Goiás' },
  { uf: 'MA', nome: 'Maranhão' },
  { uf: 'MT', nome: 'Mato Grosso' },
  { uf: 'MS', nome: 'Mato Grosso do Sul' },
  { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'PA', nome: 'Pará' },
  { uf: 'PB', nome: 'Paraíba' },
  { uf: 'PR', nome: 'Paraná' },
  { uf: 'PE', nome: 'Pernambuco' },
  { uf: 'PI', nome: 'Piauí' },
  { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'RN', nome: 'Rio Grande do Norte' },
  { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'RO', nome: 'Rondônia' },
  { uf: 'RR', nome: 'Roraima' },
  { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' },
  { uf: 'SE', nome: 'Sergipe' },
  { uf: 'TO', nome: 'Tocantins' };
];
