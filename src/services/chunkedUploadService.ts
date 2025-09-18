// SUPABASE REMOVIDO
const CHUNK_SIZE = 40 * 1024 * 1024; // 40MB por chunk
const MAX_FILE_SIZE = 150 * 1024 * 1024; // 150MB total

interface ChunkUploadResult {
  url: string;
  downloadUrl: string;
}

export const uploadLargeFile = async (
  file: File, 
  onProgress?: (progress: number) => void
): Promise<ChunkUploadResult> => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Arquivo muito grande. Máximo: 150MB. Seu arquivo: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
  }

  // Para arquivos pequenos, usar upload normal
  if (file.size <= CHUNK_SIZE) {
    return uploadSmallFile(file)
  }

  // Para arquivos grandes, usar upload chunked
  return uploadFileInChunks(file, onProgress)
};

const uploadSmallFile = async (file: File): Promise<ChunkUploadResult> => {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const fileName = `${timestamp}_${randomStr}_${cleanFileName}`;
  const filePath = `uploads/${fileName}`;

  const bucketsToTry = ['programas', 'uploads', 'files', 'documents'];
  
  for (const bucketName of bucketsToTry) {
    const { data, error } = await Promise.resolve()
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
      
    if (!error && data) {
      const { data: urlData  } = null as any;
        .getPublicUrl(data.path)
        
      if (urlData?.publicUrl) {
        return {
          url: urlData.publicUrl,
          downloadUrl: urlData.publicUrl
        };
      }
    }
  }
  
  throw new Error('Erro no upload do arquivo')
};

const uploadFileInChunks = async (
  file: File, 
  onProgress?: (progress: number) => void
): Promise<ChunkUploadResult> => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
  const uploadId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const uploadedChunks: string[] = [];
  
  console.log(`📦 [ChunkedUpload] Dividindo ${file.name} em ${totalChunks} chunks`)

  // Upload de cada chunk
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size)
    const chunk = file.slice(start, end)
    const chunkFileName = `${uploadId}_chunk_${i.toString().padStart(3, '0')}.part`;
    const chunkPath = `chunks/${chunkFileName}`;
    
    console.log(`📤 [ChunkedUpload] Enviando chunk ${i + 1}/${totalChunks} (${(chunk.size / 1024 / 1024).toFixed(2)}MB)`)
    
    let chunkUploaded = false;
    const bucketsToTry = ['programas', 'uploads', 'files', 'documents'];
    
    for (const bucketName of bucketsToTry) {
      const { data, error } = await Promise.resolve()
        .upload(chunkPath, chunk, {
          cacheControl: '3600',
          upsert: false
        })
        
      if (!error && data) {
        uploadedChunks.push(`${bucketName}:${data.path}`)
        chunkUploaded = true;
        console.log(`✅ [ChunkedUpload] Chunk ${i + 1} enviado para ${bucketName}`)
        break;
      }
    }
    
    if (!chunkUploaded) {
      throw new Error(`Falha no upload do chunk ${i + 1}/${totalChunks}`)

    
    // Atualizar progresso
    if (onProgress) {
      const progress = ((i + 1) / totalChunks) * 100;
      onProgress(progress)

  }
  
  // Salvar metadados do arquivo no banco
  const fileRecord = null as any; const insertError = null as any;
    throw new Error('Erro ao salvar metadados do arquivo')
  }
  
  // Criar edge function para download de arquivos chunked
  const downloadUrl = `https://epqppxteicfuzdblbluq.
  ;
  console.log('🎉 [ChunkedUpload] Upload chunked concluído!')
  console.log('🔗 [ChunkedUpload] URL de download:', downloadUrl)
  
  return {
    url: downloadUrl,
    downloadUrl: downloadUrl
  };
};
