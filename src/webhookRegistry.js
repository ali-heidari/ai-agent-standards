const db = require('./database');

class WebhookRegistry {
  constructor() {
    this.cache = null; // Will be set by WebhookCache
  }

  setCache(cache) {
    this.cache = cache;
  }

  async registerWebhook(customerId, url, eventTypes, secret = null) {
    try {
      const query = `
        INSERT INTO webhooks (customer_id, url, event_types, secret)
        VALUES ($1, $2, $3, $4)
        RETURNING id, customer_id, url, event_types, secret, is_active, created_at
      `;
      const values = [customerId, url, eventTypes, secret];
      const result = await db.query(query, values);

      const webhook = result.rows[0];

      // Update cache
      if (this.cache) {
        await this.cache.invalidateWebhookCache(eventTypes);
      }

      console.log(`Webhook registered: ${webhook.id} for customer ${customerId}`);
      return webhook;
    } catch (error) {
      console.error('Error registering webhook:', error);
      throw error;
    }
  }

  async getWebhookById(id) {
    try {
      const query = 'SELECT * FROM webhooks WHERE id = $1 AND is_active = true';
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting webhook:', error);
      throw error;
    }
  }

  async getWebhooksByCustomer(customerId) {
    try {
      const query = 'SELECT * FROM webhooks WHERE customer_id = $1 AND is_active = true ORDER BY created_at DESC';
      const result = await db.query(query, [customerId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting customer webhooks:', error);
      throw error;
    }
  }

  async updateWebhook(id, updates) {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (updates.url) {
        fields.push(`url = $${paramIndex++}`);
        values.push(updates.url);
      }
      if (updates.eventTypes) {
        fields.push(`event_types = $${paramIndex++}`);
        values.push(updates.eventTypes);
      }
      if (updates.secret !== undefined) {
        fields.push(`secret = $${paramIndex++}`);
        values.push(updates.secret);
      }
      if (updates.isActive !== undefined) {
        fields.push(`is_active = $${paramIndex++}`);
        values.push(updates.isActive);
      }

      if (fields.length === 0) {
        throw new Error('No valid fields to update');
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE webhooks
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await db.query(query, values);
      const webhook = result.rows[0];

      if (!webhook) {
        throw new Error('Webhook not found');
      }

      // Update cache if event types changed
      if (this.cache && updates.eventTypes) {
        await this.cache.invalidateWebhookCache(updates.eventTypes);
      }

      return webhook;
    } catch (error) {
      console.error('Error updating webhook:', error);
      throw error;
    }
  }

  async deleteWebhook(id) {
    try {
      // Get webhook first to know event types for cache invalidation
      const webhook = await this.getWebhookById(id);
      if (!webhook) {
        throw new Error('Webhook not found');
      }

      const query = 'UPDATE webhooks SET is_active = false, updated_at = NOW() WHERE id = $1';
      await db.query(query, [id]);

      // Update cache
      if (this.cache) {
        await this.cache.invalidateWebhookCache(webhook.event_types);
      }

      console.log(`Webhook deactivated: ${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting webhook:', error);
      throw error;
    }
  }
}

module.exports = WebhookRegistry;