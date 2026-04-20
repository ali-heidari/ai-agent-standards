// Note: p5.js visualization is disabled in server environment
// This would require a browser context or headless browser setup

class WebhookVisualization {
  constructor(statusTracker, webhookCache) {
    this.statusTracker = statusTracker;
    this.webhookCache = webhookCache;
    this.metrics = {
      successful: 0,
      failed: 0,
      retries: 0,
      total: 0
    };
    console.log('WebhookVisualization initialized (p5.js disabled in server mode)');
  }

  init() {
    console.log('Visualization: p5.js canvas not available in Node.js environment');
    console.log('Consider running visualization in a browser context');
  }

  updateMetrics() {
    const currentMetrics = this.statusTracker.getMetrics();
    this.metrics = { ...currentMetrics };
  }

  destroy() {
    // Nothing to destroy in server mode
  }

  // Placeholder methods for future browser implementation
  drawMetrics() {}
  drawRecentDeliveriesChart() {}
  drawCacheStatus() {}
  updateCacheStatus() {}
}

module.exports = WebhookVisualization;