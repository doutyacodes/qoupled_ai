-- Table alterations for Qoupled AI Payment System with Razorpay Integration
-- Generated on: 2024-08-23
-- This script adds necessary tables and columns for the subscription and payment system

-- Check and create SUBSCRIPTION_PAYMENTS table if it doesn't exist
CREATE TABLE IF NOT EXISTS `subscription_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `subscription_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'INR',
  `payment_method` varchar(50) NOT NULL,
  `payment_id` varchar(255) NOT NULL,
  `status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_subscription_id` (`subscription_id`),
  KEY `idx_payment_id` (`payment_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `subscription_payments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `subscription_payments_subscription_id_fkey` FOREIGN KEY (`subscription_id`) REFERENCES `user_subscriptions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Check and create PROFILE_BOOSTS table if it doesn't exist
CREATE TABLE IF NOT EXISTS `profile_boosts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `boost_type` enum('weekly','monthly') DEFAULT 'weekly',
  `amount` decimal(10,2) NOT NULL,
  `payment_id` varchar(255) NOT NULL,
  `start_date` timestamp NOT NULL,
  `end_date` timestamp NOT NULL,
  `is_active` boolean DEFAULT true,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_active` (`is_active`),
  KEY `idx_dates` (`start_date`, `end_date`),
  CONSTRAINT `profile_boosts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Check and create DAILY_CONNECTION_USAGE table if it doesn't exist
CREATE TABLE IF NOT EXISTS `daily_connection_usage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `date` date NOT NULL,
  `connections_used` int DEFAULT 0,
  `plan_limit` int DEFAULT 5,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_date` (`user_id`, `date`),
  KEY `idx_user_date` (`user_id`, `date`),
  CONSTRAINT `daily_connection_usage_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add missing columns to existing tables

-- Add payment-related columns to USER table if they don't exist
ALTER TABLE `user` 
ADD COLUMN IF NOT EXISTS `subscription_status` enum('active','expired','cancelled','pending') DEFAULT 'expired',
ADD COLUMN IF NOT EXISTS `subscription_ends` timestamp NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `last_payment_date` timestamp NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `payment_failures` int DEFAULT 0;

-- Add indexes for better performance on USER table
CREATE INDEX IF NOT EXISTS `idx_user_subscription_status` ON `user` (`subscription_status`);
CREATE INDEX IF NOT EXISTS `idx_user_subscription_ends` ON `user` (`subscription_ends`);
CREATE INDEX IF NOT EXISTS `idx_user_current_plan` ON `user` (`current_plan`);

-- Add auto_renew and billing cycle info to USER_SUBSCRIPTIONS if not exists
ALTER TABLE `user_subscriptions`
ADD COLUMN IF NOT EXISTS `billing_cycle` enum('monthly','quarterly','annual') DEFAULT 'quarterly',
ADD COLUMN IF NOT EXISTS `next_billing_date` timestamp NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `payment_method` varchar(50) DEFAULT 'razorpay',
ADD COLUMN IF NOT EXISTS `cancelled_at` timestamp NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `cancel_reason` text NULL;

-- Add indexes for USER_SUBSCRIPTIONS
CREATE INDEX IF NOT EXISTS `idx_user_subscriptions_status` ON `user_subscriptions` (`status`);
CREATE INDEX IF NOT EXISTS `idx_user_subscriptions_dates` ON `user_subscriptions` (`start_date`, `end_date`);
CREATE INDEX IF NOT EXISTS `idx_user_subscriptions_auto_renew` ON `user_subscriptions` (`auto_renew`);
CREATE INDEX IF NOT EXISTS `idx_user_subscriptions_billing_cycle` ON `user_subscriptions` (`billing_cycle`);

-- Add features column to SUBSCRIPTION_PLANS as JSON if not exists
ALTER TABLE `subscription_plans`
ADD COLUMN IF NOT EXISTS `features_json` json NULL,
ADD COLUMN IF NOT EXISTS `max_connections_per_day` int DEFAULT -1,
ADD COLUMN IF NOT EXISTS `ai_chat_enabled` boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS `profile_verification` boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS `priority_support` boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS `weekly_boosts` int DEFAULT 0;

-- Add indexes for SUBSCRIPTION_PLANS
CREATE INDEX IF NOT EXISTS `idx_subscription_plans_active` ON `subscription_plans` (`is_active`);
CREATE INDEX IF NOT EXISTS `idx_subscription_plans_billing` ON `subscription_plans` (`billing_period`);
CREATE INDEX IF NOT EXISTS `idx_subscription_plans_price` ON `subscription_plans` (`price`);

-- Insert default subscription plans if they don't exist
INSERT IGNORE INTO `subscription_plans` (
  `plan_name`, 
  `display_name`, 
  `price`, 
  `billing_period`, 
  `currency`, 
  `features`, 
  `max_connections_per_day`,
  `ai_chat_enabled`,
  `profile_verification`,
  `priority_support`,
  `weekly_boosts`,
  `is_active`
) VALUES 
-- Free Plan
('free', 'Free Plan', 0.00, 'monthly', 'INR', 
 '{"connections_per_day": 5, "basic_matching": true, "standard_support": true}',
 5, false, false, false, 0, true),

-- Pro Plan - Quarterly
('pro', 'Pro Plan', 499.00, 'quarterly', 'INR',
 '{"connections_per_day": -1, "advanced_matching": true, "ai_chat": true, "priority_support": true}',
 -1, true, false, true, 0, true),

-- Pro Plan - Annual (20% discount)
('pro', 'Pro Plan', 1596.00, 'annual', 'INR',
 '{"connections_per_day": -1, "advanced_matching": true, "ai_chat": true, "priority_support": true, "annual_discount": "20%"}',
 -1, true, false, true, 0, true),

-- Elite Plan - Quarterly
('elite', 'Elite Plan', 999.00, 'quarterly', 'INR',
 '{"connections_per_day": -1, "advanced_matching": true, "ai_chat": true, "profile_verification": true, "priority_support": true, "weekly_boosts": 50}',
 -1, true, true, true, 50, true),

-- Elite Plan - Annual (20% discount)
('elite', 'Elite Plan', 3196.00, 'annual', 'INR',
 '{"connections_per_day": -1, "advanced_matching": true, "ai_chat": true, "profile_verification": true, "priority_support": true, "weekly_boosts": 50, "annual_discount": "20%"}',
 -1, true, true, true, 50, true);

-- Create a table for storing Razorpay order details
CREATE TABLE IF NOT EXISTS `razorpay_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `razorpay_order_id` varchar(255) NOT NULL UNIQUE,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'INR',
  `status` enum('created','attempted','paid','failed') DEFAULT 'created',
  `billing_cycle` enum('monthly','quarterly','annual') DEFAULT 'quarterly',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_razorpay_order_id` (`razorpay_order_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `razorpay_orders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `razorpay_orders_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create payment webhooks log table for Razorpay webhooks
CREATE TABLE IF NOT EXISTS `payment_webhooks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_type` varchar(100) NOT NULL,
  `razorpay_payment_id` varchar(255) NULL,
  `razorpay_order_id` varchar(255) NULL,
  `razorpay_signature` text NULL,
  `webhook_payload` json NOT NULL,
  `status` enum('received','processed','failed') DEFAULT 'received',
  `processed_at` timestamp NULL,
  `error_message` text NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_event_type` (`event_type`),
  KEY `idx_payment_id` (`razorpay_payment_id`),
  KEY `idx_order_id` (`razorpay_order_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add updated_at column to subscription_payments if not exists
ALTER TABLE `subscription_payments`
ADD COLUMN IF NOT EXISTS `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS `razorpay_payment_id` varchar(255) NULL,
ADD COLUMN IF NOT EXISTS `razorpay_order_id` varchar(255) NULL,
ADD COLUMN IF NOT EXISTS `failure_reason` text NULL;

-- Add indexes for better performance on subscription_payments
CREATE INDEX IF NOT EXISTS `idx_subscription_payments_razorpay_payment_id` ON `subscription_payments` (`razorpay_payment_id`);
CREATE INDEX IF NOT EXISTS `idx_subscription_payments_razorpay_order_id` ON `subscription_payments` (`razorpay_order_id`);

-- Update any existing free plan users to have proper subscription status
UPDATE `user` 
SET 
  `subscription_status` = 'active',
  `current_plan` = 'free'
WHERE 
  `current_plan` IS NULL 
  OR `current_plan` = ''
  OR `subscription_status` IS NULL;

-- Create a view for active subscriptions with plan details
CREATE OR REPLACE VIEW `v_active_subscriptions` AS
SELECT 
  us.id as subscription_id,
  us.user_id,
  u.username,
  u.email,
  sp.plan_name,
  sp.display_name,
  sp.price,
  sp.billing_period,
  us.start_date,
  us.end_date,
  us.auto_renew,
  us.status,
  DATEDIFF(us.end_date, NOW()) as days_remaining
FROM user_subscriptions us
JOIN user u ON us.user_id = u.id
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status = 'active'
  AND us.end_date > NOW();

-- Create a view for subscription revenue analytics
CREATE OR REPLACE VIEW `v_subscription_revenue` AS
SELECT 
  sp.plan_name,
  sp.billing_period,
  COUNT(us.id) as active_subscriptions,
  SUM(sp.price) as total_revenue,
  AVG(sp.price) as avg_revenue_per_user
FROM subscription_plans sp
LEFT JOIN user_subscriptions us ON sp.id = us.plan_id AND us.status = 'active'
WHERE sp.is_active = true
GROUP BY sp.plan_name, sp.billing_period;

-- Add comments to tables for documentation
ALTER TABLE `subscription_payments` COMMENT = 'Stores all payment transactions for subscriptions via Razorpay';
ALTER TABLE `profile_boosts` COMMENT = 'Stores profile boost purchases (₹99 weekly add-on)';
ALTER TABLE `daily_connection_usage` COMMENT = 'Tracks daily connection usage for free plan limits';
ALTER TABLE `razorpay_orders` COMMENT = 'Stores Razorpay order details for tracking payments';
ALTER TABLE `payment_webhooks` COMMENT = 'Logs all Razorpay webhook events for audit and processing';

-- Success message
SELECT 'Table alterations completed successfully! Payment system with Razorpay integration is now ready.' as message;