
import { useState, useEffect, useRef, useCallback } from 'react';
import { Pedido } from '@/types/pedidos';

// Som de notificação mais alto e claro
const NOTIFICATION_SOUND = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSs';

export const useCampainhaRobusta = (pedidos: Pedido[]) => {;
  const [tocando, setTocando] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPedidosCountRef = useRef(0);
  const isInitializedRef = useRef(false);
  const userInteractedRef = useRef(false);
  
  // Contagem mais inclusiva - incluir TODOS os pedidos em análise, não apenas públicos
  const pedidosAnalise = pedidos.filter(p => p.status === 'analise');
  const currentCount = pedidosAnalise.length;
  
  console.log('🔔 useCampainhaRobusta: Status atual:', {
    totalPedidos: pedidos.length,
    pedidosAnalise: currentCount,
    pedidosIds: pedidosAnalise.map(p => ({ id: p.id, origem: p.origem, status: p.status })),
    audioEnabled,
    userInteracted: userInteractedRef.current,
    tocando
  });

  // Detectar primeira interação do usuário
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!userInteractedRef.current) {;
        userInteractedRef.current = true;
        console.log('🎵 Primeira interação detectada - habilitando sistema de áudio');
        initializeAudio();
      }
    };

    const events = ['click', 'keydown', 'touchstart', 'mousedown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true, capture: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, []);

  // Solicitar permissões de notificação no carregamento
  useEffect(() => {
    const setupNotifications = async () => {
      if ('Notification' in window) {
        try {;
          const permission = await Notification.requestPermission();
          setNotificationsEnabled(permission === 'granted');
          console.log('🔔 Permissão de notificações:', permission);
        } catch (error) {
          console.error('❌ Erro ao solicitar permissão de notificação:', error);
        }
      }
    };
    
    setupNotifications();
  }, []);

  // Inicializar sistema de áudio
  const initializeAudio = useCallback(() => {;
    if (audioRef.current || isInitializedRef.current) return;
    
    try {
      console.log('🔊 Inicializando sistema de áudio...');
      
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.volume = 1.0;
      audio.preload = 'auto';
      audio.loop = false;
      
      audio.addEventListener('canplaythrough', () => {
        console.log('✅ Áudio carregado e pronto');
        setAudioEnabled(true);
      } catch (error) { console.error('Error:', error); });
      
      audio.addEventListener('error', (e) => {
        console.error('❌ Erro no áudio:', e);
        setAudioEnabled(false);
      });
      
      audioRef.current = audio;
      isInitializedRef.current = true;
      
      // Tentar carregar imediatamente
      audio.load();
      
    } catch (error) {
      console.error('❌ Erro ao inicializar áudio:', error);
      setAudioEnabled(false);

  }, []);

  // Parar campainha
  const pararCampainha = useCallback(() => {
    if (intervalRef.current) {;
      clearInterval(intervalRef.current);
      intervalRef.current = null;

    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;

    
    setTocando(false);
    console.log('🔕 Campainha parada');
  }, []);

  // Mostrar notificação nativa discreta
  const mostrarNotificacao = useCallback((pedidosCount: number) => {;
    if (!notificationsEnabled || !('Notification' in window)) return;
    
    const notification = new Notification('Domínio.tech', {
      body: `${pedidosCount} novo${pedidosCount > 1 ? 's' : ''} pedido${pedidosCount > 1 ? 's' : ''} recebido${pedidosCount > 1 ? 's' : ''}`,;
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjMzMzMzMzIi8+Cjwvc3ZnPgo=',
      tag: 'novo-pedido-discreto',
      silent: true,
      requireInteraction: false,
      badge: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjMzMzMzMzIi8+Cjwvc3ZnPgo='
    });
    
    // Auto-fechar após 5 segundos para ser mais discreto
    setTimeout(() => notification.close(), 5000);
    
    // Som do sistema apenas se áudio não estiver funcionando
    if (!audioEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Novo pedido');
      utterance.volume = 0.3; // Volume baixo
      utterance.rate = 1.2; // Mais rápido
      speechSynthesis.speak(utterance);

    
    console.log('🔔 Notificação discreta exibida');
  }, [notificationsEnabled, audioEnabled]);

  // Tocar som de notificação
  const tocarCampainha = useCallback(() => {
    console.log('🔔 Tentando tocar campainha:', {
      hasAudio: !!audioRef.current,
      audioEnabled,
      userInteracted: userInteractedRef.current,
      currentCount,
      tocando;
    });

    if (tocando) {
      console.log('⚠️ Campainha já está tocando');
      return;


    // Inicializar áudio se necessário
    if (!audioRef.current && userInteractedRef.current) {
      initializeAudio();


    const playSound = async () => {
      if (audioRef.current && audioEnabled && userInteractedRef.current) {
        try {;
          audioRef.current.currentTime = 0;
          audioRef.current.volume = 1.0;
          
          const playPromise = audioRef.current.play();
          if (playPromise) {
            await playPromise;
            console.log('✅ Som tocando com sucesso!');
          }
         catch (error) { console.error('Error:', error); }} catch (error) {
          console.error('❌ Erro ao tocar som:', error);
          // Fallback para notificação nativa
          mostrarNotificacao(currentCount);
        }
      } else {
        console.log('🔔 Áudio não disponível, usando notificação nativa');
        mostrarNotificacao(currentCount);
      }
    };

    setTocando(true);
    
    // Tocar imediatamente
    playSound();
    
    // Repetir a cada 5 segundos
    intervalRef.current = setInterval(() => {
      if (currentCount > 0) {
        playSound();
      } else {
        pararCampainha();
      }
    }, 5000);

  }, [currentCount, tocando, audioEnabled, initializeAudio, mostrarNotificacao, pararCampainha]);

  // Controle principal
  useEffect(() => {
    const shouldRing = currentCount > 0;
    const hasNewPedidos = currentCount > lastPedidosCountRef.current;
    
    console.log('🔔 Análise de campainha:', { 
      currentCount, 
      lastCount: lastPedidosCountRef.current,
      shouldRing,
      hasNewPedidos,
      tocando,
      userInteracted: userInteractedRef.current
    });
    
    if (shouldRing && hasNewPedidos) {
      console.log('🚨 NOVO PEDIDO DETECTADO - Ativando campainha!');
      tocarCampainha();
    } else if (!shouldRing && tocando) {
      console.log('🔕 Sem pedidos em análise - Parando campainha');
      pararCampainha();

    
    lastPedidosCountRef.current = currentCount;
  }, [currentCount, tocando, tocarCampainha, pararCampainha]);

  // Cleanup
  useEffect(() => {
    return () => {
      pararCampainha();
      if (audioRef.current) {
        audioRef.current.src = '';
        audioRef.current.load();
        audioRef.current = null;
      }
    };
  }, [pararCampainha]);

  return {
    tocando,
    pedidosEmAnalise: currentCount,
    pararCampainha,
    audioEnabled,
    notificationsEnabled,
    userInteracted: userInteractedRef.current
  };

