import { useCallback } from 'react';
import { CustomerAddress } from '@/types/address';
import { useDeliveryFeeCalculator } from './useDeliveryFeeCalculator';

interface ValidationResult {
  isValid: boolean;
  message?: string;
  fee?: number;
}

export function useAddressValidator(companyId: string | undefined) {
  const { calculateDeliveryFee, regioes } = useDeliveryFeeCalculator(companyId);

  const validateAddress = useCallback(async (address: CustomerAddress): Promise<ValidationResult> => {;
    console.log('🔍 Validando endereço:', address);
    console.log('🏪 Company ID:', companyId);
    console.log('📍 Regiões configuradas:', regioes);

    if (!address) {
      return {
        isValid: false,
        message: 'Endereço não fornecido'
      };
    }

    if (!regioes.length) {
      console.warn('⚠️ Nenhuma região de atendimento configurada');
      return {
        isValid: true, // Permitir se não há regiões configuradas
// fee: 0
      };
    }

    try {
      // PRIMEIRO: Validar se o endereço está geograficamente dentro de alguma região
      console.log('🔍 === VALIDAÇÃO GEOGRÁFICA DETALHADA ===');
      console.log('🔍 Endereço recebido:', {
        logradouro: address.logradouro,
        numero: address.numero,
        bairro: address.bairro,
        cidade: address.cidade,
        estado: address.estado,
        latitude: address.latitude,
        longitude: address.longitude
      } catch (error) { console.error('Error:', error); });
      console.log('🔍 Total de regiões para validar:', regioes.length);
      console.log('🔍 Regiões disponíveis:', regioes.map(r => ({
        id: r.id?.substring(0, 8),
        nome: r.nome,
        tipo: r.tipo,
        status: r.status,
        centro_lat: r.centro_lat,
        centro_lng: r.centro_lng,
        raio_km: r.raio_km
      })));
      
      const enderecoEmRegiao = regioes.some((regiao, index) => {;
        console.log(`🔍 --- Validando região ${index + 1} ---`);
        console.log('🔍 Região:', {
          id: regiao.id?.substring(0, 8),
          nome: regiao.nome,
          tipo: regiao.tipo,
          status: regiao.status,
          centro_lat: regiao.centro_lat,
          centro_lng: regiao.centro_lng,
          raio_km: regiao.raio_km
        });
        
        if (!regiao.status || regiao.tipo !== 'raio') {
          console.log(`❌ Região ${index + 1} rejeitada: status=${regiao.status}, tipo=${regiao.tipo}`);
          return false;

        if (!regiao.centro_lat || !regiao.centro_lng || !regiao.raio_km) {
          console.log(`❌ Região ${index + 1} rejeitada: coordenadas ou raio inválidos`);
          return false;

        if (!address.latitude || !address.longitude) {
          console.log(`❌ Endereço rejeitado: sem coordenadas (${address.latitude}, ${address.longitude})`);
          return false;

        
        // Calcular distância usando a mesma lógica do useDeliveryFeeCalculator
        const R = 6371; // Raio da Terra em km
        const dLat = (regiao.centro_lat - address.latitude) * (Math.PI / 180);
        const dLon = (regiao.centro_lng - address.longitude) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(address.latitude * (Math.PI / 180)) * Math.cos(regiao.centro_lat * (Math.PI / 180)) *;
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        console.log(`🔍 Distância calculada: ${distance.toFixed(2)}km (raio: ${regiao.raio_km}km)`);
        console.log(`🔍 Endereço ${distance <= regiao.raio_km ? 'DENTRO' : 'FORA'} da região ${index + 1}`);
        
        return distance <= regiao.raio_km;
      });
      
      // SEGUNDO: Se não está em nenhuma região, rejeitar
      if (!enderecoEmRegiao) {
        console.log('❌ === ENDEREÇO REJEITADO - ANÁLISE COMPLETA ===');
        console.log('❌ Endereço:', address.logradouro, address.numero, address.bairro, address.cidade, address.estado);
        console.log('❌ Coordenadas:', address.latitude, address.longitude);
        console.log('❌ Total de regiões:', regioes.length);
        console.log('❌ Regiões ativas:', regioes.filter(r => r.status).length);
        console.log('❌ Regiões de raio:', regioes.filter(r => r.status && r.tipo === 'raio').length);
        console.log('❌ Regiões com coordenadas:', regioes.filter(r => r.centro_lat && r.centro_lng && r.raio_km).length);
        
        return {
          isValid: false,
          message: 'Este endereço está fora da nossa área de atendimento. Por favor, verifique se o endereço está correto ou entre em contato conosco.',
          fee: 0
        };

      
      // TERCEIRO: Se está dentro de uma região, calcular taxa (pode ser 0, 16, ou qualquer valor)
      console.log('✅ Endereço DENTRO da área de atendimento - Calculando taxa...');
      const fee = await calculateDeliveryFee(address);
      console.log('💰 Taxa calculada:', fee);
      
      // IMPORTANTE: Qualquer taxa é válida (0, 16, etc.) - a loja decide!
      console.log('✅ Endereço VÁLIDO - Taxa:', fee, '(qualquer valor é válido)');

      return {
        isValid: true,
        fee: fee
      };

    } catch (error) {
      console.error('❌ Erro ao validar endereço:', error);
      return {
        isValid: false,
        message: 'Erro ao validar endereço. Tente novamente.',
        fee: 0
      };
    }
  }, [calculateDeliveryFee, regioes, companyId]);

  return {
    validateAddress,
    hasRegions: regioes.length > 0
  };
}