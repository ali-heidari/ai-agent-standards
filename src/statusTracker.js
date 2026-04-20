const db = require('./database');

class StatusTracker {
  constructor() {
    this.metrics = {
      totalDeliveries: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      retryCount: 0,
    };
  }

  // Create a new delivery attempt record
  async createDeliveryAttempt(eventId, webhookId, attemptNumber) {
    try {
      const query = `
        INSERT INTO delivery_attempts (event_id, webhook_id, attempt_number, status)
        VALUES ($1, $2, $3, 'pending')
        RETURNING id
      `;
      const values = [eventId, webhookId, attemptNumber];
      const result = await db.query(query, values);

      this.metrics.totalDeliveries++;
      return result.rows[0].id;
    } catch (error) {
      console.error('Error creating delivery attempt:', error);
      throw error;
    }
  }

  // Update delivery attempt status
  async updateDeliveryAttempt(attemptId, updates) {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (updates.status) {
        fields.push(`status = $${paramIndex++}`);
        values.push(updates.status);

        // Update metrics
        if (updates.status === 'success') {
          this.metrics.successfulDeliveries++;
        } else if (updates.status === 'failed') {
          this.metrics.failedDeliveries++;
        }
      }

      if (updates.http_status !== undefined) {
        fields.push(`http_status = $${paramIndex++}`);
        values.push(updates.http_status);
      }

      if (updates.response_body !== undefined) {
        fields.push(`response_body = $${paramIndex++}`);
        values.push(updates.response_body);
      }

      if (updates.error_message !== undefined) {
        fields.push(`error_message = $${paramIndex++}`);
        values.push(updates.error_message);
      }

      if (updates.next_retry_at !== undefined) {
        fields.push(`next_retry_at = $${paramIndex++}`);
        values.push(updates.next_retry_at);
      }

      if (fields.length === 0) {
        return; // Nothing to update
      }

      values.push(attemptId);

      const query = `
        UPDATE delivery_attempts
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
      `;

      await db.query(query, values);
    } catch (error) {
      console.error('Error updating delivery attempt:', error);
      throw error;
    }
  }

  // Schedule a retry for failed delivery
  async scheduleRetry(eventId, webhookId, delayMs) {
    try {
      const nextRetryAt = new Date(Date.now() + delayMs);

      // Get the latest attempt for this event/webhook combination
      const attemptId = await this.getLatestAttemptId(eventId, webhookId);
      if (attemptId) {
        await this.updateDeliveryAttempt(attemptId, {
          status: 'retry',
          next_retry_at: nextRetryAt,
        });
      }

      this.metrics.retryCount++;
    } catch (error) {
      console.error('Error scheduling retry:', error);
      throw error;
    }
  }

  // Get the latest attempt ID for an event/webhook pair
  async getLatestAttemptId(eventId, webhookId) {
    try {
      const query = `
        SELECT id FROM delivery_attempts
        WHERE event_id = $1 AND webhook_id = $2
        ORDER BY attempt_number DESC
        LIMIT 1
      `;
      const result = await db.query(query, [eventId, webhookId]);
      return result.rows[0]?.id || null;
    } catch (error) {
      console.error('Error getting latest attempt ID:', error);
      return null;
    }
  }

  // Get delivery status for an event
  async getDeliveryStatus(eventId) {
    try {
      const query = `
        SELECT
          da.*,
          w.url as webhook_url,
          w.customer_id
        FROM delivery_attempts da
        JOIN webhooks w ON da.webhook_id = w.id
        WHERE da.event_id = $1
        ORDER BY da.attempted_at DESC
      `;
      const result = await db.query(query, [eventId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting delivery status:', error);
      throw error;
    }
  }

  // Get delivery statistics
  async getDeliveryStats(timeRange = '1 hour') {
    try {
      const query = `
        SELECT
          COUNT(*) as total_attempts,
          COUNT(CASE WHEN status = 'success' THEN 1 END) as successful,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
          COUNT(CASE WHEN status = 'retry' THEN 1 END) as retries,
          AVG(CASE WHEN http_status IS NOT NULL THEN http_status END) as avg_response_time
        FROM delivery_attempts
        WHERE attempted_at > NOW() - INTERVAL '${timeRange}'
      `;
      const result = await db.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting delivery stats:', error);
      throw error;
    }
  }

  // Get failed deliveries that need retry
  async getPendingRetries() {
    try {
      const query = `
        SELECT da.*, w.url, w.customer_id, e.event_type
        FROM delivery_attempts da
        JOIN webhooks w ON da.webhook_id = w.id
        JOIN events e ON da.event_id = e.id
        WHERE da.status = 'retry'
        AND da.next_retry_at <= NOW()
        ORDER BY da.next_retry_at ASC
      `;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting pending retries:', error);
      throw error;
    }
  }

  // Get metrics
  getMetrics() {
    return { ...this.metrics };
  }

  // Reset metrics (for testing)
  resetMetrics() {
    this.metrics = {
      totalDeliveries: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      retryCount: 0,
    };
  }
}

module.exports = StatusTracker;