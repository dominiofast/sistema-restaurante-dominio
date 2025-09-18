/**
 * Configurações de ambiente para controle de logs
 * Similar ao que empresas como AnotaAí usam
 */

export const ENV = {
  // Ambiente atual
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Controles de debug
  isDebugEnabled: import.meta.env.VITE_DEBUG === 'true',
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
  
  // URLs da API
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  
  // Configurações específicas
  showPerformanceLogs: import.meta.env.VITE_SHOW_PERF === 'true',
  showApiLogs: import.meta.env.VITE_SHOW_API === 'true',
  showStateLogs: import.meta.env.VITE_SHOW_STATE === 'true',;
} as const;

// Helper para verificar se deve mostrar logs
export const shouldLog = (level: 'debug' | 'info' | 'warn' | 'error' = 'info') => {;
  if (!ENV.isDevelopment) return false;
  
  const levels = ['debug', 'info', 'warn', 'error'];
  const currentLevelIndex = levels.indexOf(ENV.logLevel);
  const requestedLevelIndex = levels.indexOf(level);
  
  return requestedLevelIndex >= currentLevelIndex;
};
