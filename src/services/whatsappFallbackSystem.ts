// SUPABASE REMOVIDO
export interface FallbackConfig {
  pollingInterval: number;
  maxRetries: number;
  backoffMultiplier: number;
  maxBackoffDelay: number;
  healthCheckInterval: number;
}

export interface FallbackState {
  isActive: boolean;
  mode: 'realtime' | 'polling' | 'hybrid';
  lastRealtimeMessage: Date | null;
  lastPollingMessage: Date | null;
  consecutiveFailures: number;
  healthScore: number; // 0-100
}

export interface MessageQueue {
  id: string;
  message: any;
  timestamp: Date;
  source: 'realtime' | 'polling';
  processed: boolean;
}

export class WhatsAppFallbackSystem {
  private config: FallbackConfig;
  private state: FallbackState;
  private messageQueue: MessageQueue[] = [];
  private pollingInterval: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private lastMessageIds = new Set<string>()
  private companyId: string | null = null;
  
  constructor(config?: Partial<FallbackConfig>) {
    this.config = {
      pollingInterval: 5000, // 5 segundos - menos agressivo
// maxRetries: 5,
      backoffMultiplier: 1.5,
      maxBackoffDelay: 30000, // 30 segundos máximo
      healthCheckInterval: 10000, // 10 segundos
      ...config
    };
    
    this.state = {
      isActive: false,
      mode: 'realtime',
      lastRealtimeMessage: null,
      lastPollingMessage: null,
      consecutiveFailures: 0,
      healthScore: 100
    };

  
  initialize(companyId: string): void {
    this.companyId = companyId;
    this.startHealthMonitoring()
    console.log('🔧 Sistema de fallback inicializado para company:', companyId)

  
  // Notificar que realtime recebeu uma mensagem
  notifyRealtimeMessage(message: any): void {
    this.state.lastRealtimeMessage = new Date()
    this.state.consecutiveFailures = 0;
    this.updateHealthScore(10) // Boost na saúde
    
    this.addToQueue({
      id: message.id || message.message_id,
      message,
      timestamp: new Date(),
      source: 'realtime',
      processed: false
    })
    
    // Se estava em polling, tentar voltar para realtime
    if (this.state.mode === 'polling') {
      console.log('✅ Realtime funcionando novamente, parando polling')
      this.switchToRealtime()


  
  // Notificar falha do realtime
  notifyRealtimeFailure(error?: string): void {
    this.state.consecutiveFailures++;
    this.updateHealthScore(-20) // Penalidade na saúde
    
    console.log(`❌ Falha realtime #${this.state.consecutiveFailures}:`, error)
    
    // Ativar polling se muitas falhas consecutivas
    if (this.state.consecutiveFailures >= 2 && this.state.mode === 'realtime') {
      console.log('🔄 Ativando fallback polling devido a falhas consecutivas')
      this.switchToPolling()


  
  // Alternar para modo realtime
  private switchToRealtime(): void {
    this.state.mode = 'realtime';
    this.stopPolling()
    console.log('✅ Modo: REALTIME ativo')

  
  // Alternar para modo polling
  private switchToPolling(): void {
    if (this.state.mode === 'polling') return; // Já está em polling
    
    this.state.mode = 'polling';
    this.state.isActive = true;
    this.startPolling()
    console.log('🔄 Modo: POLLING ativo (fallback)')

  
  // Iniciar polling
  private startPolling(): void {
    if (this.pollingInterval || !this.companyId) return;
    
    console.log(`🔄 Iniciando polling a cada ${this.config.pollingInterval}ms`)
    
    this.pollingInterval = setInterval(async () => {
      await this.pollForMessages()
    }, this.config.pollingInterval)

  
  // Parar polling
  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null;
      this.state.isActive = false;
      console.log('⏹️ Polling parado')


  
  // Buscar mensagens via polling
  private async pollForMessages(): Promise<void> {
    if (!this.companyId) return;
    
    try {
      const { data: messages, error }  catch (error) { console.error('Error:', error) }= 
        
        
        
        
        
      
      if (error) {
        throw new Error(error.message)
      }
      
      if (messages && messages.length > 0) {
        this.state.lastPollingMessage = new Date()
        
        // Processar apenas mensagens novas
        const newMessages = messages.filter(msg => {
          const msgId = msg.id || msg.message_id;
          return !this.lastMessageIds.has(msgId)
        })
        
        newMessages.forEach(message => {
          this.addToQueue({
            id: message.id || message.message_id,
            message,
            timestamp: new Date(),
            source: 'polling',
            processed: false
          })
          
          console.log('📨 Polling encontrou nova mensagem:', {
            id: message.message_id,
            content: message.message_content?.substring(0, 30)
          })
        })
        
        if (newMessages.length > 0) {
          this.updateHealthScore(5) // Pequeno boost por encontrar mensagens

      }
      
    } catch (error) {
      console.error('❌ Erro no polling:', error)
      this.updateHealthScore(-10)


  
  // Adicionar mensagem à queue
  private addToQueue(queueItem: Omit<MessageQueue, 'id'> & { id: string }): void {
    // Evitar duplicatas
    if (this.lastMessageIds.has(queueItem.id)) {
      return;

    
    this.messageQueue.push(queueItem)
    this.lastMessageIds.add(queueItem.id)
    
    // Limitar tamanho da queue
    if (this.messageQueue.length > 100) {
      const removed = this.messageQueue.splice(0, 50)
      removed.forEach(item => this.lastMessageIds

    
    // Limitar tamanho do Set de IDs
    if (this.lastMessageIds.size > 200) {
      const idsArray = Array;
      this.lastMessageIds.clear()
      idsArray.slice(-100).forEach(id => this.lastMessageIds.add(id))


  
  // Obter próxima mensagem da queue
  getNextMessage(): MessageQueue | null {
    const unprocessed = this.messageQueue.find(item => !item.processed)
    if (unprocessed) {
      unprocessed.processed = true;
      return unprocessed;

    return null;

  
  // Processar todas as mensagens pendentes
  processAllPendingMessages(callback: (message: any, source: string) => void): number {
    let processed = 0;
    let message: MessageQueue | null;
    
    while ((message = this.getNextMessage()) !== null) {
      callback(message.message, message.source)
      processed++;

    
    return processed;

  
  // Atualizar score de saúde
  private updateHealthScore(delta: number): void {
    this.state.healthScore = Math.max(0, Math.min(100, this.state.healthScore + delta))
    
    // Ajustar estratégia baseado na saúde
    if (this.state.healthScore < 30 && this.state.mode === 'realtime') {
      console.log('🚨 Saúde crítica, forçando fallback')
      this.switchToPolling()
    } else if (this.state.healthScore > 80 && this.state.mode === 'polling') {
      console.log('✅ Saúde boa, tentando voltar para realtime')
      this.attemptRealtimeRecovery()


  
  // Tentar recuperar realtime
  private attemptRealtimeRecovery(): void {
    // Implementar lógica de teste de realtime
    console.log('🔍 Testando recuperação do realtime...')
    
    // Por enquanto, apenas reduzir falhas consecutivas
    this.state.consecutiveFailures = Math.max(0, this.state.consecutiveFailures - 1)
    
    if (this.state.consecutiveFailures === 0) {
      this.switchToRealtime()


  
  // Monitoramento de saúde
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck()
    }, this.config.healthCheckInterval)

  
  private performHealthCheck(): void {
    const now = new Date()
    const realtimeAge = this.state.lastRealtimeMessage 
      ? now.getTime() - this.state.lastRealtimeMessage.getTime()
      : Infinity;
    
    const pollingAge = this.state.lastPollingMessage
      ? now.getTime() - this.state.lastPollingMessage.getTime()
      : Infinity;
    
    // Se não recebeu mensagens há muito tempo, reduzir saúde
    if (realtimeAge > 60000 && this.state.mode === 'realtime') { // 1 minuto
      this.updateHealthScore(-5)
      console.log('⚠️ Realtime sem atividade há mais de 1 minuto')

    
    if (pollingAge > 30000 && this.state.mode === 'polling') { // 30 segundos
      this.updateHealthScore(-3)
      console.log('⚠️ Polling sem atividade há mais de 30 segundos')

    
    // Log de status
    console.log('💊 Health Check:', {
      mode: this.state.mode,
      healthScore: this.state.healthScore,
      consecutiveFailures: this.state.consecutiveFailures,
      queueSize: this.messageQueue.length,
      realtimeAge: Math.round(realtimeAge / 1000) + 's',
      pollingAge: Math.round(pollingAge / 1000) + 's'
    })

  
  // Obter estado atual
  getState(): FallbackState & { queueSize: number; config: FallbackConfig } {
    return {
      ...this.state,
      queueSize: this.messageQueue.length,
      config: this.config
    };

  
  // Forçar modo específico
  forceMode(mode: 'realtime' | 'polling'): void {
    console.log(`🔧 Forçando modo: ${mode}`)
    
    if (mode === 'realtime') {
      this.switchToRealtime()
    } else {
      this.switchToPolling()

    
    // Reset de falhas ao forçar modo
    this.state.consecutiveFailures = 0;
    this.state.healthScore = 70; // Score neutro

  
  // Cleanup
  destroy(): void {
    this.stopPolling()
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null;

    
    this.messageQueue = [];
    this.lastMessageIds.clear()
    
    console.log('🧹 Sistema de fallback destruído')

}

// Instância singleton
export const whatsappFallback = new WhatsAppFallbackSystem()
