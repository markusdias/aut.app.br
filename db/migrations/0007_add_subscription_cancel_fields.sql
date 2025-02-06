-- Add subscription cancellation fields
ALTER TABLE subscriptions
ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT FALSE,
ADD COLUMN cancellation_reason TEXT,
ADD COLUMN cancel_requested_at TIMESTAMP; 