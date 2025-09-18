/**
 * Monitoring and metrics system for delivery methods
 * 
 * This module provides comprehensive monitoring, metrics collection,
 * and debugging utilities for the delivery methods system.
 */

import { DeliveryMethodsConfig } from '@/utils/deliveryMethodsFallback';

export interface DeliveryMethodsMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  fallbackUsage: number;
  autoCreatedConfigs: number;
  averageResponseTime: number;
  errorsByCategory: Record<string, number>;
  companiesWithIssues: Set<string>;
  lastUpdated: Date;
}

export interface DeliveryMethodsEvent {
  type: 'request' | 'success' | 'error' | 'fallback' | 'auto-created' | 'performance';
  companyId: string;
  companyName?: string;
  timestamp: Date;
  duration?: number;
  error?: {
    message: string;
    category: string;
    severity: string;
  };
  config?: DeliveryMethodsConfig;
  metadata?: Record<string, any>;
}

/**
 * In-memory metrics storage
 * In a production environment, this would be replaced with a proper metrics service
 */
class DeliveryMethodsMonitor {
  private metrics: DeliveryMethodsMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    fallbackUsage: 0,
    autoCreatedConfigs: 0,
    averageResponseTime: 0,
    errorsByCategory: {},
    companiesWithIssues: new Set(),
    lastUpdated: new Date()
  };

  private events: DeliveryMethodsEvent[] = [];
  private responseTimeSum: number = 0;
  private maxEvents: number = 1000; // Keep last 1000 events

  /**
   * Record a delivery methods event
   */
  recordEvent(event: DeliveryMethodsEvent): void {
    // Add to events log
    this.events.push(event)
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }

    // Update metrics
    this.updateMetrics(event)

    // Log event for debugging
    this.logEvent(event)


  /**
   * Update metrics based on event
   */
  private updateMetrics(event: DeliveryMethodsEvent): void {
    this.metrics.lastUpdated = new Date()

    switch (event.type) {
      case 'request':
        this.metrics.totalRequests++;
        break;

      case 'success':
        this.metrics.successfulRequests++;
        if (event.duration) {
          this.responseTimeSum += event.duration;
          this.metrics.averageResponseTime = this.responseTimeSum / this.metrics.successfulRequests;
        }
        break;

      case 'error':
        this.metrics.failedRequests++;
        this.metrics.companiesWithIssues.add(event.companyId)
        
        if (event.error?.category) {
          this.metrics.errorsByCategory[event.error.category] = 
            (this.metrics.errorsByCategory[event.error.category] || 0) + 1;
        }
        break;

      case 'fallback':
        this.metrics.fallbackUsage++;
        this.metrics.companiesWithIssues.add(event.companyId)
        break;

      case 'auto-created':
        this.metrics.autoCreatedConfigs++;
        break;
    }
  }

  /**
   * Log event with appropriate level
   */
  private logEvent(event: DeliveryMethodsEvent): void {
    const logData = {
      type: event.type,
      company: {
        id: event.companyId,
        name: event.companyName
      },
      timestamp: event.timestamp.toISOString(),
      duration: event.duration,
      error: event.error,
      config: event.config,
      metadata: event.metadata;
    };

    switch (event.type) {
      case 'error':
        console.error('📊 [DeliveryMetrics] Error event:', logData)
        break;
      case 'fallback':
        console.warn('📊 [DeliveryMetrics] Fallback event:', logData)
        break;
      case 'auto-created':
        console.info('📊 [DeliveryMetrics] Auto-created event:', logData)
        break;
      case 'performance':
        if (event.duration && event.duration > 5000) {
          console.warn('📊 [DeliveryMetrics] Slow performance:', logData)
        }
        break;
      default:
        console.debug('📊 [DeliveryMetrics] Event:', logData)
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): DeliveryMethodsMetrics {
    return {
      ...this.metrics,
      companiesWithIssues: new Set(this.metrics.companiesWithIssues) // Return copy
    };


  /**
   * Get recent events
   */
  getRecentEvents(limit: number = 50): DeliveryMethodsEvent[] {
    return this.events.slice(-limit)


  /**
   * Get events for specific company
   */
  getCompanyEvents(companyId: string, limit: number = 20): DeliveryMethodsEvent[] {
    return this.events
      .filter(event => event.companyId === companyId)
      .slice(-limit)


  /**
   * Get error summary
   */
  getErrorSummary(): {
    totalErrors: number;
    errorsByCategory: Record<string, number>;
    companiesAffected: number;
    recentErrors: DeliveryMethodsEvent[];
  } {
    const recentErrors = this.events
      .filter(event => event.type === 'error')
      .slice(-10)

    return {
      totalErrors: this.metrics.failedRequests,
      errorsByCategory: { ...this.metrics.errorsByCategory },
      companiesAffected: this.metrics.companiesWithIssues.size,
      recentErrors
    };


  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    averageResponseTime: number;
    totalRequests: number;
    successRate: number;
    fallbackRate: number;
  } {
    const successRate = this.metrics.totalRequests > 0 
      ? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100 ;
      : 0;

    const fallbackRate = this.metrics.totalRequests > 0
      ? (this.metrics.fallbackUsage / this.metrics.totalRequests) * 100;
      : 0;

    return {
      averageResponseTime: this.metrics.averageResponseTime,
      totalRequests: this.metrics.totalRequests,
      successRate: Math.round(successRate * 100) / 100,
      fallbackRate: Math.round(fallbackRate * 100) / 100
    };


  /**
   * Reset metrics (useful for testing)
   */
  reset(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      fallbackUsage: 0,
      autoCreatedConfigs: 0,
      averageResponseTime: 0,
      errorsByCategory: {},
      companiesWithIssues: new Set(),
      lastUpdated: new Date()
    };
    this.events = [];
    this.responseTimeSum = 0;


  /**
   * Generate health report
   */
  generateHealthReport(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
    metrics: DeliveryMethodsMetrics;
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    const performance = this.getPerformanceSummary()

    // Check success rate
    if (performance.successRate < 90) {
      status = 'critical';
      issues.push(`Low success rate: ${performance.successRate}%`)
      recommendations.push('Investigate database connectivity and query performance')
    } else if (performance.successRate < 95) {
      status = 'warning';
      issues.push(`Moderate success rate: ${performance.successRate}%`)
    }

    // Check fallback usage
    if (performance.fallbackRate > 20) {
      status = 'critical';
      issues.push(`High fallback usage: ${performance.fallbackRate}%`)
      recommendations.push('Check database configuration and create missing delivery_methods records')
    } else if (performance.fallbackRate > 10) {
      if (status === 'healthy') status = 'warning';
      issues.push(`Moderate fallback usage: ${performance.fallbackRate}%`)
    }

    // Check response time
    if (performance.averageResponseTime > 3000) {
      if (status === 'healthy') status = 'warning';
      issues.push(`Slow response time: ${performance.averageResponseTime}ms`)
      recommendations.push('Optimize database queries and consider caching')
    }

    // Check companies with issues
    if (this.metrics.companiesWithIssues.size > 5) {
      if (status === 'healthy') status = 'warning';
      issues.push(`${this.metrics.companiesWithIssues.size} companies experiencing issues`)
      recommendations.push('Run batch repair operation for affected companies')
    }

    return {
      status,
      issues,
      recommendations,
      metrics: this.getMetrics()
    };

}

/**
 * Global monitor instance
 */
const deliveryMethodsMonitor = new DeliveryMethodsMonitor()

/**
 * Helper functions for recording events
 */
export const recordDeliveryMethodsRequest = (companyId: string, companyName?: string): void => {
  deliveryMethodsMonitor.recordEvent({
    type: 'request',
    companyId,
    companyName,
    timestamp: new Date()
  })
};

export const recordDeliveryMethodsSuccess = (
  companyId: string, 
  companyName: string | undefined, 
  config: DeliveryMethodsConfig, 
  duration: number
): void => {
  deliveryMethodsMonitor.recordEvent({
    type: 'success',
    companyId,
    companyName,
    timestamp: new Date(),
    duration,
    config;
  })
};

export const recordDeliveryMethodsError = (
  companyId: string,
  companyName: string | undefined,
  error: Error,
  category: string,
  severity: string
): void => {
  deliveryMethodsMonitor.recordEvent({
    type: 'error',
    companyId,
    companyName,
    timestamp: new Date(),
    error: {
      message: error.message,
      category,
      severity
    };
  })
};

export const recordDeliveryMethodsFallback = (
  companyId: string,
  companyName: string | undefined,
  reason: string,
  config: DeliveryMethodsConfig
): void => {
  deliveryMethodsMonitor.recordEvent({
    type: 'fallback',
    companyId,
    companyName,
    timestamp: new Date(),
    config,
    metadata: { reason };
  })
};

export const recordDeliveryMethodsAutoCreated = (
  companyId: string,
  companyName: string | undefined,
  config: DeliveryMethodsConfig
): void => {
  deliveryMethodsMonitor.recordEvent({
    type: 'auto-created',
    companyId,
    companyName,
    timestamp: new Date(),
    config;
  })
};

/**
 * Get monitoring data
 */
export const getDeliveryMethodsMetrics = (): DeliveryMethodsMetrics => {
  return deliveryMethodsMonitor.getMetrics()
};

export const getDeliveryMethodsHealthReport = () => {
  return deliveryMethodsMonitor.generateHealthReport()
};

export const getDeliveryMethodsEvents = (limit?: number) => {
  return deliveryMethodsMonitor.getRecentEvents(limit)
};

export const getCompanyDeliveryMethodsEvents = (companyId: string, limit?: number) => {
  return deliveryMethodsMonitor.getCompanyEvents(companyId, limit)
};

/**
 * Debug utilities
 */
export const debugDeliveryMethods = {
  getMetrics: () => deliveryMethodsMonitor.getMetrics(),
  getEvents: (limit?: number) => deliveryMethodsMonitor.getRecentEvents(limit),
  getErrorSummary: () => deliveryMethodsMonitor.getErrorSummary(),
  getPerformanceSummary: () => deliveryMethodsMonitor.getPerformanceSummary(),
  getHealthReport: () => deliveryMethodsMonitor.generateHealthReport(),
  reset: () => deliveryMethodsMonitor.reset()
};

// Make debug utilities available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugDeliveryMethods = debugDeliveryMethods;
}
