PRAGMA foreign_keys = ON;

-- Per-client, per-endpoint rolling-window counters. The bucket is a keyed
-- digest of the request IP and endpoint, not a raw IP address.
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  hits INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);
