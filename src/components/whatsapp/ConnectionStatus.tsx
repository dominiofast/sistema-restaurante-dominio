import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  Bell,
  BellOff,
  Settings,
  BarChart3,
  AlertCircle
} from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  isReconnecting: boolean;
  retryCount: number;
  lastConnected: Date | null;
  quality?: 'excellent' | 'good' | 'poor' | 'critical';
  latency?: number;
  onForceReconnect?: () => void;
  // Novas props para funcionalidades avançadas
  getConnectionMetrics?: () => any;
  getConnectionQuality?: () => any;
  getConnectionAlerts?: (unresolvedOnly?: boolean) => any[];
  resolveAlert?: (alertId: string) => void;
  getFallbackState?: () => any;
  forceFallbackMode?: (mode: 'realtime' | 'polling') => void;
  onRunDiagnostic?: () => Promise<any>;
}

// Componente simples para status inline
export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isReconnecting,
  retryCount,
  quality = 'critical',
  latency = 0,
  onForceReconnect
}) => {
  const getStatusColor = () => {
    if (isConnected) {
      switch (quality) {
        case 'excellent': return 'text-green-600';
        case 'good': return 'text-blue-600';
        case 'poor': return 'text-yellow-600';
        default: return 'text-green-600';
      }
    }
    return isReconnecting ? 'text-yellow-600' : 'text-red-600';
  };

  const getStatusIcon = () => {
    if (isConnected) return <Wifi className="h-3 w-3" />;
    if (isReconnecting) return <RefreshCw className="h-3 w-3 animate-spin" />;
    return <WifiOff className="h-3 w-3" />;
  };

  const getStatusText = () => {
    if (isConnected) return `Online (${latency}ms)`;
    if (isReconnecting) return `Reconectando... (${retryCount}/5)`;
    return 'Desconectado';
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-1 text-xs ${getStatusColor()}`}>
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </div>
      {(!isConnected || quality === 'poor' || quality === 'critical') && onForceReconnect && (
        <button
          onClick={onForceReconnect}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Tentar reconectar"
          disabled={isReconnecting}
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

// Componente avançado com métricas detalhadas
export const AdvancedConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isReconnecting,
  retryCount,
  quality = 'critical',
  latency = 0,
  onForceReconnect,
  getConnectionMetrics,
  getConnectionQuality,
  getConnectionAlerts,
  resolveAlert,
  getFallbackState,
  forceFallbackMode,
  onRunDiagnostic
}) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [qualityData, setQualityData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [fallbackState, setFallbackState] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);

  // Atualizar dados periodicamente
  useEffect(() => {
    const updateData = () => {
      if (getConnectionMetrics) setMetrics(getConnectionMetrics());
      if (getConnectionQuality) setQualityData(getConnectionQuality());
      if (getConnectionAlerts) setAlerts(getConnectionAlerts(true)); // Apenas não resolvidos
      if (getFallbackState) setFallbackState(getFallbackState());
    };

    updateData();
    const interval = setInterval(updateData, 2000);
    return () => clearInterval(interval);
  }, [getConnectionMetrics, getConnectionQuality, getConnectionAlerts, getFallbackState]);

  const getQualityColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'poor': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getQualityIcon = (level: string) => {
    switch (level) {
      case 'excellent': return <CheckCircle className="h-4 w-4" />;
      case 'good': return <Wifi className="h-4 w-4" />;
      case 'poor': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const runDiagnostic = async () => {
    if (!onRunDiagnostic) return;
    
    setIsRunningDiagnostic(true);
    try {
      await onRunDiagnostic();
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Status da Conexão
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={getQualityColor(quality)}
            >
              {getQualityIcon(quality)}
              <span className="ml-1 capitalize">{quality}</span>
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Principal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${getQualityColor(quality)}`}>
              {isConnected ? (
                <Wifi className="h-5 w-5" />
              ) : isReconnecting ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <WifiOff className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="font-medium">
                {isConnected ? 'Conectado' : isReconnecting ? 'Reconectando' : 'Desconectado'}
              </div>
              <div className="text-sm text-gray-500">
                {isConnected && `Latência: ${latency}ms`}
                {isReconnecting && `Tentativa ${retryCount}/5`}
                {!isConnected && !isReconnecting && 'Usando fallback'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={runDiagnostic}
              disabled={isRunningDiagnostic}
            >
              {isRunningDiagnostic ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Settings className="h-4 w-4" />
              )}
              Diagnóstico
            </Button>
            
            {onForceReconnect && (
              <Button
                variant="outline"
                size="sm"
                onClick={onForceReconnect}
                disabled={isReconnecting}
              >
                <RefreshCw className="h-4 w-4" />
                Reconectar
              </Button>
            )}
          </div>
        </div>

        {/* Alertas */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alertas ({alerts.length})
            </div>
            {alerts.slice(0, 3).map((alert) => (
              <Alert key={alert.id} className="py-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span className="text-sm">{alert.message}</span>
                  {resolveAlert && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resolveAlert(alert.id)}
                      className="h-6 px-2"
                    >
                      Resolver
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Detalhes Expandidos */}
        {showDetails && (
          <>
            <Separator />
            
            {/* Métricas */}
            {metrics && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Métricas de Performance</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Mensagens recebidas:</span>
                      <span className="font-mono">{metrics.messagesReceived}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de entrega:</span>
                      <span className="font-mono">{Math.round(metrics.deliveryRate * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reconexões:</span>
                      <span className="font-mono">{metrics.reconnections}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <span className="font-mono">{Math.round(metrics.uptime / 1000)}s</span>
                    </div>
                  </div>
                </div>

                {qualityData && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Qualidade da Conexão</div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Score Geral</span>
                          <span>{qualityData.score}/100</span>
                        </div>
                        <Progress value={qualityData.score} className="h-2" />
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Latência:</span>
                          <span>{qualityData.factors.latency}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estabilidade:</span>
                          <span>{qualityData.factors.stability}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Confiabilidade:</span>
                          <span>{qualityData.factors.reliability}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Estado do Fallback */}
            {fallbackState && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Sistema de Fallback
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      Modo atual: <Badge variant="outline">{fallbackState.mode}</Badge>
                    </div>
                    {forceFallbackMode && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => forceFallbackMode('realtime')}
                          disabled={fallbackState.mode === 'realtime'}
                        >
                          Realtime
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => forceFallbackMode('polling')}
                          disabled={fallbackState.mode === 'polling'}
                        >
                          Polling
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-gray-500">Saúde</div>
                      <div className="font-mono">{fallbackState.healthScore}/100</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Queue</div>
                      <div className="font-mono">{fallbackState.queueSize}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Falhas</div>
                      <div className="font-mono">{fallbackState.consecutiveFailures}</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para banner de status mais visível
export const ConnectionBanner: React.FC<ConnectionStatusProps & {
  quality?: 'excellent' | 'good' | 'poor' | 'critical';
  latency?: number;
}> = ({
  isConnected,
  isReconnecting,
  retryCount,
  onForceReconnect,
  quality = 'critical',
  latency = 0
}) => {
  // Mostrar banner sempre para dar feedback visual
  const getStatusConfig = () => {
    if (isConnected) {
      switch (quality) {
        case 'excellent':
          return {
            bg: 'bg-green-100 border-green-200 text-green-800',
            icon: <Wifi className="h-4 w-4" />,
            message: `Conectado - Qualidade excelente (${latency}ms)`
          };
        case 'good':
          return {
            bg: 'bg-blue-100 border-blue-200 text-blue-800',
            icon: <Wifi className="h-4 w-4" />,
            message: `Conectado - Boa qualidade (${latency}ms)`
          };
        case 'poor':
          return {
            bg: 'bg-yellow-100 border-yellow-200 text-yellow-800',
            icon: <Wifi className="h-4 w-4" />,
            message: `Conectado - Qualidade baixa (${latency}ms)`
          };
        default:
          return {
            bg: 'bg-green-100 border-green-200 text-green-800',
            icon: <Wifi className="h-4 w-4" />,
            message: `Conectado (${latency}ms)`
          };
      }
    }
    
    if (isReconnecting) {
      return {
        bg: 'bg-yellow-100 border-yellow-200 text-yellow-800',
        icon: <RefreshCw className="h-4 w-4 animate-spin" />,
        message: `Reconectando... (tentativa ${retryCount}/5)`
      };
    }
    
    return {
      bg: 'bg-red-100 border-red-200 text-red-800',
      icon: <AlertCircle className="h-4 w-4" />,
      message: 'Desconectado - Usando modo fallback'
    };
  };

  const config = getStatusConfig();

  return (
    <div className={`px-4 py-2 flex items-center justify-between text-sm ${config.bg} border-b`}>
      <div className="flex items-center gap-2">
        {config.icon}
        <span>{config.message}</span>
      </div>
      
      {(!isConnected || quality === 'poor' || quality === 'critical') && onForceReconnect && (
        <button
          onClick={onForceReconnect}
          className="px-3 py-1 bg-white rounded text-sm font-medium hover:bg-gray-50 transition-colors"
          disabled={isReconnecting}
        >
          {isReconnecting ? 'Reconectando...' : 'Reconectar'}
        </button>
      )}
    </div>
  );
};