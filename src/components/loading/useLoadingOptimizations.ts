import { useEffect, useState } from 'react';

interface LoadingOptimizations {
  prefersReducedMotion: boolean;
  shouldUseGPUAcceleration: boolean;
  isHighPerformanceDevice: boolean;
}

export const useLoadingOptimizations = (): LoadingOptimizations => {
  const [optimizations, setOptimizations] = useState<LoadingOptimizations>({
    prefersReducedMotion: false,
    shouldUseGPUAcceleration: true,
    isHighPerformanceDevice: true;
  })

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const prefersReducedMotion = mediaQuery.matches;

    // Detect device performance capabilities
    const isHighPerformanceDevice = (() => {
      // Check for hardware concurrency (CPU cores)
      const cores = navigator.hardwareConcurrency || 4;
      
      // Check for device memory (if available)
      const memory = (navigator as any).deviceMemory || 4;
      
      // Check for connection speed
      const connection = (navigator as any).connection;
      const isSlowConnection = connection && ;
        (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')
      
      return cores >= 4 && memory >= 4 && !isSlowConnection;
    })()

    // GPU acceleration should be used unless on very low-end devices
    const shouldUseGPUAcceleration = isHighPerformanceDevice && !prefersReducedMotion;

    setOptimizations({
      prefersReducedMotion,
      shouldUseGPUAcceleration,
      isHighPerformanceDevice
    })

    // Listen for changes in motion preference
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setOptimizations(prev => ({
        ...prev,
        prefersReducedMotion: e.matches,
        shouldUseGPUAcceleration: !e.matches && prev.isHighPerformanceDevice;
      }))
    };

    mediaQuery.addEventListener('change', handleMotionChange)

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange)
    };
  }, [])

  return optimizations;
};
