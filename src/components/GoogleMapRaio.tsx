import React from "react";
import { GoogleMap, LoadScript, Marker, Circle } from "@react-google-maps/api";
import { useGoogleMapsConfig } from "../hooks/useGoogleMapsConfig";
import { RegiaoAtendimento } from "@/hooks/useRegioesAtendimento";

export interface GoogleMapRaioProps {
  center: { lat: number; lng: number };
  raio?: number; // em km
  regioes?: RegiaoAtendimento[];
}

const containerStyle = {
  width: "100%",
  height: "200px",
  borderRadius: "8px",
  overflow: "hidden",
};

export const GoogleMapRaio: React.FC<GoogleMapRaioProps> = ({ center, raio, regioes }) => {
  const { apiKey, loading, error } = useGoogleMapsConfig();

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
        </div>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={[]}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        <Marker position={center} />
        {regioes && regioes.map(r => r.raio_km && (
          <Circle
            key={r.id}
            center={center}
            radius={r.raio_km * 1000} // km para metros
            options={{
              fillColor: "#357dc2",
              fillOpacity: 0.2,
              strokeColor: "#357dc2",
              strokeOpacity: 0.5,
              strokeWeight: 1,
            }}
          />
        ))}
        {raio && !regioes && (
          <Circle
            center={center}
            radius={raio * 1000} // km para metros
            options={{
              fillColor: "#357dc2",
              fillOpacity: 0.25,
              strokeColor: "#357dc2",
              strokeOpacity: 0.7,
              strokeWeight: 2,
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapRaio;
