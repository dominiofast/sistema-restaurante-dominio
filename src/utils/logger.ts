/**
 * Logger utility para controlar logs em desenvolvimento vs produção
 * Similar ao que empresas como AnotaAí usam para esconder logs em produção
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isDebugEnabled = import.meta.env.VITE_DEBUG === 'true';

  /**
   * Log normal - removido em produção
   */
  log(...args: any[]) {
    if (this.isDevelopment) {
      console.log('[APP]', ...args);
    }
  }

  /**
   * Log de informação - removido em produção
   */
  info(...args: any[]) {
    if (this.isDevelopment) {
      console.info('[INFO]', ...args);
    }
  }

  /**
   * Log de debug - só aparece se VITE_DEBUG=true
   */
  debug(...args: any[]) {
    if (this.isDevelopment && this.isDebugEnabled) {
      console.debug('[DEBUG]', ...args);
    }
  }

  /**
   * Warning - aparece em desenvolvimento e produção
   */
  warn(...args: any[]) {
    console.warn('[WARN]', ...args);
  }

  /**
   * Error - sempre aparece (importante para monitoramento)
   */
  error(...args: any[]) {
    console.error('[ERROR]', ...args);
  }

  /**
   * Log de performance - só em desenvolvimento
   */
  perf(label: string, fn: () => void) {
    if (this.isDevelopment) {
      console.time(`[PERF] ${label}`);
      fn();
      console.timeEnd(`[PERF] ${label}`);
    } else {
      fn();
    }
  }

  /**
   * Log de API calls - útil para debug
   */
  api(method: string, url: string, data?: any) {
    if (this.isDevelopment) {
      console.group(`[API] ${method.toUpperCase()} ${url}`);
      if (data) console.log('Data:', data);
      console.groupEnd();
    }
  }

  /**
   * Log de estado do componente - só em desenvolvimento
   */
  state(componentName: string, state: any) {
    if (this.isDevelopment && this.isDebugEnabled) {
      console.log(`[STATE] ${componentName}:`, state);
    }
  }
}

// Instância singleton
export const logger = new Logger();

// Exports individuais para facilitar uso
export const { log, info, debug, warn, error, perf, api, state } = logger;

// Helper para logs condicionais baseados em ambiente
export const devOnly = (fn: () => void) => {
  if (import.meta.env.DEV) {
    fn();
  }
};

export const prodOnly = (fn: () => void) => {
  if (!import.meta.env.DEV) {
    fn();
  }
};
