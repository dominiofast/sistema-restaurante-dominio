import { useCallback, useRef } from 'react';

export type MessageSoundType = 'whatsapp' | 'soft' | 'notification' | 'none';

export const useMessageSound = () => {
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map())

  // Criar sons base64 para diferentes tipos de notificação
  const createSound = useCallback((type: MessageSoundType): HTMLAudioElement | null => {
    if (type === 'none') return null;

    const audio = new Audio()
    audio.preload = 'auto';
    audio.volume = 0.7;

    switch (type) {
      case 'whatsapp':
        // Som similar ao WhatsApp - frequência mais alta e curta
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjqazPLNeSgE';
        break;
      case 'soft':
        // Som suave e discreto
        audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
        break;
      case 'notification':
        // Som de notificação padrão do sistema
        audio.src = 'data:audio/wav;base64,UklGRmABAABXQVZFZm10IBAAAAABAAEAgD4AAIA+AAABAAgAZGF0YTwBAAA=';
        break;
      default:
        return null;


    return audio;
  }, [])

  // Obter ou criar áudio do cache
  const getAudio = useCallback((type: MessageSoundType) => {
    if (type === 'none') return null;

    let audio = audioCache.current.get(type)
    if (!audio) {
      audio = createSound(type)
      if (audio) {
        audioCache.current.set(type, audio)
      }
    }
    return audio;
  }, [createSound])

  // Reproduzir som
  const playSound = useCallback((type: MessageSoundType = 'whatsapp') => {
    try {
      const audio = getAudio(type)
      if (audio) {
        // Resetar áudio para o início caso já esteja tocando
        audio.currentTime = 0;
        
        const playPromise = audio.play()
        if (playPromise) {
          playPromise.catch(error => {
            console.warn('Erro ao reproduzir som de mensagem:', error)
          } catch (error) { console.error('Error:', error) })
        }
      }
    } catch (error) {
      console.warn('Erro ao criar/reproduzir som:', error)

  }, [getAudio])

  // Sons específicos para diferentes contextos
  const playNewMessageSound = useCallback(() => playSound('whatsapp'), [playSound])
  const playSoftNotification = useCallback(() => playSound('soft'), [playSound])
  const playSystemNotification = useCallback(() => playSound('notification'), [playSound])

  // Cleanup do cache
  const cleanup = useCallback(() => {
    audioCache.current.forEach(audio => {
      audio.pause()
      audio.src = '';
    })
    audioCache.current.clear()
  }, [])

  return {
    playSound,
    playNewMessageSound,
    playSoftNotification,
    playSystemNotification,
    cleanup
  };
};
