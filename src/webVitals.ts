// src/webVitals.ts
import { onCLS, onLCP, onINP, onFCP } from 'web-vitals';
import { logPerfMetric } from './lib/perfMetrics';

onCLS(logPerfMetric);
onLCP(logPerfMetric);
onINP(logPerfMetric);
onFCP(logPerfMetric);
