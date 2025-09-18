import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, X, Map, Navigation, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGoogleMapsGeocoding } from '@/hooks/useGoogleMapsGeocoding';
import { searchAddressByCep, formatCep } from '@/utils/addressUtils';
import { AddressSuggestion } from '@/types/address';

// Componente inline para mostrar sugestões
const AddressInlineSuggestions: React.FC<{
  suggestions: AddressSuggestion[];
  searchText: string;
  onSuggestionSelect: (suggestion: AddressSuggestion) => void;
  primaryColor?: string;
}> = ({ suggestions, searchText, onSuggestionSelect, primaryColor }) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      {/* Header com resultados */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600">
          Resultados para: <span className="font-medium text-gray-900">"{searchText}"</span>
        </p>
        <p className="text-xs text-gray-500">
          {suggestions.length} endereço{suggestions.length !== 1 ? 's' : ''} encontrado{suggestions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Lista de sugestões */}
      <div className="max-h-60 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <button
            key={suggestion.id}
            onClick={() => onSuggestionSelect(suggestion)}
            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors group ${
              index !== suggestions.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-gray-400 group-hover:text-orange-500 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-gray-900 group-hover:text-orange-700">
                  {suggestion.logradouro}
                </div>
                <div className="text-sm text-gray-600">
                  {suggestion.bairro}, {suggestion.cidade} - {suggestion.estado}
                </div>
                {suggestion.cep && (
                  <div className="text-xs text-gray-500 mt-1">
                    CEP: {suggestion.cep}
                  </div>
                )}
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-orange-500 flex-shrink-0" />
            </div>
          </button>
        ))}
      </div>

      {/* Opção para não encontrar o endereço */}
      <div className="border-t border-gray-200">
        <button className="w-full text-left p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-gray-400" />
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                Não achei meu endereço
              </div>
              <div className="text-sm text-gray-600">
                Procurar pelo mapa ou usar localização
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </button>
      </div>
    </div>
  )
};

interface AddressSearchStepProps {
  searchText: string;
  onSearchTextChange: (text: string) => void;
  onSearchComplete: (suggestions: AddressSuggestion[]) => void;
  onClose: () => void;
  primaryColor?: string;
  suggestions: AddressSuggestion[];
  onSuggestionSelect: (suggestion: AddressSuggestion) => void;
  isFullscreen?: boolean;
}

