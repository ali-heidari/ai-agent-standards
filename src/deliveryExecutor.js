const axios = require('axios');
const crypto = require('crypto');

class DeliveryExecutor {
  constructor(statusTracker) {
    this.statusTracker = statusTracker;
    this.maxRetries = 5;
    this.baseDelay = 1000; // 1 second
    this.maxDelay = 300000; // 5 minutes
    this.timeout = 30000; // 30 seconds per request
  }

  // Calculate exponential backoff delay
  calculateDelay(attemptNumber) {
    const delay = this.baseDelay * Math.pow(4, attemptNumber - 1);
    return Math.min(delay, this.maxDelay);
  }

  // Generate HMAC signature for webhook authentication
  generateSignature(payload, secret) {
    if (!secret) return null;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  // Execute webhook delivery with retry logic
  async deliverWebhook(webhook, event) {
    let attemptNumber = 1;
    let lastError = null;

    while (attemptNumber <= this.maxRetries) {
      try {
        // Create delivery attempt record
        const attemptId = await this.statusTracker.createDeliveryAttempt(
          event.id,
          webhook.id,
          attemptNumber
        );

        const payload = {
          event_id: event.id,
          event_type: event.event_type,
          payload: event.payload,
          timestamp: event.created_at,
          idempotency_key: event.idempotency_key,
        };

        // Prepare headers
        const headers = {
          'Content-Type': 'application/json',
          'User-Agent': 'Webhook-Delivery-Service/1.0',
          'X-Idempotency-Key': event.idempotency_key,
          'X-Event-Type': event.event_type,
          'X-Attempt-Number': attemptNumber.toString(),
        };

        // Add signature if secret provided
        if (webhook.secret) {
          headers['X-Signature'] = this.generateSignature(payload, webhook.secret);
        }

        console.log(`Attempting delivery ${attemptNumber}/${this.maxRetries} to ${webhook.url} for event ${event.id}`);

        // Make HTTP request
        const response = await axios.post(webhook.url, payload, {
          headers,
          timeout: this.timeout,
          validateStatus: () => true, // Don't throw on any status code
        });

        // Update attempt status
        await this.statusTracker.updateDeliveryAttempt(attemptId, {
          status: response.status >= 200 && response.status < 300 ? 'success' : 'failed',
          http_status: response.status,
          response_body: response.data ? JSON.stringify(response.data) : null,
        });

        if (response.status >= 200 && response.status < 300) {
          console.log(`Delivery successful for webhook ${webhook.id}, event ${event.id}`);
          return { success: true, attemptId, status: response.status };
        } else {
          console.warn(`Delivery failed with status ${response.status} for webhook ${webhook.id}`);
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

      } catch (error) {
        console.error(`Delivery attempt ${attemptNumber} failed:`, error.message);

        // Update attempt with error
        const attemptId = await this.statusTracker.getLatestAttemptId(event.id, webhook.id);
        if (attemptId) {
          await this.statusTracker.updateDeliveryAttempt(attemptId, {
            status: 'failed',
            error_message: error.message,
          });
        }

        lastError = error;
      }

      // If not the last attempt, schedule retry
      if (attemptNumber < this.maxRetries) {
        const delay = this.calculateDelay(attemptNumber);
        console.log(`Scheduling retry ${attemptNumber + 1} in ${delay}ms`);

        await this.statusTracker.scheduleRetry(event.id, webhook.id, delay);

        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      attemptNumber++;
    }

    // All retries exhausted
    console.error(`All delivery attempts failed for webhook ${webhook.id}, event ${event.id}`);
    return {
      success: false,
      error: lastError?.message || 'Max retries exceeded',
      attempts: this.maxRetries
    };
  }

  // Deliver to multiple webhooks concurrently
  async deliverToWebhooks(webhooks, event) {
    const promises = webhooks.map(webhook =>
      this.deliverWebhook(webhook, event)
    );

    const results = await Promise.allSettled(promises);

    const summary = {
      total: webhooks.length,
      successful: 0,
      failed: 0,
      results: []
    };

    results.forEach((result, index) => {
      const webhook = webhooks[index];
      if (result.status === 'fulfilled' && result.value.success) {
        summary.successful++;
        summary.results.push({
          webhook_id: webhook.id,
          status: 'success',
          details: result.value
        });
      } else {
        summary.failed++;
        summary.results.push({
          webhook_id: webhook.id,
          status: 'failed',
          error: result.status === 'rejected' ? result.reason.message : result.value.error
        });
      }
    });

    console.log(`Delivery summary for event ${event.id}: ${summary.successful}/${summary.total} successful`);
    return summary;
  }
}

module.exports = DeliveryExecutor;