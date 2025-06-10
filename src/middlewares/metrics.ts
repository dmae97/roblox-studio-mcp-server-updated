import { Request, Response, NextFunction } from 'express';

// Simple in-memory metrics
const metrics = {
  counters: {
    requests: {
      total: 0,
      byMethod: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
    },
    errors: 0,
  },
  timers: {
    requestDuration: {
      total: 0,
      count: 0,
      byPath: {} as Record<string, { total: number; count: number }>,
    },
  },
};

/**
 * Middleware to collect request metrics
 */
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  // Increment request counter
  metrics.counters.requests.total += 1;

  // Track by HTTP method
  const method = req.method;
  metrics.counters.requests.byMethod[method] = (metrics.counters.requests.byMethod[method] || 0) + 1;

  // Record end metrics on response finish
  res.on('finish', () => {
    // Calculate request duration
    const duration = Date.now() - start;

    // Track total request duration
    metrics.timers.requestDuration.total += duration;
    metrics.timers.requestDuration.count += 1;

    // Track request duration by path (normalize path to avoid too many unique paths)
    const path = normalizePath(req.originalUrl);
    if (!metrics.timers.requestDuration.byPath[path]) {
      metrics.timers.requestDuration.byPath[path] = { total: 0, count: 0 };
    }
    metrics.timers.requestDuration.byPath[path].total += duration;
    metrics.timers.requestDuration.byPath[path].count += 1;

    // Track by status code
    const statusCode = res.statusCode.toString();
    metrics.counters.requests.byStatus[statusCode] = (metrics.counters.requests.byStatus[statusCode] || 0) + 1;

    // Track errors (status >= 400)
    if (res.statusCode >= 400) {
      metrics.counters.errors += 1;
    }
  });

  next();
};

/**
 * Helper function to normalize paths to prevent cardinality explosion
 */
function normalizePath(path: string): string {
  // Strip query parameters
  const basePath = path.split('?')[0];

  // Replace numeric IDs with placeholders
  return basePath.replace(/\/\d+/g, '/:id');
}

/**
 * Get current metrics data
 */
export function getMetrics() {
  // Calculate average request duration
  const avgRequestDuration = metrics.timers.requestDuration.count > 0
    ? metrics.timers.requestDuration.total / metrics.timers.requestDuration.count
    : 0;

  // Calculate average request duration by path
  const avgRequestDurationByPath: Record<string, number> = {};
  for (const [path, data] of Object.entries(metrics.timers.requestDuration.byPath)) {
    avgRequestDurationByPath[path] = data.count > 0 ? data.total / data.count : 0;
  }

  return {
    requests: {
      total: metrics.counters.requests.total,
      byMethod: metrics.counters.requests.byMethod,
      byStatus: metrics.counters.requests.byStatus,
    },
    errors: metrics.counters.errors,
    performance: {
      avgRequestDuration,
      avgRequestDurationByPath,
    },
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    },
  };
}

/**
 * Reset all metrics
 */
export function resetMetrics(): void {
  metrics.counters.requests.total = 0;
  metrics.counters.requests.byMethod = {};
  metrics.counters.requests.byStatus = {};
  metrics.counters.errors = 0;
  metrics.timers.requestDuration.total = 0;
  metrics.timers.requestDuration.count = 0;
  metrics.timers.requestDuration.byPath = {};
}
