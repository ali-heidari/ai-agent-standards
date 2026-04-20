# Copilot Instructions — webhook-manager

## Project Overview
This is a Node.js microservice using CommonJS modules, implementing the webhook delivery component of a larger event-driven platform. It handles webhook registration, caching, delivery execution, and status tracking.

## Architecture
- **Entry Point**: `main.js` - initializes p5.js visualization dashboard
- **Module System**: CommonJS (not ES modules)
- **Graphics**: Uses p5.js for real-time webhook delivery monitoring and visualization
- **Role in System**: Webhook management and delivery execution service

## Key Components (to be implemented)
- **WebhookRegistry**: Manages customer webhook registrations in Postgres
- **WebhookCache**: Redis-backed cache for event-type to webhook mappings
- **DeliveryExecutor**: Handles HTTP webhook calls with retry logic
- **StatusTracker**: Logs delivery attempts and status to Postgres
- **EventListener**: Receives event notifications from Event Manager service
- **Visualization**: p5.js dashboard for monitoring delivery status and metrics

## Dependencies
- p5.js: Canvas visualization (install via `npm install p5`)
- pg: PostgreSQL client
- redis: Redis client
- axios: HTTP client for webhook deliveries
- amqplib: RabbitMQ client for event notifications

## Development Workflow
- **Run**: `node main.js` (starts visualization dashboard)
- **Test**: Implement unit tests for delivery logic and retry mechanisms
- **Build**: No build process; use npm scripts for deployment

## Conventions
- Use async/await for all I/O operations
- Implement exponential backoff for webhook retries
- Store idempotency keys in delivery headers
- Log all delivery attempts with timestamps and responses
- Use environment variables for database and queue connections
- File structure: Modular with separate files for registry, delivery, cache, etc.

## Important Notes
- Integrate with RabbitMQ for event notifications from Event Manager
- Ensure at-least-once delivery with idempotent processing
- Implement circuit breaker pattern for failing webhooks
- Add metrics collection for delivery success rates and latency
- Project in early development; focus on core delivery reliability first