// src/lib/perfMetrics.ts
// Utility for logging web-vitals and fetch timings

export async function logPerfMetric(metric: { name: string; value: number; [key: string]: any }) {
  try {
    await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric)
    });
  } catch (e) {
    // Fail silently
  }
}

export function timer(label: string) {
  const start = performance.now();
  return {
    end: () => {
      const duration = performance.now() - start;
      logPerfMetric({ name: 'fetch_duration', label, value: duration });
      return duration;
    }
  };
}
