const redis = require('redis');

class WebhookCache {
  constructor() {
    this.client = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis');
    });

    this.cacheTTL = 300; // 5 minutes TTL
  }

  async connect() {
    await this.client.connect();
  }

  async disconnect() {
    await this.client.disconnect();
  }

  // Get webhooks for specific event type
  async getWebhooksForEventType(eventType) {
    try {
      const key = `webhooks:${eventType}`;
      const cached = await this.client.get(key);

      if (cached) {
        return JSON.parse(cached);
      }

      return null; // Cache miss
    } catch (error) {
      console.error('Error getting webhooks from cache:', error);
      return null;
    }
  }

  // Set webhooks for event type
  async setWebhooksForEventType(eventType, webhooks) {
    try {
      const key = `webhooks:${eventType}`;
      await this.client.setEx(key, this.cacheTTL, JSON.stringify(webhooks));
      console.log(`Cached ${webhooks.length} webhooks for event type: ${eventType}`);
    } catch (error) {
      console.error('Error setting webhooks in cache:', error);
    }
  }

  // Invalidate cache for specific event types
  async invalidateWebhookCache(eventTypes) {
    try {
      const keys = eventTypes.map(type => `webhooks:${type}`);
      if (keys.length > 0) {
        await this.client.del(keys);
        console.log(`Invalidated cache for event types: ${eventTypes.join(', ')}`);
      }
    } catch (error) {
      console.error('Error invalidating webhook cache:', error);
    }
  }

  // Load all webhooks from database and populate cache
  async refreshCache(registry) {
    try {
      console.log('Refreshing webhook cache...');

      // Get all active webhooks
      const client = await require('./database').getClient();
      try {
        const query = 'SELECT * FROM webhooks WHERE is_active = true';
        const result = await client.query(query);
        const webhooks = result.rows;

        // Group by event type
        const webhooksByType = {};

        webhooks.forEach(webhook => {
          webhook.event_types.forEach(eventType => {
            if (!webhooksByType[eventType]) {
              webhooksByType[eventType] = [];
            }
            webhooksByType[eventType].push({
              id: webhook.id,
              customer_id: webhook.customer_id,
              url: webhook.url,
              secret: webhook.secret,
            });
          });
        });

        // Cache each event type
        for (const [eventType, typeWebhooks] of Object.entries(webhooksByType)) {
          await this.setWebhooksForEventType(eventType, typeWebhooks);
        }

        console.log(`Cache refreshed with ${Object.keys(webhooksByType).length} event types`);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error refreshing cache:', error);
    }
  }

  // Get cache statistics
  async getCacheStats() {
    try {
      const keys = await this.client.keys('webhooks:*');
      const stats = {
        cachedEventTypes: keys.length,
        keys: keys,
      };
      return stats;
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { error: error.message };
    }
  }
}

module.exports = WebhookCache;