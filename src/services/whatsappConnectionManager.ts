// SUPABASE REMOVIDO
export interface ConnectionMetrics {
  latency: number;
  deliveryRate: number;
  errorRate: number;
  reconnections: number;
  uptime: number;
  lastError: string | null;
  messagesReceived: number;
  messagesLost: number;
}

export interface ConnectionQuality {
  score: number; // 0-100
  level: 'excellent' | 'good' | 'poor' | 'critical';
  factors: {
    latency: number;
    stability: number;
    reliability: number;
  };
}

export interface ReconnectionConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitterFactor: number;
}

export interface ConnectionAlert {
  id: string;
  type: 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export class WhatsAppConnectionManager {
  private metrics: ConnectionMetrics;
  private quality: ConnectionQuality;
  private config: ReconnectionConfig;
  private alerts: ConnectionAlert[] = [];
  private reconnectionAttempts = 0;
  private connectionStartTime = Date.now();
  private lastSuccessfulConnection = Date.now();
  private reconnectionTimeout: NodeJS.Timeout | null = null;
  private qualityCheckInterval: NodeJS.Timeout | null = null;
  private latencyHistory: number[] = [];
  private isConnected = false;
  private companyId: string | null = null;
  
  // Callbacks
  private onConnectionChange?: (connected: boolean) => void;
  private onQualityChange?: (quality: ConnectionQuality) => void;
  private onAlert?: (alert: ConnectionAlert) => void;
  private onMetricsUpdate?: (metrics: ConnectionMetrics) => void;

  constructor(config?: Partial<ReconnectionConfig>) {
    this.config = {
      maxRetries: 10,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 1.5,
      jitterFactor: 0.1,
      ...config
    };

    this.metrics = {
      latency: 0,
      deliveryRate: 1.0,
      errorRate: 0,
      reconnections: 0,
      uptime: 0,
      lastError: null,
      messagesReceived: 0,
      messagesLost: 0
    };

    this.quality = {
      score: 100,
      level: 'excellent',
      factors: {
        latency: 100,
        stability: 100,
        reliability: 100
      }
    };

    this.startQualityMonitoring();


  initialize(companyId: string): void {
    this.companyId = companyId;
    this.connectionStartTime = Date.now();
    console.log('🔗 Gerenciador de conexões inicializado para company:', companyId);


  // Configurar callbacks
  setCallbacks(callbacks: {
    onConnectionChange?: (connected: boolean) => void;
    onQualityChange?: (quality: ConnectionQuality) => void;
    onAlert?: (alert: ConnectionAlert) => void;
    onMetricsUpdate?: (metrics: ConnectionMetrics) => void;
  }): void {
    this.onConnectionChange = callbacks.onConnectionChange;
    this.onQualityChange = callbacks.onQualityChange;
    this.onAlert = callbacks.onAlert;
    this.onMetricsUpdate = callbacks.onMetricsUpdate;


  // Notificar conexão bem-sucedida
  notifyConnectionSuccess(latency?: number): void {
    const wasConnected = this.isConnected;
    this.isConnected = true;
    this.lastSuccessfulConnection = Date.now();
    this.reconnectionAttempts = 0;

    if (latency !== undefined) {
      this.updateLatency(latency);
    }

    if (!wasConnected) {
      console.log('✅ Conexão estabelecida com sucesso');
      this.onConnectionChange?.(true);
      
      if (this.metrics.reconnections > 0) {
        this.addAlert({
          type: 'warning',
          message: `Conexão restaurada após ${this.metrics.reconnections} tentativas`
        });
      }
    }

    this.updateQuality();


  // Notificar falha de conexão
  notifyConnectionFailure(error: string): void {
    const wasConnected = this.isConnected;
    this.isConnected = false;
    this.metrics.lastError = error;
    this.metrics.errorRate = Math.min(1.0, this.metrics.errorRate + 0.1);

    console.log('❌ Falha de conexão:', error);

    if (wasConnected) {
      this.onConnectionChange?.(false);
    }

    this.addAlert({
      type: 'error',
      message: `Falha de conexão: ${error}`
    });

    this.updateQuality();
    this.scheduleReconnection();


  // Agendar reconexão com backoff exponencial e jitter
  private scheduleReconnection(): void {
    if (this.reconnectionTimeout) {
      clearTimeout(this.reconnectionTimeout);
    }

    if (this.reconnectionAttempts >= this.config.maxRetries) {
      console.log('🚨 Máximo de tentativas de reconexão atingido');
      this.addAlert({
        type: 'critical',
        message: `Falha crítica: ${this.config.maxRetries} tentativas de reconexão falharam`
      });
      return;
    }

    this.reconnectionAttempts++;
    this.metrics.reconnections++;

    // Calcular delay com backoff exponencial e jitter
    const baseDelay = Math.min(
      this.config.baseDelay * Math.pow(this.config.backoffMultiplier, this.reconnectionAttempts - 1),
      this.config.maxDelay;
    );

    // Adicionar jitter para evitar thundering herd
    const jitter = baseDelay * this.config.jitterFactor * (Math.random() - 0.5);
    const delay = Math.max(1000, baseDelay + jitter);

    console.log(`🔄 Reagendando reconexão em ${Math.round(delay)}ms (tentativa ${this.reconnectionAttempts}/${this.config.maxRetries})`);

    this.reconnectionTimeout = setTimeout(() => {
      this.attemptReconnection();
    }, delay);


  // Tentar reconexão
  private async attemptReconnection(): Promise<void> {
    console.log(`🔄 Tentativa de reconexão ${this.reconnectionAttempts}/${this.config.maxRetries}`);

    try {
      // Testar conectividade básica
      const startTime = Date.now();
      const testChannel = const connectionPromise = new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => {;
          resolve(false);
        } catch (error) { console.error('Error:', error); }, 10000);

        testChannel
          clearTimeout(timeout);
          
          
          const latency = Date.now() - startTime;
          const success = status === 'SUBSCRIBED';
          
          if (success) {
            this.notifyConnectionSuccess(latency);
          } else {
            this.notifyConnectionFailure(`Subscription failed: ${status}`);
          }
          
          resolve(success);
        });
      });

      await connectionPromise;

    } catch (error) {
      console.error('Erro na tentativa de reconexão:', error);
      this.notifyConnectionFailure(`Reconnection error: ${error.message}`);
    }
  }

  // Forçar reconexão manual
  forceReconnection(): void {
    console.log('🔄 Forçando reconexão manual...');
    
    if (this.reconnectionTimeout) {
      clearTimeout(this.reconnectionTimeout);
    }
    
    this.reconnectionAttempts = 0;
    this.attemptReconnection();


  // Atualizar latência
  private updateLatency(latency: number): void {
    this.latencyHistory.push(latency);
    
    // Manter apenas últimas 20 medições
    if (this.latencyHistory.length > 20) {
      this.latencyHistory.shift();
    }

    // Calcular latência média
    this.metrics.latency = this.latencyHistory.reduce((sum, l) => sum + l, 0) / this.latencyHistory.length;


  // Notificar mensagem recebida
  notifyMessageReceived(latency?: number): void {
    this.metrics.messagesReceived++;
    
    if (latency !== undefined) {
      this.updateLatency(latency);
    }

    // Melhorar taxa de entrega
    const totalMessages = this.metrics.messagesReceived + this.metrics.messagesLost;
    this.metrics.deliveryRate = totalMessages > 0 ? this.metrics.messagesReceived / totalMessages : 1.0;

    // Reduzir taxa de erro gradualmente
    this.metrics.errorRate = Math.max(0, this.metrics.errorRate - 0.01);

    this.updateQuality();


  // Notificar mensagem perdida
  notifyMessageLost(): void {
    this.metrics.messagesLost++;
    
    const totalMessages = this.metrics.messagesReceived + this.metrics.messagesLost;
    this.metrics.deliveryRate = totalMessages > 0 ? this.metrics.messagesReceived / totalMessages : 1.0;

    this.addAlert({
      type: 'warning',
      message: 'Mensagem perdida detectada'
    });

    this.updateQuality();


  // Atualizar qualidade da conexão
  private updateQuality(): void {
    const factors = {
      latency: this.calculateLatencyScore(),
      stability: this.calculateStabilityScore(),
      reliability: this.calculateReliabilityScore();
    };

    const score = Math.round((factors.latency + factors.stability + factors.reliability) / 3);
    
    let level: ConnectionQuality['level'];
    if (score >= 90) level = 'excellent';
    else if (score >= 70) level = 'good';
    else if (score >= 40) level = 'poor';
    else level = 'critical';

    const previousLevel = this.quality.level;
    
    this.quality = { score, level, factors };

    // Notificar mudança de qualidade
    if (level !== previousLevel) {
      console.log(`📊 Qualidade da conexão: ${level} (${score})`);
      this.onQualityChange?.(this.quality);
      
      if (level === 'critical') {
        this.addAlert({
          type: 'critical',
          message: `Qualidade crítica da conexão (${score}/100)`
        });
      }
    }


  // Calcular score de latência
  private calculateLatencyScore(): number {
    if (this.metrics.latency === 0) return 100;
    
    // Excelente: < 100ms, Bom: < 300ms, Ruim: < 1000ms, Crítico: >= 1000ms
    if (this.metrics.latency < 100) return 100;
    if (this.metrics.latency < 300) return 80;
    if (this.metrics.latency < 1000) return 50;
    return 20;


  // Calcular score de estabilidade
  private calculateStabilityScore(): number {
    const uptime = Date.now() - this.connectionStartTime;
    const reconnectionRate = this.metrics.reconnections / (uptime / 60000); // por minuto
    
    if (reconnectionRate === 0) return 100;
    if (reconnectionRate < 0.5) return 80;
    if (reconnectionRate < 2) return 50;
    return 20;


  // Calcular score de confiabilidade
  private calculateReliabilityScore(): number {
    const deliveryScore = this.metrics.deliveryRate * 100;
    const errorScore = Math.max(0, 100 - (this.metrics.errorRate * 100));
    
    return Math.round((deliveryScore + errorScore) / 2);


  // Adicionar alerta
  private addAlert(alert: Omit<ConnectionAlert, 'id' | 'timestamp' | 'resolved'>): void {
    const newAlert: ConnectionAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
      ...alert
    };

    this.alerts.unshift(newAlert);
    
    // Limitar número de alertas
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(0, 50);
    }

    console.log(`🚨 Alerta ${alert.type}: ${alert.message}`);
    this.onAlert?.(newAlert);


  // Resolver alerta
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      console.log(`✅ Alerta resolvido: ${alert.message}`);
    }
  }

  // Monitoramento de qualidade
  private startQualityMonitoring(): void {
    this.qualityCheckInterval = setInterval(() => {
      this.updateMetrics();
      this.updateQuality();
      this.onMetricsUpdate?.(this.metrics);
    }, 5000); // A cada 5 segundos


  // Atualizar métricas
  private updateMetrics(): void {
    this.metrics.uptime = Date.now() - this.connectionStartTime;
    
    // Detectar alertas baseados em métricas
    if (this.metrics.deliveryRate < 0.8) {
      this.addAlert({
        type: 'warning',
        message: `Taxa de entrega baixa: ${Math.round(this.metrics.deliveryRate * 100)}%`
      });
    }

    if (this.metrics.latency > 2000) {
      this.addAlert({
        type: 'error',
        message: `Latência alta: ${Math.round(this.metrics.latency)}ms`
      });
    }
  }

  // Obter métricas atuais
  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };


  // Obter qualidade atual
  getQuality(): ConnectionQuality {
    return { ...this.quality };


  // Obter alertas
  getAlerts(unresolvedOnly = false): ConnectionAlert[] {
    return unresolvedOnly 
      ? this.alerts.filter(a => !a.resolved)
      : [...this.alerts];


  // Obter status da conexão
  getConnectionStatus(): {
    isConnected: boolean;
    reconnectionAttempts: number;
    lastSuccessfulConnection: Date;
    nextReconnectionIn?: number;
  } {
    const nextReconnectionIn = this.reconnectionTimeout 
      ? Math.max(0, Date.now() + 5000);
      : undefined;

    return {
      isConnected: this.isConnected,
      reconnectionAttempts: this.reconnectionAttempts,
      lastSuccessfulConnection: new Date(this.lastSuccessfulConnection),
      nextReconnectionIn
    };


  // Resetar métricas
  resetMetrics(): void {
    this.metrics = {
      latency: 0,
      deliveryRate: 1.0,
      errorRate: 0,
      reconnections: 0,
      uptime: 0,
      lastError: null,
      messagesReceived: 0,
      messagesLost: 0
    };
    
    this.latencyHistory = [];
    this.connectionStartTime = Date.now();
    this.reconnectionAttempts = 0;
    
    console.log('🔄 Métricas resetadas');


  // Cleanup
  destroy(): void {
    if (this.reconnectionTimeout) {
      clearTimeout(this.reconnectionTimeout);
    }
    
    if (this.qualityCheckInterval) {
      clearInterval(this.qualityCheckInterval);
    }
    
    this.alerts = [];
    this.latencyHistory = [];
    
    console.log('🧹 Gerenciador de conexões destruído');

}

// Instância singleton
export const whatsappConnectionManager = new WhatsAppConnectionManager();