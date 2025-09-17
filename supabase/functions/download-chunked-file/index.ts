import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`🚀 [DownloadChunked] Requisição recebida: ${req.method} ${req.url}`)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const fileId = url.searchParams.get('id')
    
    console.log(`📋 [DownloadChunked] File ID solicitado: ${fileId}`)
    
    if (!fileId) {
      console.error('❌ [DownloadChunked] File ID não fornecido')
      return new Response(JSON.stringify({ error: 'File ID is required' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`🔍 [DownloadChunked] Buscando metadados para arquivo: ${fileId}`)

    // Buscar metadados do arquivo
    const { data: fileMetadata, error: metaError } = await supabaseClient
      .from('chunked_files')
      .select('*')
      .eq('id', fileId)
      .single()

    if (metaError) {
      console.error(`❌ [DownloadChunked] Erro ao buscar metadados:`, metaError)
      return new Response(JSON.stringify({ error: 'Database error', details: metaError.message }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!fileMetadata) {
      console.error(`❌ [DownloadChunked] Arquivo não encontrado: ${fileId}`)
      return new Response(JSON.stringify({ error: 'File not found' }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`📊 [DownloadChunked] Arquivo: ${fileMetadata.original_name}`)
    console.log(`📊 [DownloadChunked] Total chunks: ${fileMetadata.total_chunks}`)
    console.log(`📊 [DownloadChunked] Tamanho: ${(fileMetadata.total_size / 1024 / 1024).toFixed(2)}MB`)

    // Usar ReadableStream para streaming eficiente
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log(`🌊 [DownloadChunked] Iniciando streaming de ${fileMetadata.chunk_paths.length} chunks`)
          
          for (let i = 0; i < fileMetadata.chunk_paths.length; i++) {
            const chunkPath = fileMetadata.chunk_paths[i]
            console.log(`📥 [DownloadChunked] Streaming chunk ${i + 1}/${fileMetadata.chunk_paths.length}`)
            
            const [bucketName, filePath] = chunkPath.split(':')
            
            if (!bucketName || !filePath) {
              console.error(`❌ [DownloadChunked] Formato inválido: ${chunkPath}`)
              controller.error(new Error(`Invalid chunk path: ${chunkPath}`))
              return
            }
            
            // Baixar chunk individual
            const { data: chunkData, error: chunkError } = await supabaseClient.storage
              .from(bucketName)
              .download(filePath)
              
            if (chunkError || !chunkData) {
              console.error(`❌ [DownloadChunked] Erro no chunk ${i + 1}:`, chunkError)
              controller.error(new Error(`Error downloading chunk ${i + 1}: ${chunkError?.message}`))
              return
            }
            
            // Converter para Uint8Array e enqueue para streaming
            const arrayBuffer = await chunkData.arrayBuffer()
            const chunkBytes = new Uint8Array(arrayBuffer)
            
            controller.enqueue(chunkBytes)
            console.log(`✅ [DownloadChunked] Chunk ${i + 1} enviado: ${(chunkBytes.length / 1024 / 1024).toFixed(2)}MB`)
            
            // Pequena pausa para evitar sobrecarga
            if (i < fileMetadata.chunk_paths.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 10))
            }
          }
          
          console.log(`✅ [DownloadChunked] Streaming completo!`)
          controller.close()
          
        } catch (error) {
          console.error(`❌ [DownloadChunked] Erro no streaming:`, error)
          controller.error(error)
        }
      }
    })
    
    // Retornar response com streaming
    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': fileMetadata.mime_type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileMetadata.original_name}"`,
        'Content-Length': fileMetadata.total_size.toString(),
        'Cache-Control': 'no-cache',
      },
    })
    
  } catch (error) {
    console.error('❌ [DownloadChunked] Erro geral:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})