# Webhook Delivery Platform - System Architecture Design

## Overview

This document outlines the architecture for a reliable webhook delivery platform that enables internal services to publish events and delivers them to third-party customer endpoints via HTTP webhooks. The system ensures at-least-once delivery, idempotent processing, and provides visibility into delivery status.

## System Components

### 1. Event Publisher (Internal Services)
**Purpose**: Internal microservices that generate business events
**Responsibilities**:
- Publish events to message queue
- Include event metadata (type, payload, timestamp, source)
**Technology**: Any language/framework, uses RabbitMQ client

### 2. RabbitMQ Message Broker
**Purpose**: Asynchronous event queuing and routing
**Responsibilities**:
- Buffer incoming events during traffic bursts
- Route events to appropriate consumers
- Provide message persistence and acknowledgments
**Configuration**:
- Exchange: `events.topic` (topic exchange)
- Queues: `event-manager.queue`, `webhook-manager.notifications`
- Routing keys: `event.{type}` (e.g., `event.order.created`)

### 3. Event Manager Service
**Purpose**: Central event ingestion and logging
**Responsibilities**:
- Consume events from RabbitMQ
- Generate unique event IDs and idempotency keys
- Store event data in PostgreSQL
- Publish event notifications to webhook delivery queue
**Technology**: Node.js, amqplib, pg
**Database Tables**:
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  event_type VARCHAR(255) NOT NULL,
  payload JSONB NOT NULL,
  source_service VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  idempotency_key VARCHAR(255) UNIQUE
);
```

### 4. Webhook Manager Service
**Purpose**: Webhook registration, caching, and delivery orchestration
**Responsibilities**:
- Provide API for customer webhook registration
- Maintain Redis cache of event-type to webhook mappings
- Consume event notifications and trigger deliveries
- Execute webhook HTTP calls with retry logic
- Track delivery status and store attempts
**Technology**: Node.js, express, redis, axios, amqplib, pg
**APIs**:
- `POST /webhooks` - Register webhook
- `GET /webhooks/{id}` - Get webhook details
- `GET /deliveries?event_id={id}` - Query delivery status
- `DELETE /webhooks/{id}` - Unregister webhook

### 5. PostgreSQL Database
**Purpose**: Persistent storage for events, webhooks, and delivery history
**Key Tables**:
```sql
CREATE TABLE webhooks (
  id UUID PRIMARY KEY,
  customer_id VARCHAR(255) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  event_types TEXT[] NOT NULL,
  secret VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE delivery_attempts (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  webhook_id UUID REFERENCES webhooks(id),
  attempt_number INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL, -- pending, success, failed, retry
  http_status INTEGER,
  response_body TEXT,
  error_message TEXT,
  attempted_at TIMESTAMP DEFAULT NOW(),
  next_retry_at TIMESTAMP
);
```

### 6. Redis Cache
**Purpose**: Fast lookup of webhooks by event type
**Data Structure**:
- Key: `webhooks:{event_type}` (e.g., `webhooks:order.created`)
- Value: JSON array of webhook objects
- TTL: 5 minutes (refresh on webhook registration changes)

## Data Flow

### Event Publishing Flow
1. Internal service publishes event to RabbitMQ `events.topic` exchange
2. Event Manager consumes event, generates UUID and idempotency key
3. Event stored in PostgreSQL `events` table
4. Event notification sent to `webhook-manager.notifications` queue

### Webhook Delivery Flow
1. Webhook Manager consumes event notification
2. Looks up relevant webhooks from Redis cache using event type
3. For each matching webhook:
   - Creates delivery attempt record in PostgreSQL
   - Makes HTTP POST to webhook URL with event payload
   - Includes idempotency key in `X-Idempotency-Key` header
   - Updates attempt status based on response
4. If delivery fails, schedules retry with exponential backoff
5. After max retries, marks as permanently failed

### Webhook Registration Flow
1. Customer calls Webhook Manager API to register webhook
2. Webhook stored in PostgreSQL `webhooks` table
3. Redis cache updated with new webhook mappings
4. Confirmation returned to customer

## Communication Patterns

### Asynchronous Messaging
- **RabbitMQ**: Primary communication between services
- **Message Types**:
  - EventPublished: `{event_id, event_type, payload}`
  - WebhookRegistered: `{webhook_id, event_types}`
  - DeliveryAttempted: `{attempt_id, status, next_retry}`

### Synchronous APIs
- **Webhook Manager REST API**: For customer interactions
- **Health Check Endpoints**: For monitoring service status

### Database Access
- **Direct SQL**: Services connect directly to PostgreSQL
- **Connection Pooling**: Use connection pools for scalability

## Reliability & Scalability

### At-Least-Once Delivery
- RabbitMQ message acknowledgments ensure events aren't lost
- Delivery attempts logged even for failures
- Idempotency keys prevent duplicate processing

### Retry Strategy
- Exponential backoff: 1s, 4s, 16s, 64s, 256s (max 5 attempts)
- Circuit breaker: Disable webhooks after 10 consecutive failures
- Manual reactivation required for disabled webhooks

### Scalability Considerations
- **Horizontal Scaling**: Multiple instances of Event Manager and Webhook Manager
- **Database Sharding**: Partition by customer_id for large-scale deployments
- **Rate Limiting**: Implement per-customer webhook call limits
- **Caching**: Redis for webhook lookups reduces database load

### Monitoring & Observability
- **Metrics**: Delivery success rate, latency, retry counts
- **Logging**: Structured logs for all delivery attempts
- **Alerts**: Notify on high failure rates or queue backlog
- **Dashboards**: Real-time visualization using p5.js in webhook-manager

## Security Considerations

- **Webhook Authentication**: HMAC signatures using customer secrets
- **Rate Limiting**: Prevent abuse and ensure fair resource usage
- **Input Validation**: Sanitize webhook URLs and event payloads
- **HTTPS Only**: Require secure webhook endpoints
- **API Authentication**: JWT tokens for customer API access

## Deployment Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│ Internal        │───▶│   RabbitMQ   │───▶│  Event Manager  │
│ Services        │    │   Broker     │    │   Service       │
└─────────────────┘    └──────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Customers     │◀───│ Webhook      │◀───│   Redis Cache   │
│   (Endpoints)   │    │ Manager      │    │                 │
└─────────────────┘    │ Service      │    └─────────────────┘
                       └─────────────────┘          ▲
                              │                     │
                              ▼                     │
                       ┌─────────────────┐          │
                       │ PostgreSQL DB  │◀─────────┘
                       └─────────────────┘
```

## Implementation Roadmap

### Phase 1: Core Infrastructure
- Set up RabbitMQ, PostgreSQL, Redis
- Implement Event Manager service
- Basic webhook registration API

### Phase 2: Delivery Engine
- Implement webhook delivery logic
- Add retry mechanisms
- Status tracking and querying

### Phase 3: Reliability & Monitoring
- Circuit breakers and rate limiting
- Comprehensive logging and metrics
- p5.js visualization dashboard

### Phase 4: Advanced Features
- Bulk webhook operations
- Event filtering and transformation
- Multi-region deployment support