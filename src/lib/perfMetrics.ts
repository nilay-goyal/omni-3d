// Lightweight performance metrics utilities used by web-vitals and pages
// Keep this minimal to avoid introducing runtime errors.
import type { Metric } from 'web-vitals';

export function logPerfMetric(metric: Metric) {
  try {
    // Log to console for now; can be wired to analytics later
    console.info(`[perf] ${metric.name}:`, {
      value: Math.round(metric.value * 100) / 100,
      id: metric.id,
      rating: (metric as any).rating,
      delta: (metric as any).delta,
    });
  } catch (e) {
    // Never let perf logging break the app
  }
}

export function timer(label: string) {
  const getNow = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
  const start = getNow();
  return {
    end: () => {
      const duration = getNow() - start;
      try {
        console.info(`[perf] ${label} ms:`, Math.round(duration));
      } catch {}
    },
  } as const;
}

