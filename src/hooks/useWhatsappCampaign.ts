import { useState } from 'react';
// SUPABASE REMOVIDO
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CampaignData {
  name: string;
  audience: string;
  country: string;
  message: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  sendNow: boolean;
  // Recorrência
  recurrenceType?: 'once' | 'daily' | 'weekly';
  daysOfWeek?: number[]; // 0=Dom, 1=Seg, ... 6=Sáb
  timeOfDay?: string; // HH:mm (prioridade sobre scheduledTime quando recorrente)
  timezone?: string; // ex: 'America/Sao_Paulo'
  imageFile?: File;


interface WhatsappIntegration {
  id: string;
  company_id: string;
  control_id: string;
  host: string;
  instance_key: string;
  token: string;
  webhook?: string;


interface Cliente {
  id: number; // Mudando de string para number para compatibilidade
  nome: string;
  telefone: string;
  email?: string;
  status?: string;


// Função para sanitizar links sem quebrar o preview
const sanitizeLinks = (text: string) => {
  if (!text) return text;
  // Simplesmente retorna o texto sem modificações nos links
  return text;
};

export const useWhatsappCampaign = () => {
  const { currentCompany } = useAuth()
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  // Buscar integração WhatsApp da empresa atual (exclusivamente Marketing)
  const getWhatsappIntegration = async (): Promise<WhatsappIntegration | null> => {
    if (!currentCompany?.id) {
      toast.error('Empresa não identificada')
      return null;
    }

    try {
      const { data, error }  catch (error) { console.error('Error:', error) }= 
        
        
        
        
        
        
        

      if (error) {
        console.error('Erro ao buscar integração WhatsApp (marketing):', error)
      }

      if (!data) {
        toast.error('Integração WhatsApp de Marketing não encontrada. Configure em: Super Admin → WhatsApp Admin (Uso: Marketing)')
        return null;
      }

      return data as any;
    } catch (error) {
      console.error('Erro ao buscar integração (marketing):', error)
      toast.error('Erro ao buscar configuração do WhatsApp (marketing)')
      return null;
    }
  };

  // Buscar clientes para envio
  const getClientes = async (audience: string): Promise<Cliente[]> => {
    if (!currentCompany?.id) return [];

    try {
      let query = supabase
        
        
        
        .not('telefone', 'is', null)
        .neq('telefone', '')

      // Filtrar por tipo de público
      if (audience === 'clientes-ativos') {
        query = query
      }

       catch (error) { console.error('Error:', error) }const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar clientes:', error)
        toast.error('Erro ao buscar lista de clientes')
        return [];
      }

      return (data || []).map(cliente => ({
        ...cliente,
        id: Number(cliente.id) // Converter para número se necessário
      }))
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      return [];
    }
  };

  // Formatar número para E.164 simples (apenas dígitos com DDI), sem @c.us
  const formatPhoneForWhatsApp = (phone: string, country: string = 'BR'): string => {
    let cleanPhone = (phone || '').replace(/\D/g, '')
    if (country === 'BR' && !cleanPhone.startsWith('55')) {
      cleanPhone = '55' + cleanPhone;
    }
    return cleanPhone;
  };

  // Enviar mensagem individual via API
  const sendWhatsappMessage = async (
    integration: WhatsappIntegration,
    phoneNumber: string,
    message: string,;
    media?: { base64WithPrefix: string; mimeType: string; fileName: string; type: 'image' | 'video' | 'audio' | 'ptt' | 'document' }
  ): Promise<boolean> => {
    const toAddress = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;
    const makeTextRequest = async (): Promise<boolean> => {
      const url = `https://${integration.host}/rest/sendMessage/${integration.instance_key}/text`;
      const payload: any = {
        messageData: {
          to: toAddress,
          text: sanitizeLinks(message),
          linkPreview: false,
          preview_url: false
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${integration.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      let result: any = null;
      try { result = await response.json() } catch {}

      const hasApiError = !response.ok || (result && (result.error || result.status === 'error' || result.name === 'NOT_FOUND' || (typeof result.statusCode === 'number' && result.statusCode >= 400)))
      if (hasApiError) {
        console.error('Erro na API WhatsApp (texto):', response.status, result || (await response.text().catch(() => '')))
        return false;
      }

      console.log('Texto enviado com sucesso:', result || { status: response.status })
      return true;
    };

    try {
      if (media) {
        // Envio de mídia via endpoint /mediaBase64 conforme documentação
        const url = `https://${integration.host} catch (error) { console.error('Error:', error) }/rest/sendMessage/${integration.instance_key}/mediaBase64`;
        const payload: any = {
          messageData: {
            to: toAddress,
            base64: media.base64WithPrefix,
            fileName: media.fileName,
            type: media.type,
            caption: sanitizeLinks(message),
            mimeType: media.mimeType
          }
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${integration.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })

        let result: any = null;
        try { result = await response.json() } catch {}

        const hasApiError = !response.ok || (result && (result.error || result.status === 'error' || result.name === 'NOT_FOUND' || (typeof result.statusCode === 'number' && result.statusCode >= 400)))
        if (hasApiError) {
          console.warn('Falha no envio de mídia, tentando enviar apenas texto...', { httpStatus: response.status, result })
          return await makeTextRequest()
        }

        console.log('Mídia enviada com sucesso:', result || { status: response.status })
        return true;
      } else {
        // Envio de TEXTO usando o endpoint /text com messageData
        return await makeTextRequest()
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      return false;
    }
  };
  // Converter arquivo para base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string;
        // Remove o prefixo data:image/...;base64,
        const base64 = result.split(',')[1];
        resolve(base64)
      };
      reader.onerror = error => reject(error)
    })
  };

  const saveCampaign = async (campaignData: CampaignData, totalSent: number, totalFailed: number, media?: { base64WithPrefix: string; mimeType: string; fileName: string; type: 'image' | 'video' | 'audio' | 'ptt' | 'document' }) => {
    if (!currentCompany?.id) {
      console.error('Company ID not found')
      toast.error('ID da empresa não encontrado')
      return;
    }

    try {
      console.log('saveCampaign - dados recebidos:', { campaignData, totalSent, totalFailed, currentCompany: currentCompany.id } catch (error) { console.error('Error:', error) })
      
      const scheduledTs = campaignData.sendNow
        ? null
        : (campaignData.scheduledDate && campaignData.scheduledTime 
            ? new Date(`${campaignData.scheduledDate}T${campaignData.scheduledTime || '00:00'}:00`).toISOString()
            : null)

      console.log('scheduledTs calculado:', scheduledTs)

      const status = campaignData.sendNow ? 'sent' : (scheduledTs ? 'scheduled' : 'draft')
      console.log('Status da campanha será:', status)

      const insertPayload: any = {
        company_id: currentCompany.id,
        name: campaignData.name,
        message: campaignData.message,
        audience: campaignData.audience,
        country: campaignData.country || 'BR',
        total_recipients: totalSent + totalFailed,
        total_sent: totalSent,
        total_failed: totalFailed,
        scheduled_date: scheduledTs,
        status: status,
        recurrence_type: 'once',
        timezone: 'America/Sao_Paulo',
        is_active: true
      };

      if (media) {
        insertPayload.media_base64 = media.base64WithPrefix;
        insertPayload.media_mime_type = media.mimeType;
        insertPayload.media_file_name = media.fileName;
        insertPayload.media_type = media.type;
      }

      console.log('Payload para inserção:', insertPayload)

      const { data, error  } = null as any;
      if (error) {
        console.error('Erro do Supabase ao salvar campanha:', error)
        toast.error('Erro ao salvar campanha: ' + error.message)
      } else {
        console.log('Campanha salva com sucesso no Supabase:', data)
        toast.success(`Campanha "${campaignData.name}" salva como ${status}`)
      }
    } catch (error) {
      console.error('Erro geral ao salvar campanha:', error)
      toast.error('Erro interno ao salvar campanha')
    }
  };

  // Função principal para enviar campanha
  const sendCampaign = async (campaignData: CampaignData): Promise<{ success: boolean; totalSent: number; totalFailed: number }> => {
    setSending(true)
    setLoading(true)

    try {
      // 1. Verificar integração WhatsApp
      const integration = await getWhatsappIntegration()
      if (!integration) {
        return { success: false, totalSent: 0, totalFailed: 0 } catch (error) { console.error('Error:', error) };
      }

      // 2. Buscar clientes
      const clientes = await getClientes(campaignData.audience)
      if (clientes.length === 0) {
        toast.error('Nenhum cliente encontrado para envio')
        return { success: false, totalSent: 0, totalFailed: 0 };
      }

      // 3. Converter imagem para base64 se existir
      let imageBase64: string | undefined;
      if (campaignData.imageFile) {
        try {
          imageBase64 = await fileToBase64(campaignData.imageFile)
        } catch (error) {
          console.error('Erro ao converter imagem:', error)
          toast.error('Erro ao processar imagem')
          return { success: false, totalSent: 0, totalFailed: 0 };
        }
      }

      // 4. Enviar mensagens
      let totalSent = 0;
      let totalFailed = 0;

      toast.info(`Iniciando envio para ${clientes.length} clientes...`)

      for (const cliente of clientes) {
        try {
          const phoneFormatted = formatPhoneForWhatsApp(cliente.telefone, campaignData.country)
          
          const mediaPayload = (imageBase64 && campaignData.imageFile) ? {
            base64WithPrefix: `data:${campaignData.imageFile.type || 'image/jpeg'} catch (error) { console.error('Error:', error) };base64,${imageBase64}`,
            mimeType: campaignData.imageFile.type || 'image/jpeg',
            fileName: campaignData.imageFile.name || 'imagem.jpg',
            type: 'image' as const
          } : undefined;

          const success = await sendWhatsappMessage(
            integration,
            phoneFormatted,
            campaignData.message,
            mediaPayload;
          )

          if (success) {
            totalSent++;
          } else {
            totalFailed++;
          }

          // Delay entre envios para evitar spam (1 segundo)
          await new Promise(resolve => setTimeout(resolve, 1000))

        } catch (error) {
          console.error(`Erro ao enviar para ${cliente.nome}:`, error)
          totalFailed++;
        }
      }

      // 5. Salvar campanha no banco
      await saveCampaign(campaignData, totalSent, totalFailed, (imageBase64 && campaignData.imageFile) ? { base64WithPrefix: `data:${campaignData.imageFile.type || 'image/jpeg'};base64,${imageBase64}`, mimeType: campaignData.imageFile.type || 'image/jpeg', fileName: campaignData.imageFile.name || 'imagem.jpg', type: 'image' } : undefined)

      // 6. Mostrar resultado
      if (totalSent > 0) {
        toast.success(`Campanha enviada! ${totalSent} mensagens enviadas com sucesso.`)
      }
      
      if (totalFailed > 0) {
        toast.warning(`${totalFailed} mensagens falharam no envio.`)
      }

      return { success: totalSent > 0, totalSent, totalFailed };

    } catch (error) {
      console.error('Erro geral no envio da campanha:', error)
      toast.error('Erro inesperado ao enviar campanha')
      return { success: false, totalSent: 0, totalFailed: 0 };
    } finally {
      setSending(false)
      setLoading(false)
    }
  };

  // Enviar mensagem de teste
  const sendTestMessage = async (campaignData: CampaignData, testPhone: string): Promise<boolean> => {
    setLoading(true)

    try {
      const integration = await getWhatsappIntegration()
      if (!integration) return false;

      let imageBase64: string | undefined;
      if (campaignData.imageFile) {
        imageBase64 = await fileToBase64(campaignData.imageFile)
      }

       catch (error) { console.error('Error:', error) }const phoneFormatted = formatPhoneForWhatsApp(testPhone, campaignData.country)
      const mediaPayload = (imageBase64 && campaignData.imageFile) ? {
        base64WithPrefix: `data:${campaignData.imageFile.type || 'image/jpeg'};base64,${imageBase64}`,
        mimeType: campaignData.imageFile.type || 'image/jpeg',
        fileName: campaignData.imageFile.name || 'imagem.jpg',
        type: 'image' as const
      } : undefined;

      const success = await sendWhatsappMessage(
        integration,
        phoneFormatted,
        `[TESTE] ${campaignData.message}`,
        mediaPayload;
      )

      if (success) {
        toast.success('Mensagem de teste enviada com sucesso!')
      } else {
        toast.error('Falha ao enviar mensagem de teste')
      }

      return success;
    } catch (error) {
      console.error('Erro ao enviar teste:', error)
      toast.error('Erro ao enviar mensagem de teste')
      return false;
    } finally {
      setLoading(false)
    }
  };

  // Criar/agendar campanha sem enviar agora
  const scheduleCampaign = async (campaignData: CampaignData): Promise<boolean> => {
    console.log('scheduleCampaign chamado com:', campaignData)
    
    try {
      let imageBase64: string | undefined;
      if (campaignData.imageFile) {
        console.log('Convertendo imagem para base64...')
        imageBase64 = await fileToBase64(campaignData.imageFile)
      }
       catch (error) { console.error('Error:', error) }const mediaPayload = (imageBase64 && campaignData.imageFile) ? {
        base64WithPrefix: `data:${campaignData.imageFile.type || 'image/jpeg'};base64,${imageBase64}`,
        mimeType: campaignData.imageFile.type || 'image/jpeg',
        fileName: campaignData.imageFile.name || 'imagem.jpg',
        type: 'image' as const
      } : undefined;

      console.log('Salvando campanha...')
      await saveCampaign(campaignData, 0, 0, mediaPayload)
      console.log('Campanha salva com sucesso')
      return true;
    } catch (e) {
      console.error('Erro ao agendar campanha:', e)
      toast.error('Erro ao agendar campanha: ' + (e?.message || 'Erro desconhecido'))
      return false;
    }
  };

  return {
    loading,
    sending,
    sendCampaign,
    sendTestMessage,
    getClientes,
    scheduleCampaign
  };
};
