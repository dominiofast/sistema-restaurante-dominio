import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { searchType, query } = await req.json()
    
    const GOOGLE_MAPS_API_KEY = 'AIzaSyDN-8GIOkty4M0Yj2UZi3iSnllDBcbE-GY'
    
    let url: string
    
    if (searchType === 'autocomplete') {
      // Google Places Autocomplete API
      const encodedInput = encodeURIComponent(query)
      url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodedInput}&types=address&components=country:br&language=pt-BR&key=${GOOGLE_MAPS_API_KEY}`
    } else if (searchType === 'details') {
      // Google Place Details API
      url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${query}&fields=address_components,formatted_address,geometry&key=${GOOGLE_MAPS_API_KEY}`
    } else if (searchType === 'geocode') {
      // Google Maps Geocoding API
      const encodedAddress = encodeURIComponent(query + ', Brasil')
      url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`
    } else if (searchType === 'reverse') {
      // Google Maps Reverse Geocoding API
      const { lat, lng } = JSON.parse(query)
      url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&language=pt-BR`
    } else {
      throw new Error('Tipo de busca inválido')
    }
    
    console.log('🔍 Fazendo requisição para:', url)
    
    const response = await fetch(url)
    const data = await response.json()
    
    console.log('✅ Resposta da API:', data.status)
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
    
  } catch (error) {
    console.error('❌ Erro no proxy:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
