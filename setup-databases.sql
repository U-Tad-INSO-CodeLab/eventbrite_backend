-- ============================================
-- SETUP DATABASES FOR DEVELOPMENT & PRODUCTION
-- ============================================

-- DEVELOPMENT DATABASE
CREATE DATABASE IF NOT EXISTS eventbrite_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'eventbrite_dev'@'localhost' IDENTIFIED BY 'eventbrite_dev_123';
GRANT ALL PRIVILEGES ON eventbrite_dev.* TO 'eventbrite_dev'@'localhost';

-- PRODUCTION DATABASE
CREATE DATABASE IF NOT EXISTS eventbrite_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'eventbrite_prod'@'localhost' IDENTIFIED BY 'eventbrite_prod_secure_pass_change_me';
GRANT ALL PRIVILEGES ON eventbrite_prod.* TO 'eventbrite_prod'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Verify created databases and users
SHOW DATABASES;
SELECT USER, HOST FROM mysql.user WHERE USER LIKE 'eventbrite%';
