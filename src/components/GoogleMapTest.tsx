import React from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { useGoogleMapsConfig } from "../hooks/useGoogleMapsConfig";

const containerStyle = {
  width: "100%",
  height: "200px",
  borderRadius: "8px",
  overflow: "hidden",
};

export const GoogleMapTest: React.FC = () => {
  const { apiKey, loading, error } = useGoogleMapsConfig();

  console.log('🔍 GoogleMapTest - Debug:', { apiKey, loading, error });

  if (loading) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 h-52 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  if (error || !apiKey) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 h-52 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Erro ao carregar o mapa</p>
          <p className="text-sm text-gray-400">{error || 'Chave da API não configurada'}</p>
          <p className="text-xs text-gray-300 mt-2">API Key: {apiKey ? 'Configurada' : 'Não configurada'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-600 mb-2">Teste do Google Maps - API Key: {apiKey.substring(0, 20)}...</p>
      <LoadScript googleMapsApiKey={apiKey} libraries={[]}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: -11.4387, lng: -61.4472 }}
          zoom={14}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
          }}
        >
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default GoogleMapTest;
