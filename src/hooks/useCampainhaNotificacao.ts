
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Pedido } from '@/types/pedidos';

export const useCampainhaNotificacao = (pedidos: Pedido[]) => {
  const [campainhaAtiva, setCampainhaAtiva] = useState(false)
  const bellAudioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isPlayingRef = useRef(false)
  const lastCountRef = useRef(0)

  // Memoizar a contagem de pedidos em análise com estabilização
  const pedidosAnaliseCount = useMemo(() => {
    const count = pedidos.filter(p => 
      p.status === 'analise' && (p.origem === 'public' || p.origem === undefined)
    ).length;
    
    // Só atualiza se a contagem realmente mudou
    if (count !== lastCountRef.current) {
      lastCountRef.current = count;
      return count;
    }
    return lastCountRef.current;
  }, [pedidos])

  // Função para parar a campainha
  const pararCampainha = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null;
    }
    if (bellAudioRef.current) {
      bellAudioRef.current.pause()
      bellAudioRef.current.currentTime = 0;
    }
    isPlayingRef.current = false;
  }, [])

  // Função para tocar a campainha
  const tocarCampainha = useCallback(() => {
    if (!bellAudioRef.current || isPlayingRef.current) return;

    const audio = bellAudioRef.current;
    audio.volume = 0.3;
    
    const playAudio = () => {
      audio.play().then(() => {
        console.log('Campainha: Áudio tocando')
      }).catch((error) => {
        console.warn('Campainha: Erro ao tocar áudio:', error)
      })
    };

    // Tocar imediatamente
    playAudio()
    isPlayingRef.current = true;

    // Repetir a cada 5 segundos
    intervalRef.current = setInterval(() => {
      if (pedidosAnaliseCount > 0) {
        playAudio()
      } else {
        pararCampainha()
      }
    }, 5000)
  }, [pedidosAnaliseCount])

  // Efeito principal para controlar a campainha - executado apenas quando a contagem muda
  useEffect(() => {
    const novoCampainhaAtiva = pedidosAnaliseCount > 0;
    
    // Só atualizar se houver mudança real e significativa
    if (novoCampainhaAtiva !== campainhaAtiva) {
      console.log('Campainha: Mudança detectada:', {
        contagem: pedidosAnaliseCount,
        ativa: novoCampainhaAtiva
      })
      
      setCampainhaAtiva(novoCampainhaAtiva)
      
      if (novoCampainhaAtiva) {
        tocarCampainha()
      } else {
        pararCampainha()
      }
    }
  }, [pedidosAnaliseCount]) // Depende apenas da contagem

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      pararCampainha()
    };
  }, [pararCampainha])

  return { 
    bellAudioRef, 
    campainhaAtiva: pedidosAnaliseCount > 0 // Retorna o estado baseado diretamente na contagem
  };
};
