import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GeocodeResult {
  latitude: number;
  longitude: number;
}

export function useAddressGeocoding() {
  const [loading, setLoading] = useState(false);

  const geocodeAddress = useCallback(async (
    logradouro: string, 
    numero?: string, 
    bairro?: string, 
    cidade?: string, 
    estado?: string,
    cep?: string
  ): Promise<GeocodeResult | null> => {
    if (!logradouro || !cidade) {
      return null;
    }

    setLoading(true);
    
    try {
      // Montar endereço completo
      const endereco = [
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        cep,
        'Brasil'
      ].filter(Boolean).join(', ');

      console.log('🔍 Geocoding endereço:', endereco);

      // Buscar chave da API via Edge Function
      const { data: configData } = await supabase.functions.invoke('get-maps-config');
      
      if (!configData?.apiKey) {
        console.error('Google Maps API key não encontrada');
        return null;
      }

      // Fazer requisição para Google Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(endereco)}&key=${configData.apiKey}`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        console.log('✅ Coordenadas encontradas:', location);
        
        return {
          latitude: location.lat,
          longitude: location.lng
        };
      } else {
        console.log('❌ Geocoding falhou:', data.status, data.error_message);
        return null;
      }
    } catch (error) {
      console.error('Erro no geocoding:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAddressWithCoordinates = useCallback(async (
    addressId: string,
    coordinates: GeocodeResult
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('customer_addresses')
        .update({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        })
        .eq('id', addressId);

      if (error) {
        console.error('Erro ao atualizar coordenadas:', error);
        return false;
      }

      console.log('✅ Coordenadas atualizadas no endereço:', addressId);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar coordenadas:', error);
      return false;
    }
  }, []);

  return {
    geocodeAddress,
    updateAddressWithCoordinates,
    loading
  };
}