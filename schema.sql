-- Database schema for webhook delivery system
-- Run this script against PostgreSQL database

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id VARCHAR(255) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  event_types TEXT[] NOT NULL,
  secret VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(255) NOT NULL,
  payload JSONB NOT NULL,
  source_service VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  idempotency_key VARCHAR(255) UNIQUE
);

-- Delivery attempts table
CREATE TABLE IF NOT EXISTS delivery_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  webhook_id UUID REFERENCES webhooks(id),
  attempt_number INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(50) NOT NULL, -- pending, success, failed, retry
  http_status INTEGER,
  response_body TEXT,
  error_message TEXT,
  attempted_at TIMESTAMP DEFAULT NOW(),
  next_retry_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhooks_customer_id ON webhooks(customer_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_event_types ON webhooks USING GIN(event_types);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_delivery_attempts_event_id ON delivery_attempts(event_id);
CREATE INDEX IF NOT EXISTS idx_delivery_attempts_webhook_id ON delivery_attempts(webhook_id);
CREATE INDEX IF NOT EXISTS idx_delivery_attempts_status ON delivery_attempts(status);