export const AddressSearchStep: React.FC<AddressSearchStepProps> = ({
  searchText,
  onSearchTextChange,
  onSearchComplete,
  onClose,
  primaryColor,
  suggestions,
  onSuggestionSelect,
  isFullscreen = false
}) => {
  const { toast } = useToast()
  const { searchAddressSuggestions, searchAddressByCoordinates } = useGoogleMapsGeocoding()
  const [searching, setSearching] = useState(false)
  const [searchType, setSearchType] = useState<'text' | 'cep'>('text')

  // Detectar se é CEP ou endereço
  useEffect(() => {
    const cleanText = searchText.replace(/\D/g, '')
    if (cleanText.length === 8) {
      setSearchType('cep')
    } else {
      setSearchType('text')
    }
  }, [searchText])

  // Buscar endereços
  const searchAddresses = async () => {
    if (!searchText.trim() || searchText.length < 3) {
      return;
    }

    console.log('🔍 Iniciando busca de endereços...')
    console.log('📝 Texto de busca:', searchText)
    console.log('🔤 Tipo de busca:', searchType)

    setSearching(true)
    try {
      let suggestions: AddressSuggestion[] = [];

      if (searchType === 'cep') {
        // Buscar por CEP
        console.log('🔍 Buscando por CEP...')
        const cleanCep = searchText.replace(/\D/g, '')
        console.log('🧹 CEP limpo:', cleanCep)
        
        const cepResult = await searchAddressByCep(cleanCep)
        console.log('📦 Resultado CEP:', cepResult)
        
        if (cepResult) {
          suggestions = [{
            id: 'cep-result',
            formatted_address: `${cepResult.logradouro} catch (error) { console.error('Error:', error) }, ${cepResult.bairro}, ${cepResult.localidade}, ${cepResult.uf}`,
            logradouro: cepResult.logradouro,
            bairro: cepResult.bairro,
            cidade: cepResult.localidade,
            estado: cepResult.uf,
            cep: formatCep(cleanCep)
          }];
          console.log('✅ Sugestão CEP criada:', suggestions[0])

      } else {
        // Buscar por texto
        console.log('🔍 Buscando por texto...')
        const results = await searchAddressSuggestions(searchText)
        console.log('📦 Resultados texto:', results)
        
        if (results && results.length > 0) {
          suggestions = results.map((result, index) => ({
            id: `suggestion-${index}`,
            formatted_address: `${result.logradouro}, ${result.bairro}, ${result.cidade}, ${result.estado}`,
            logradouro: result.logradouro,
            bairro: result.bairro,
            cidade: result.cidade,
            estado: result.estado,
            cep: result.cep,
            latitude: result.latitude,
            longitude: result.longitude
          }))
          console.log('✅ Sugestões texto criadas:', suggestions)



      console.log('📋 Total de sugestões:', suggestions.length)
      onSearchComplete(suggestions)
      
      if (suggestions.length === 0) {
        console.log('❌ Nenhuma sugestão encontrada')
        toast({
          title: "Nenhum endereço encontrado",
          description: "Tente com um endereço diferente ou use outra opção",
          variant: "destructive"
        })

    } catch (error) {
      console.error('❌ Erro ao buscar endereços:', error)
      toast({
        title: "Erro ao buscar endereços",
        description: "Tente novamente ou use outra opção",
        variant: "destructive"
      })
    } finally {
      setSearching(false)
    }
  };

  // Debounce para busca automática
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText && searchText.length >= 3) {
        searchAddresses()

    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchText, searchType])

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      setSearching(true)
      
      // Configurações para geolocalização
      const geoOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000;
      };
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            console.log('📍 Coordenadas obtidas:', latitude, longitude)
            
            // Buscar endereço usando as coordenadas
            const address = await searchAddressByCoordinates(latitude, longitude)
            
            if (address) {
              console.log('✅ Endereço encontrado:', address)
              
              // Preencher o campo de busca com o endereço encontrado
              const fullAddress = `${address.logradouro} catch (error) { console.error('Error:', error) }, ${address.bairro}, ${address.cidade}`;
              onSearchTextChange(fullAddress)
              
              // Criar sugestão com o endereço encontrado
              const locationSuggestion: AddressSuggestion = {
                id: 'current-location',
                formatted_address: `${address.logradouro}, ${address.bairro}, ${address.cidade}, ${address.estado}`,
                logradouro: address.logradouro,
                bairro: address.bairro,
                cidade: address.cidade,
                estado: address.estado,
                cep: address.cep,
                latitude: address.latitude,
                longitude: address.longitude
              };
              
              // Mostrar na lista de sugestões
              onSearchComplete([locationSuggestion])
              
              toast({
                title: "Localização encontrada!",
                description: "Endereço da sua localização atual foi encontrado",
              })
            } else {
              toast({
                title: "Endereço não encontrado",
                description: "Não foi possível encontrar o endereço para sua localização",
                variant: "destructive"
              })

          } catch (error) {
            console.error('Erro ao buscar endereço:', error)
            toast({
              title: "Erro ao buscar endereço",
              description: "Não foi possível encontrar o endereço para sua localização",
              variant: "destructive"
            })
          } finally {
            setSearching(false)

        },
        (error) => {
          setSearching(false)
          console.error('Erro de geolocalização:', error)
          
          let errorMessage = "Verifique as permissões de localização";
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Permissão de localização negada. Ative a localização nas configurações do navegador.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Localização indisponível. Tente novamente.";
              break;
            case error.TIMEOUT:
              errorMessage = "Tempo esgotado para obter localização. Tente novamente.";
              break;

          
          toast({
            title: "Erro ao obter localização",
            description: errorMessage,
            variant: "destructive"
          })
        },
        geoOptions
      )
    } else {
      toast({
        title: "Geolocalização não suportada",
        description: "Seu navegador não suporta geolocalização",
        variant: "destructive"
      })
    }
  };

  const handleActivateLocation = () => {
    handleUseLocation()
  };

  // Layout para fullscreen (sem header próprio)
  if (isFullscreen) {
    return (
      <div className="space-y-6">
        {/* Aviso sobre localização - mais discreto e no topo */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-500 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              Compartilhamento de localização desativado - Toque para ativar
            </p>
          </div>
        </div>

        {/* Pergunta principal */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Em qual endereço você deseja receber seu pedido?
          </h3>
          <p className="text-gray-600">
            Digite seu endereço ou CEP para encontrarmos você
          </p>
        </div>

        {/* Campo de busca - maior para fullscreen */}
        <div className="space-y-3">
          <Label htmlFor="search" className="text-base font-medium">
            Insira seu endereço ou CEP
          </Label>
          <div className="relative">
            <Input
              id="search"
              placeholder="Ex.: Rua São João, 134"
              value={searchText}
              onChange={(e) => onSearchTextChange(e.target.value)}
              className="h-14 text-lg pr-12 border-2 focus:border-orange-500"
              style={{ borderColor: searchText ? (primaryColor || '#f97316') : undefined }}
            />
            {searching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
              </div>
            )}
          </div>
        </div>

        {/* Sugestões inline - mais espaçosas */}
        {!searching && searchText.length >= 3 && (
          <div className="space-y-4">
            <AddressInlineSuggestions
              suggestions={suggestions}
              searchText={searchText}
              onSuggestionSelect={onSuggestionSelect}
              primaryColor={primaryColor}
            />
          </div>
        )}

        {/* Separador */}
        <div className="flex items-center justify-center">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-4 text-gray-500 text-sm bg-white">ou</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* Botão de localização - único botão */}
        <div>
          <Button
            onClick={handleUseLocation}
            disabled={searching}
            className="w-full h-14 text-lg bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
            style={primaryColor ? { backgroundColor: primaryColor } : undefined}
          >
            {searching ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Buscando localização...
              </>
            ) : (
              <>
                <Navigation size={20} className="mr-3" />
                Usar minha localização
              </>
            )}
          </Button>
        </div>
      </div>
    )


  // Layout para modal tradicional
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold text-gray-900">
          Novo Endereço
        </h2>
        <div></div>
      </div>

      <div className="p-6">
        {/* Pergunta principal */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            Em qual endereço você deseja receber seu pedido?
          </h3>
        </div>

        {/* Campo de busca */}
        <div className="space-y-2 mb-4">
          <Label htmlFor="search">Insira seu endereço ou CEP</Label>
          <div className="relative">
            <Input
              id="search"
              placeholder="Ex.: Rua São João, 134"
              value={searchText}
              onChange={(e) => onSearchTextChange(e.target.value)}
              className="pr-10"
              style={{ borderColor: primaryColor || '#f97316' }}
            />
            {searching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
              </div>
            )}
          </div>
        </div>

        {/* Sugestões inline */}
        {!searching && searchText.length >= 3 && (
          <div className="mb-4">
            <AddressInlineSuggestions
              suggestions={suggestions}
              searchText={searchText}
              onSuggestionSelect={onSuggestionSelect}
              primaryColor={primaryColor}
            />
          </div>
        )}

        {/* Separador */}
        <div className="text-center text-gray-500 text-sm mb-4">
          ou
        </div>

        {/* Botões de ação */}
        <div className="space-y-3 mb-4">
          <Button
            onClick={handleUseLocation}
            disabled={searching}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
            style={primaryColor ? { backgroundColor: primaryColor } : undefined}
          >
            {searching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Buscando localização...
              </>
            ) : (
              <>
                <Navigation size={16} className="mr-2" />
                Usar minha localização
              </>
            )}
          </Button>
        </div>

      </div>
    </>
  )
};
