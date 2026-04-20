const express = require('express');
const WebhookRegistry = require('./webhookRegistry');
const StatusTracker = require('./statusTracker');

class WebhookAPI {
  constructor(registry, statusTracker) {
    this.app = express();
    this.registry = registry;
    this.statusTracker = statusTracker;
    this.port = process.env.PORT || 3000;

    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // CORS middleware
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    // Register webhook
    this.app.post('/webhooks', async (req, res) => {
      try {
        const { customer_id, url, event_types, secret } = req.body;

        if (!customer_id || !url || !event_types || !Array.isArray(event_types)) {
          return res.status(400).json({
            error: 'Missing required fields: customer_id, url, event_types (array)'
          });
        }

        // Validate URL
        try {
          new URL(url);
        } catch (error) {
          return res.status(400).json({ error: 'Invalid URL format' });
        }

        const webhook = await this.registry.registerWebhook(customer_id, url, event_types, secret);
        res.status(201).json(webhook);
      } catch (error) {
        console.error('Error registering webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Get webhook by ID
    this.app.get('/webhooks/:id', async (req, res) => {
      try {
        const webhook = await this.registry.getWebhookById(req.params.id);
        if (!webhook) {
          return res.status(404).json({ error: 'Webhook not found' });
        }
        res.json(webhook);
      } catch (error) {
        console.error('Error getting webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Get webhooks by customer
    this.app.get('/customers/:customerId/webhooks', async (req, res) => {
      try {
        const webhooks = await this.registry.getWebhooksByCustomer(req.params.customerId);
        res.json(webhooks);
      } catch (error) {
        console.error('Error getting customer webhooks:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Update webhook
    this.app.put('/webhooks/:id', async (req, res) => {
      try {
        const updates = req.body;
        const webhook = await this.registry.updateWebhook(req.params.id, updates);
        res.json(webhook);
      } catch (error) {
        if (error.message === 'Webhook not found') {
          return res.status(404).json({ error: 'Webhook not found' });
        }
        console.error('Error updating webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Delete webhook
    this.app.delete('/webhooks/:id', async (req, res) => {
      try {
        await this.registry.deleteWebhook(req.params.id);
        res.json({ message: 'Webhook deactivated' });
      } catch (error) {
        if (error.message === 'Webhook not found') {
          return res.status(404).json({ error: 'Webhook not found' });
        }
        console.error('Error deleting webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Get delivery status for event
    this.app.get('/deliveries', async (req, res) => {
      try {
        const { event_id } = req.query;
        if (!event_id) {
          return res.status(400).json({ error: 'event_id query parameter required' });
        }

        const deliveries = await this.statusTracker.getDeliveryStatus(event_id);
        res.json(deliveries);
      } catch (error) {
        console.error('Error getting delivery status:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Get delivery statistics
    this.app.get('/stats/deliveries', async (req, res) => {
      try {
        const timeRange = req.query.range || '1 hour';
        const stats = await this.statusTracker.getDeliveryStats(timeRange);
        const metrics = this.statusTracker.getMetrics();

        res.json({
          timeRange,
          stats,
          currentMetrics: metrics
        });
      } catch (error) {
        console.error('Error getting delivery stats:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Get pending retries
    this.app.get('/retries/pending', async (req, res) => {
      try {
        const retries = await this.statusTracker.getPendingRetries();
        res.json(retries);
      } catch (error) {
        console.error('Error getting pending retries:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });

    // Error handler
    this.app.use((error, req, res, next) => {
      console.error('Unhandled error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`Webhook API server listening on port ${this.port}`);
        resolve();
      });

      this.server.on('error', (error) => {
        console.error('Error starting API server:', error);
        reject(error);
      });
    });
  }

  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log('Webhook API server stopped');
          resolve();
        });
      });
    }
  }
}

module.exports = WebhookAPI;