const amqp = require('amqplib');

class EventListener {
  constructor(webhookCache, deliveryExecutor) {
    this.webhookCache = webhookCache;
    this.deliveryExecutor = deliveryExecutor;
    this.connection = null;
    this.channel = null;
    this.queueName = 'webhook-manager.notifications';
    this.exchangeName = 'events.topic';
  }

  async connect() {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      // Assert exchange
      await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });

      // Assert queue
      await this.channel.assertQueue(this.queueName, { durable: true });

      // Bind queue to exchange for all event notifications
      await this.channel.bindQueue(this.queueName, this.exchangeName, 'event.*');

      console.log('Event Listener connected to RabbitMQ');
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
      throw error;
    }
  }

  async startListening() {
    try {
      await this.channel.consume(this.queueName, async (msg) => {
        if (msg) {
          try {
            const eventData = JSON.parse(msg.content.toString());
            console.log('Received event notification:', eventData);

            await this.processEvent(eventData);

            // Acknowledge message
            this.channel.ack(msg);
          } catch (error) {
            console.error('Error processing event:', error);
            // Reject message and requeue
            this.channel.nack(msg, false, true);
          }
        }
      }, { noAck: false });

      console.log('Event listener started, waiting for messages...');
    } catch (error) {
      console.error('Error starting event listener:', error);
      throw error;
    }
  }

  async processEvent(eventData) {
    try {
      // Validate event data
      if (!eventData.event_id || !eventData.event_type) {
        throw new Error('Invalid event data: missing event_id or event_type');
      }

      // Get webhooks for this event type from cache
      let webhooks = await this.webhookCache.getWebhooksForEventType(eventData.event_type);

      if (!webhooks) {
        console.log(`Cache miss for event type: ${eventData.event_type}, refreshing cache...`);
        // Cache miss - refresh cache and try again
        await this.webhookCache.refreshCache();
        webhooks = await this.webhookCache.getWebhooksForEventType(eventData.event_type);
      }

      if (!webhooks || webhooks.length === 0) {
        console.log(`No webhooks registered for event type: ${eventData.event_type}`);
        return;
      }

      console.log(`Found ${webhooks.length} webhooks for event type: ${eventData.event_type}`);

      // Create event object
      const event = {
        id: eventData.event_id,
        event_type: eventData.event_type,
        payload: eventData.payload,
        created_at: eventData.timestamp || new Date().toISOString(),
        idempotency_key: eventData.idempotency_key || eventData.event_id,
      };

      // Deliver to all webhooks
      const deliveryResults = await this.deliveryExecutor.deliverToWebhooks(webhooks, event);

      console.log(`Event processing completed: ${deliveryResults.successful}/${deliveryResults.total} deliveries successful`);

    } catch (error) {
      console.error('Error processing event:', error);
      throw error;
    }
  }

  async stop() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log('Event listener stopped');
    } catch (error) {
      console.error('Error stopping event listener:', error);
    }
  }

  // Health check
  async healthCheck() {
    try {
      return {
        connected: this.connection ? true : false,
        channel: this.channel ? true : false,
        queue: this.queueName,
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}

module.exports = EventListener;