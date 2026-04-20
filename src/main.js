

const WebhookRegistry = require('./webhookRegistry');
const WebhookCache = require('./webhookCache');
const DeliveryExecutor = require('./deliveryExecutor');
const StatusTracker = require('./statusTracker');
const EventListener = require('./eventListener');
const WebhookAPI = require('./webhookAPI');
const WebhookVisualization = require('./visualization');

async function main() {
  console.log('Starting Webhook Manager Service...');

  try {
    // Initialize components
    const statusTracker = new StatusTracker();
    const webhookCache = new WebhookCache();
    const webhookRegistry = new WebhookRegistry();
    const deliveryExecutor = new DeliveryExecutor(statusTracker);
    const eventListener = new EventListener(webhookCache, deliveryExecutor);
    const webhookAPI = new WebhookAPI(webhookRegistry, statusTracker);
    const visualization = new WebhookVisualization(statusTracker, webhookCache);

    // Connect components
    webhookRegistry.setCache(webhookCache);

    // Connect to services
    await webhookCache.connect();

    // Initialize cache
    await webhookCache.refreshCache(webhookRegistry);

    // Start event listener
    await eventListener.connect();
    await eventListener.startListening();

    // Start API server
    await webhookAPI.start();

    // Initialize visualization
    visualization.init();

    console.log('Webhook Manager Service started successfully!');
    console.log('API available at http://localhost:3000');
    console.log('Visualization running in canvas');

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down gracefully...');

      await eventListener.stop();
      await webhookAPI.stop();
      await webhookCache.disconnect();
      visualization.destroy();

      console.log('Shutdown complete');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('Received SIGTERM, shutting down...');
      await eventListener.stop();
      await webhookAPI.stop();
      await webhookCache.disconnect();
      visualization.destroy();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start Webhook Manager Service:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the service
main();