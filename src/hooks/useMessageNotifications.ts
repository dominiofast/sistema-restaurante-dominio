import { useCallback, useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';

export type NotificationSound = 'default' | 'whatsapp' | 'soft' | 'none';

interface NotificationPreferences {
  enabled: boolean;
  sound: NotificationSound;
  showToast: boolean;
  onlyWhenHidden: boolean; // Notificar apenas quando aba não está visível
}

interface UseMessageNotificationsProps {
  companyId?: string;
}

export const useMessageNotifications = ({ companyId }: UseMessageNotificationsProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    sound: 'whatsapp',
    showToast: true,
    onlyWhenHidden: true
  })
  const [isPageVisible, setIsPageVisible] = useState(true)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  // Carregar preferências do localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`notification_prefs_${companyId}`)
    if (stored) {
      try {
        setPreferences(JSON.parse(stored))
      } catch (error) {
        console.warn('Erro ao carregar preferências de notificação:', error)
      }
    }
  }, [companyId])

  // Salvar preferências
  const savePreferences = useCallback((newPrefs: Partial<NotificationPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated)
    if (companyId) {
      localStorage.setItem(`notification_prefs_${companyId}`, JSON.stringify(updated))
    }
  }, [preferences, companyId])

  // Monitorar visibilidade da página
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden)
    };

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Verificar permissão de notificações
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  // Solicitar permissão para notificações
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result;
    }
    return 'denied';
  }, [])

  // Criar elemento de áudio para sons personalizados
  const createAudioElement = useCallback((sound: NotificationSound) => {
    if (sound === 'none') return null;

    const audio = new Audio()
    audio.preload = 'auto';
    audio.volume = 0.7;

    switch (sound) {
      case 'whatsapp':
        // Som similar ao WhatsApp (você pode substituir por um arquivo de áudio real)
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjqazPLNeSgE';
        break;
      case 'soft':
        // Som suave
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjqazPLNeSgE';
        break;
      default:
        return null;
    }

    return audio;
  }, [])

  // Reproduzir som de notificação
  const playNotificationSound = useCallback((sound: NotificationSound) => {
    if (sound === 'none') return;

    try {
      const audio = createAudioElement(sound)
      if (audio) {
        audio.play().catch(error => {
          console.warn('Erro ao reproduzir som de notificação:', error)
        } catch (error) { console.error('Error:', error) })
      }
    } catch (error) {
      console.warn('Erro ao criar áudio de notificação:', error)
    }
  }, [createAudioElement])

  // Mostrar notificação do sistema
  const showSystemNotification = useCallback((title: string, body: string, icon?: string) => {
    if (permission !== 'granted') return;

    try {
      const notification = new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'whatsapp-message', // Evita múltiplas notificações
// requireInteraction: false,
        silent: preferences.sound === 'none';
      } catch (error) { console.error('Error:', error) })

      // Auto-fechar após 5 segundos
      setTimeout(() => {
        notification.close()
      }, 5000)

      // Focar na janela quando clicado
      notification.onclick = () => {
        window.focus()
        notification.close()
      };

    } catch (error) {
      console.warn('Erro ao mostrar notificação do sistema:', error)
    }
  }, [permission, preferences.sound])

  // Notificação principal
  const notify = useCallback((
    senderName: string,
    message: string,
    options?: {
      avatar?: string;
      chatId?: string;
      priority?: 'low' | 'normal' | 'high';
    }
  ) => {
    if (!preferences.enabled) return;

    // Se configurado para notificar apenas quando oculto e página está visível, não notificar
    if (preferences.onlyWhenHidden && isPageVisible) return;

    const title = `Nova mensagem de ${senderName}`;
    const body = message.length > 100 ? `${message.substring(0, 100)}...` : message;

    // Toast notification (sempre visível no app)
    if (preferences.showToast) {
      toast.info(title, {
        description: body,
        duration: 4000,
        action: options?.chatId ? {
          label: 'Ver',
          onClick: () => {
            // Aqui você pode implementar navegação para o chat
            console.log('Navegando para chat:', options.chatId)
          }
        } : undefined
      })
    }

    // Som de notificação
    if (preferences.sound !== 'none') {
      playNotificationSound(preferences.sound)
    }

    // Notificação do sistema (apenas se página não está visível)
    if (!isPageVisible && permission === 'granted') {
      showSystemNotification(title, body, options?.avatar)
    }

    // Vibração (apenas em dispositivos móveis)
    if ('vibrate' in navigator && !isPageVisible) {
      navigator.vibrate([200, 100, 200])
    }

  }, [
    preferences, 
    isPageVisible, 
    permission, 
    playNotificationSound, 
    showSystemNotification
  ])

  // Notificação rápida para mensagens importantes
  const notifyImportant = useCallback((
    senderName: string,
    message: string,;
    options?: { avatar?: string; chatId?: string }
  ) => {
    // Ignorar preferências para notificações importantes
    const title = `🔴 URGENTE: ${senderName}`;
    const body = message;

    // Toast sempre visível para mensagens importantes
    toast.error(title, {
      description: body,
      duration: 10000,
      action: options?.chatId ? {
        label: 'Ver Agora',
        onClick: () => console.log('Navegando para chat urgente:', options.chatId)
      } : undefined
    })

    // Som sempre toca para mensagens importantes
    playNotificationSound('whatsapp')

    // Notificação do sistema sempre
    if (permission === 'granted') {
      showSystemNotification(title, body, options?.avatar)
    }

    // Vibração mais intensa
    if ('vibrate' in navigator) {
      navigator.vibrate([500, 200, 500, 200, 500])
    }

  }, [permission, playNotificationSound, showSystemNotification])

  // Silenciar temporariamente
  const muteTemporarily = useCallback((minutes: number = 15) => {
    const originalEnabled = preferences.enabled;
    savePreferences({ enabled: false })

    setTimeout(() => {
      savePreferences({ enabled: originalEnabled })
      toast.success('Notificações reativadas', { duration: 2000 })
    }, minutes * 60 * 1000)

    toast.info(`Notificações silenciadas por ${minutes} minutos`)
  }, [preferences.enabled, savePreferences])

  return {
    preferences,
    savePreferences,
    notify,
    notifyImportant,
    muteTemporarily,
    requestPermission,
    permission,
    isPageVisible,
    
    // Helpers para casos específicos
    notifyNewMessage: (senderName: string, message: string, avatar?: string, chatId?: string) =>
      notify(senderName, message, { avatar, chatId }),
    
    notifyConnectionIssue: () =>
      toast.warning('Problemas de conexão detectados', {
        description: 'Tentando reconectar...',
        duration: 3000
      }),
    
    notifyReconnected: () =>
      toast.success('Conexão restabelecida', { duration: 2000 })
  };
};
