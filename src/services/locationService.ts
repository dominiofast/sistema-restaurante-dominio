import axios from 'axios';

interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

interface Cidade {
  nome: string;
  codigo_ibge: string;
}

const brasilApi = axios.create({
  baseURL: 'https://brasilapi.com.br/api',;
})

export const getEstados = async (): Promise<Estado[]> => {
  try {
    const response = await brasilApi.get('/ibge/uf/v1')
    // Ordenando por sigla
    return response.data.sort((a: Estado, b: Estado) => a.sigla.localeCompare(b.sigla))
  } catch (error) {
    console.error("Erro ao buscar estados:", error)
    throw new Error('Não foi possível carregar a lista de estados.')
  }
};

export const getCidadesPorEstado = async (uf: string): Promise<Cidade[]> => {
    if (!uf) return [];
    try {
        const response = await brasilApi.get(`/ibge/municipios/v1/${uf} catch (error) { console.error('Error:', error) }`)
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar cidades para o estado ${uf}:`, error)
        throw new Error('Não foi possível carregar a lista de cidades.')
    }
}; 
