-- Least-Privilege Database Users Setup
-- 
-- This script creates service-specific database users with minimal required permissions.
-- Run this script as the database root/admin user to set up the security model.
--
-- Owner: DevOps
-- Security Principle: Least Privilege

-- ============================================================================
-- Application User (for main application service)
-- ============================================================================
-- This user has read/write access to all application tables but cannot:
-- - Drop tables or databases
-- - Create new tables or databases
-- - Alter table structures
-- - Create indexes

CREATE USER IF NOT EXISTS 'app_user'@'%' IDENTIFIED BY 'CHANGE_THIS_PASSWORD';

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON selfcar_db.* TO 'app_user'@'%';

-- Explicitly revoke dangerous permissions
REVOKE DROP, CREATE, ALTER, INDEX, REFERENCES, CREATE USER, RELOAD, SHUTDOWN, PROCESS, FILE ON *.* FROM 'app_user'@'%';

-- ============================================================================
-- Read-Only User (for reporting, analytics, backups)
-- ============================================================================
-- This user can only read data, no modifications allowed

CREATE USER IF NOT EXISTS 'readonly_user'@'%' IDENTIFIED BY 'CHANGE_THIS_PASSWORD';

-- Grant only SELECT permission
GRANT SELECT ON selfcar_db.* TO 'readonly_user'@'%';

-- Explicitly deny all write permissions
REVOKE INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, INDEX, REFERENCES ON *.* FROM 'readonly_user'@'%';

-- ============================================================================
-- Analytics User (for analytics service)
-- ============================================================================
-- This user has read access to analytics tables only

CREATE USER IF NOT EXISTS 'analytics_user'@'%' IDENTIFIED BY 'CHANGE_THIS_PASSWORD';

-- Grant SELECT only on analytics-related tables
GRANT SELECT ON selfcar_db.analytics.* TO 'analytics_user'@'%';
GRANT SELECT ON selfcar_db.car_analytics TO 'analytics_user'@'%';
GRANT SELECT ON selfcar_db.financial_report TO 'analytics_user'@'%';

-- ============================================================================
-- Migration User (for database migrations only)
-- ============================================================================
-- This user has elevated permissions but should only be used during deployments
-- Should be rotated after each migration

CREATE USER IF NOT EXISTS 'migration_user'@'localhost' IDENTIFIED BY 'CHANGE_THIS_PASSWORD';

-- Grant migration permissions (only from localhost)
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX ON selfcar_db.* TO 'migration_user'@'localhost';

-- Still deny dangerous operations
REVOKE DROP, REFERENCES, CREATE USER, RELOAD, SHUTDOWN, PROCESS, FILE ON *.* FROM 'migration_user'@'localhost';

-- ============================================================================
-- Security Best Practices
-- ============================================================================
-- 
-- 1. Change all passwords above to strong, randomly generated passwords
-- 2. Store passwords in secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.)
-- 3. Rotate passwords regularly (every 90 days)
-- 4. Use different passwords for each user
-- 5. Restrict user access by IP/hostname when possible (replace '%' with specific IPs)
-- 6. Monitor database access logs for unauthorized access attempts
-- 7. Use SSL/TLS for all database connections
-- 8. Regularly audit user permissions
--
-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Show all users and their hosts
SELECT User, Host FROM mysql.user WHERE User LIKE '%_user';

-- Show permissions for app_user
SHOW GRANTS FOR 'app_user'@'%';

-- Show permissions for readonly_user
SHOW GRANTS FOR 'readonly_user'@'%';

-- Show permissions for analytics_user
SHOW GRANTS FOR 'analytics_user'@'%';

-- ============================================================================
-- Cleanup (if needed to remove users)
-- ============================================================================
-- DROP USER IF EXISTS 'app_user'@'%';
-- DROP USER IF EXISTS 'readonly_user'@'%';
-- DROP USER IF EXISTS 'analytics_user'@'%';
-- DROP USER IF EXISTS 'migration_user'@'localhost';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

