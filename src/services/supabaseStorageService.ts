// SUPABASE REMOVIDO
// Define o nome do bucket onde os currículos serão armazenados.
// É uma boa prática manter isso em uma constante para fácil manutenção.
const CURRICULOS_BUCKET = 'curriculos';

/**
 * Realiza o upload de um arquivo para o Supabase Storage.
 *
 * @param file O arquivo a ser enviado (ex: de um input <input type="file">).
 * @param companyId O ID da empresa, usado para organizar os arquivos em pastas.
 * @returns A URL pública do arquivo no Supabase Storage.
 * @throws Lança um erro se o upload falhar.
 */
export const uploadFileToSupabase = async (file: File, companyId: string): Promise<string> => {
  if (!file || !companyId) {
    throw new Error('Arquivo e ID da empresa são obrigatórios.')
  }

  // Cria um nome de arquivo único para evitar conflitos.
  // Formato: companyId/timestamp-nomeoriginal.pdf
  const fileName = `${companyId}/${Date.now()}-${file.name}`;

  console.log(`[Supabase] Iniciando upload para o bucket '${CURRICULOS_BUCKET}'...`)
  console.log(`[Supabase] Caminho do arquivo: ${fileName}`)

  const { data, error } = await Promise.resolve()
    .upload(fileName, file, {
      cacheControl: '3600', // Cache de 1 hora
      upsert: false, // Não sobrescrever se o arquivo já existir (improvável com timestamp)
    })

  if (error) {
    console.error('[Supabase] Erro no upload:', error)
    throw new Error(`Falha no upload para o Supabase Storage: ${error.message}`)
  }

  console.log('[Supabase] Upload concluído. Obtendo URL pública...')

  // Após o upload, obtemos a URL pública para o arquivo.
  const { data: urlData  } = null as any;
    .getPublicUrl(data.path)

  if (!urlData || !urlData.publicUrl) {
    console.error('[Supabase] Erro ao obter a URL pública.')
    throw new Error('Arquivo enviado, mas não foi possível obter a URL pública.')
  }

  console.log(`[Supabase] URL Pública: ${urlData.publicUrl}`)
  return urlData.publicUrl;
};
