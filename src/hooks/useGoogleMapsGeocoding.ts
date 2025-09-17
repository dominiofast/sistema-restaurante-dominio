import { useState } from 'react';

interface GoogleMapsAddress {
  cep: string;
  logradouro: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  latitude?: number;
  longitude?: number;
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GeocodeResult {
  address_components: AddressComponent[];
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface ViaCepResult {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface OpenCageResult {
  geometry: {
    lat: number;
    lng: number;
  };
  components: {
    postcode?: string;
    road?: string;
    street?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    state_code?: string;
  };
}

export function useGoogleMapsGeocoding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chave da API do Google Maps
  const GOOGLE_MAPS_API_KEY = 'AIzaSyBOti4mM-6x9WDnZIjIeyb-QSNX-fBV5gY';

  const searchAddressByText = async (searchText: string): Promise<GoogleMapsAddress | null> => {
    if (!searchText.trim()) return null;

    setLoading(true);
    setError(null);

    try {
      // Usar o proxy do Supabase Edge Function
      const response = await fetch('https://epqppxteicfuzdblbluq.supabase.co/functions/v1/google-maps-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBweHRlaWNmdXpkYmxibHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTYwNjAsImV4cCI6MjA2NTY3MjA2MH0.rzwsy0eSZgIZ1Ia3ZU-mapEhgCSuwFsaJNXL-XshfHg`
        },
        body: JSON.stringify({
          searchType: 'geocode',
          query: searchText
        })
      });
      
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result: GeocodeResult = data.results[0];
        return parseGoogleMapsResult(result);
      } else {
        console.warn('Google Maps API não encontrou resultados para:', searchText);
        return null;
      }
    } catch (err) {
      console.error('Erro ao buscar endereço no Google Maps:', err);
      setError('Erro ao buscar endereço');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const searchAddressByCep = async (cep: string): Promise<GoogleMapsAddress | null> => {
    console.log('searchAddressByCep chamado com:', cep);
    const cleanCep = cep.replace(/\D/g, '');
    console.log('CEP limpo para busca:', cleanCep);
    
    if (cleanCep.length !== 8) {
      console.log('CEP inválido para busca:', cleanCep);
      return null;
    }

    // Primeiro tenta com ViaCEP (mais rápido para CEPs brasileiros)
    try {
      console.log('Tentando ViaCEP...');
      const viacepResult = await searchWithViaCep(cleanCep);
      console.log('Resultado ViaCEP:', viacepResult);
      
      if (viacepResult) {
        // Se ViaCEP funcionou, busca coordenadas no Google Maps
        const fullAddress = `${viacepResult.logradouro}, ${viacepResult.bairro}, ${viacepResult.cidade}, ${viacepResult.estado}, Brasil`;
        console.log('Buscando coordenadas para:', fullAddress);
        const googleResult = await searchAddressByText(fullAddress);
        console.log('Resultado Google Maps:', googleResult);
        
        const finalResult = {
          ...viacepResult,
          latitude: googleResult?.latitude,
          longitude: googleResult?.longitude
        };
        console.log('Resultado final combinado:', finalResult);
        return finalResult;
      }
    } catch (error) {
      console.warn('ViaCEP falhou, tentando Google Maps:', error);
    }

    // Se ViaCEP falhou, usa Google Maps diretamente
    console.log('Tentando Google Maps diretamente...');
    const formattedCep = cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2');
    console.log('CEP formatado para Google:', formattedCep);
    const result = await searchAddressByText(formattedCep);
    console.log('Resultado Google Maps direto:', result);
    return result;
  };

  // Nova função para buscar múltiplas sugestões usando Google Places API
  const searchAddressSuggestions = async (searchText: string): Promise<GoogleMapsAddress[]> => {
    if (!searchText.trim() || searchText.length < 3) return [];

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Iniciando busca com Google Places API...');
      
      // Usar Google Places API para autocomplete de endereços
      const results = await searchWithGooglePlaces(searchText);
      
      console.log('📋 Total de resultados:', results.length);
      return results.slice(0, 5);
      
    } catch (err) {
      console.error('Erro ao buscar sugestões:', err);
      setError('Erro ao buscar sugestões');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Nova função para busca reversa de endereço (coordenadas para endereço)
  const searchAddressByCoordinates = async (latitude: number, longitude: number): Promise<GoogleMapsAddress | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Iniciando busca reversa com coordenadas:', latitude, longitude);
      
      // Usar o proxy do Supabase Edge Function para reverse geocoding
      const response = await fetch('https://epqppxteicfuzdblbluq.supabase.co/functions/v1/google-maps-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBweHRlaWNmdXpkYmxibHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTYwNjAsImV4cCI6MjA2NTY3MjA2MH0.rzwsy0eSZgIZ1Ia3ZU-mapEhgCSuwFsaJNXL-XshfHg`
        },
        body: JSON.stringify({
          searchType: 'reverse',
          query: JSON.stringify({ lat: latitude, lng: longitude })
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        // Pegar o primeiro resultado (mais preciso)
        const result: GeocodeResult = data.results[0];
        console.log('✅ Endereço encontrado via coordenadas:', result.formatted_address);
        return parseGoogleMapsResult(result);
      } else {
        console.warn('Nenhum endereço encontrado para as coordenadas');
        return null;
      }
    } catch (err) {
      console.error('Erro na busca reversa:', err);
      setError('Erro ao buscar endereço pela localização');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Função para busca usando Google Places API (Autocomplete) via proxy
  const searchWithGooglePlaces = async (searchText: string): Promise<GoogleMapsAddress[]> => {
    try {
      console.log('🔍 Google Places - Buscando via proxy:', searchText);
      
      // Usar o proxy do Supabase Edge Function
      const response = await fetch('https://epqppxteicfuzdblbluq.supabase.co/functions/v1/google-maps-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBweHRlaWNmdXpkYmxibHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTYwNjAsImV4cCI6MjA2NTY3MjA2MH0.rzwsy0eSZgIZ1Ia3ZU-mapEhgCSuwFsaJNXL-XshfHg`
        },
        body: JSON.stringify({
          searchType: 'autocomplete',
          query: searchText
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.predictions && data.predictions.length > 0) {
        console.log('✅ Google Places - Encontrados predictions:', data.predictions.length);
        
        // Para cada prediction, buscar detalhes completos
        const detailedResults: GoogleMapsAddress[] = [];
        
        for (const prediction of data.predictions.slice(0, 5)) {
          try {
            const details = await getPlaceDetails(prediction.place_id);
            if (details) {
              detailedResults.push(details);
            }
          } catch (error) {
            console.log('❌ Erro ao buscar detalhes para:', prediction.place_id, error);
          }
        }
        
        console.log('✅ Google Places - Resultados detalhados:', detailedResults.length);
        return detailedResults;
      } else {
        console.log('❌ Google Places - Nenhum resultado. Status:', data.status);
        return [];
      }
    } catch (error) {
      console.log('❌ Google Places - Erro:', error);
      return [];
    }
  };

  // Função para buscar detalhes de um lugar específico via proxy
  const getPlaceDetails = async (placeId: string): Promise<GoogleMapsAddress | null> => {
    try {
      const response = await fetch('https://epqppxteicfuzdblbluq.supabase.co/functions/v1/google-maps-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBweHRlaWNmdXpkYmxibHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTYwNjAsImV4cCI6MjA2NTY3MjA2MH0.rzwsy0eSZgIZ1Ia3ZU-mapEhgCSuwFsaJNXL-XshfHg`
        },
        body: JSON.stringify({
          searchType: 'details',
          query: placeId
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.result) {
        return parseGoogleMapsResult(data.result);
      }
      
      return null;
    } catch (error) {
      console.log('❌ Erro ao buscar detalhes do lugar:', error);
      return null;
    }
  };

    

  const searchWithViaCep = async (cep: string): Promise<GoogleMapsAddress | null> => {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();

    if (!data.erro) {
      return {
        cep: cep.replace(/(\d{5})(\d{3})/, '$1-$2'),
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || ''
      };
    }
    return null;
  };

  const parseGoogleMapsResult = (result: GeocodeResult): GoogleMapsAddress => {
    const components = result.address_components;
    
    const getComponent = (types: string[]) => {
      const component = components.find(comp => 
        types.some(type => comp.types.includes(type))
      );
      return component?.long_name || '';
    };

    const getShortComponent = (types: string[]) => {
      const component = components.find(comp => 
        types.some(type => comp.types.includes(type))
      );
      return component?.short_name || '';
    };

    // Extrair CEP do endereço formatado ou dos componentes
    const postalCode = getComponent(['postal_code']) || '';
    
    // Melhorar extração do logradouro
    let logradouro = getComponent(['route']) || getComponent(['street_address']) || '';
    
    // Se não encontrou logradouro, tentar extrair do endereço formatado
    if (!logradouro && result.formatted_address) {
      const parts = result.formatted_address.split(',');
      if (parts.length > 0) {
        logradouro = parts[0].trim();
      }
    }
    
    // Melhorar extração do bairro
    let bairro = getComponent(['sublocality', 'sublocality_level_1']) || 
                 getComponent(['neighborhood']) || 
                 getComponent(['administrative_area_level_3']) || '';
    
    // Se não encontrou bairro, tentar extrair do endereço formatado
    if (!bairro && result.formatted_address) {
      const parts = result.formatted_address.split(',');
      if (parts.length > 1) {
        bairro = parts[1].trim();
      }
    }
    
    // Melhorar extração da cidade
    let cidade = getComponent(['locality', 'administrative_area_level_2']) || '';
    
    // Se não encontrou cidade, tentar extrair do endereço formatado
    if (!cidade && result.formatted_address) {
      const parts = result.formatted_address.split(',');
      if (parts.length > 2) {
        cidade = parts[2].trim();
      }
    }
    
    const estado = getShortComponent(['administrative_area_level_1']) || '';
    
    console.log('🔍 Parseando resultado:', {
      formatted_address: result.formatted_address,
      logradouro,
      bairro,
      cidade,
      estado,
      postalCode
    });
    
    return {
      cep: postalCode,
      logradouro,
      bairro,
      cidade,
      estado,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng
    };
  };

  return {
    searchAddressByText,
    searchAddressByCep,
    searchAddressSuggestions,
    searchAddressByCoordinates,
    loading,
    error
  };
}
