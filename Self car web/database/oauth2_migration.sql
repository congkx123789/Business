-- OAuth2 Migration Script for SelfCar Database
-- Run this to add OAuth2 support to existing database

USE selfcar_db;

-- Add OAuth2 columns to users table
ALTER TABLE users 
ADD COLUMN oauth_provider VARCHAR(50) NULL COMMENT 'OAuth provider: google, github, facebook, or null for local',
ADD COLUMN oauth_provider_id VARCHAR(255) NULL COMMENT 'Provider-specific user ID';

-- Make phone and password nullable for OAuth users
ALTER TABLE users 
MODIFY COLUMN phone VARCHAR(20) NULL,
MODIFY COLUMN password VARCHAR(255) NULL;

-- Add index for OAuth lookups
CREATE INDEX idx_oauth_provider ON users(oauth_provider, oauth_provider_id);

-- Update existing users to have 'local' as provider (optional)
-- UPDATE users SET oauth_provider = 'local' WHERE oauth_provider IS NULL;

-- Verify changes
DESCRIBE users;

