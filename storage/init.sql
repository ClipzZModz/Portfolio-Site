CREATE TABLE IF NOT EXISTS app_meta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(255) NOT NULL UNIQUE,
  value_text TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NULL,
  company VARCHAR(255) NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(100) NULL,
  message TEXT NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visit_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visitor_id CHAR(36) NULL,
  path VARCHAR(255) NOT NULL,
  query_string TEXT NULL,
  referrer TEXT NULL,
  utm_source VARCHAR(255) NULL,
  utm_medium VARCHAR(255) NULL,
  utm_campaign VARCHAR(255) NULL,
  utm_term VARCHAR(255) NULL,
  utm_content VARCHAR(255) NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_visit_events_created_at (created_at),
  INDEX idx_visit_events_visitor_id (visitor_id),
  INDEX idx_visit_events_utm_source (utm_source),
  INDEX idx_visit_events_utm_campaign (utm_campaign)
);

CREATE TABLE IF NOT EXISTS visitor_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visitor_id CHAR(36) NULL,
  event_type VARCHAR(50) NOT NULL,
  event_name VARCHAR(255) NULL,
  path VARCHAR(255) NOT NULL,
  referrer TEXT NULL,
  data_json TEXT NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_visitor_events_created_at (created_at),
  INDEX idx_visitor_events_visitor_id (visitor_id),
  INDEX idx_visitor_events_event_type (event_type)
);
