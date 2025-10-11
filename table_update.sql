-- ============================================
-- DATABASE SCHEMA UPDATE SCRIPT
-- ============================================
-- Purpose: Add missing tables and alter existing tables to sync with database
-- Database: devuser_qoupled_upgrade
-- Generated: 2025-10-11
-- ============================================

USE devuser_qoupled_upgrade;

-- ============================================
-- SECTION 1: CREATE MISSING TABLES
-- ============================================

-- Table: payment_webhooks
-- Description: Logs all Razorpay webhook events for audit and processing
CREATE TABLE  `payment_webhooks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_type` varchar(100) NOT NULL,
  `razorpay_payment_id` varchar(255) DEFAULT NULL,
  `razorpay_order_id` varchar(255) DEFAULT NULL,
  `razorpay_signature` text,
  `webhook_payload` json NOT NULL,
  `status` enum('received','processed','failed') DEFAULT 'received',
  `processed_at` timestamp NULL DEFAULT NULL,
  `error_message` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_razorpay_payment_id` (`razorpay_payment_id`),
  KEY `idx_razorpay_order_id` (`razorpay_order_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Logs all Razorpay webhook events for audit and processing';

-- Table: razorpay_orders
-- Description: Stores Razorpay order details for tracking payments
CREATE TABLE  `razorpay_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `razorpay_order_id` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'INR',
  `status` enum('created','attempted','paid','failed') DEFAULT 'created',
  `billing_cycle` enum('monthly','quarterly','annual') DEFAULT 'quarterly',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_razorpay_order` (`razorpay_order_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_plan_id` (`plan_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_razorpay_orders_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_razorpay_orders_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Stores Razorpay order details for tracking payments';

-- Table: mbti_ai_compatibility
-- Description: Maps MBTI compatibility between users and AI characters
CREATE TABLE  `mbti_ai_compatibility` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_mbti_type` varchar(4) NOT NULL,
  `ai_mbti_type` varchar(4) NOT NULL,
  `compatibility_score` int NOT NULL,
  `relationship_type` enum('ideal','complementary','challenging','similar') NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_mbti_pair` (`user_mbti_type`, `ai_mbti_type`),
  KEY `idx_user_mbti` (`user_mbti_type`),
  KEY `idx_ai_mbti` (`ai_mbti_type`),
  KEY `idx_compatibility_score` (`compatibility_score`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Maps MBTI compatibility between users and AI characters';

-- Table: mbti_compatibility_real
-- Description: Stores pre-calculated MBTI compatibility scores for AI friends
CREATE TABLE  `mbti_compatibility_real` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_mbti` varchar(4) NOT NULL,
  `ai_friend_1` varchar(4) DEFAULT NULL,
  `ai_friend_2` varchar(4) DEFAULT NULL,
  `ai_friend_3` varchar(4) DEFAULT NULL,
  `ai_friend_4` varchar(4) DEFAULT NULL,
  `ai_friend_5` varchar(4) DEFAULT NULL,
  `score_1` int DEFAULT NULL,
  `score_2` int DEFAULT NULL,
  `score_3` int DEFAULT NULL,
  `score_4` int DEFAULT NULL,
  `score_5` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_mbti` (`user_mbti`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Stores pre-calculated MBTI compatibility scores for AI friends';

-- Table: ai_personality_adaptations
-- Description: How AI adjusts communication based on user MBTI type
CREATE TABLE  `ai_personality_adaptations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ai_character_id` int NOT NULL,
  `target_user_mbti_type` varchar(4) NOT NULL,
  `communication_style` json NOT NULL COMMENT 'How to adjust tone, pace, etc.',
  `focus_areas` json NOT NULL COMMENT 'What topics to emphasize',
  `approach_modifications` json NOT NULL COMMENT 'How to modify standard approach',
  `avg_satisfaction_score` decimal(3,2) DEFAULT '0.00',
  `total_interactions` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_ai_user_mbti` (`ai_character_id`, `target_user_mbti_type`),
  CONSTRAINT `fk_ai_adaptations_character` FOREIGN KEY (`ai_character_id`) REFERENCES `ai_characters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='AI personality adaptation settings based on user MBTI';

-- Table: user_advanced_preferences
-- Description: Advanced matching and privacy preferences for users
CREATE TABLE  `user_advanced_preferences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `max_distance` int DEFAULT '50' COMMENT 'Maximum distance in km',
  `age_range_min` int DEFAULT '18',
  `age_range_max` int DEFAULT '35',
  `show_only_verified` tinyint(1) DEFAULT '0',
  `hide_users_with_red_flags` tinyint(1) DEFAULT '0',
  `prioritize_active_users` tinyint(1) DEFAULT '1',
  `matching_algorithm` enum('personality','compatibility','hybrid') DEFAULT 'hybrid',
  `notification_preferences` json DEFAULT NULL,
  `privacy_settings` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_preferences` (`user_id`),
  CONSTRAINT `fk_advanced_prefs_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Advanced matching and privacy preferences';

-- Table: user_daily_activity
-- Description: Tracks daily user activity for analytics
CREATE TABLE  `user_daily_activity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `activity_date` date NOT NULL,
  `profile_views` int DEFAULT '0',
  `matches_viewed` int DEFAULT '0',
  `connections_requested` int DEFAULT '0',
  `messages_exchanged` int DEFAULT '0',
  `time_spent_minutes` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_date` (`user_id`, `activity_date`),
  KEY `idx_activity_date` (`activity_date`),
  CONSTRAINT `fk_daily_activity_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Daily user activity tracking';

-- Table: user_matching_analytics
-- Description: User matching performance analytics
CREATE TABLE  `user_matching_analytics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `total_matches` int DEFAULT '0',
  `total_views` int DEFAULT '0',
  `total_likes` int DEFAULT '0',
  `total_connections` int DEFAULT '0',
  `profile_score` decimal(5,2) DEFAULT '0.00',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_analytics` (`user_id`),
  CONSTRAINT `fk_matching_analytics_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='User matching performance analytics';

-- Table: user_plan_history
-- Description: Track user subscription plan changes
CREATE TABLE  `user_plan_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `previous_plan` enum('free','pro','elite') NOT NULL,
  `new_plan` enum('free','pro','elite') NOT NULL,
  `change_reason` varchar(100) DEFAULT NULL,
  `effective_date` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_effective_date` (`effective_date`),
  CONSTRAINT `fk_plan_history_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='User plan change history';

-- Table: user_saved_profiles
-- Description: User bookmarked/saved profiles
CREATE TABLE  `user_saved_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `saved_user_id` int NOT NULL,
  `saved_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_saved` (`user_id`, `saved_user_id`),
  KEY `idx_saved_user` (`saved_user_id`),
  CONSTRAINT `fk_saved_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_saved_profiles_saved_user` FOREIGN KEY (`saved_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='User bookmarked profiles';

-- ============================================
-- SECTION 2: ALTER EXISTING TABLES - ADD MISSING COLUMNS
-- ============================================

-- Update subscription_payments table
-- Add missing Razorpay and tracking columns
ALTER TABLE `subscription_payments`
  ADD COLUMN  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`,
  ADD COLUMN  `razorpay_payment_id` varchar(255) DEFAULT NULL AFTER `payment_id`,
  ADD COLUMN  `razorpay_order_id` varchar(255) DEFAULT NULL AFTER `razorpay_payment_id`,
  ADD COLUMN  `failure_reason` text AFTER `razorpay_order_id`,
  ADD KEY  `idx_razorpay_payment_id` (`razorpay_payment_id`),
  ADD KEY  `idx_razorpay_order_id` (`razorpay_order_id`);

-- Update subscription_plans table
-- Add missing feature flags and limits
ALTER TABLE `subscription_plans`
  ADD COLUMN  `features_json` json DEFAULT NULL COMMENT 'Detailed features configuration' AFTER `features`,
  ADD COLUMN  `max_connections_per_day` int DEFAULT '-1' COMMENT '-1 means unlimited' AFTER `features_json`,
  ADD COLUMN  `ai_chat_enabled` tinyint(1) DEFAULT '0' AFTER `max_connections_per_day`,
  ADD COLUMN  `profile_verification` tinyint(1) DEFAULT '0' AFTER `ai_chat_enabled`,
  ADD COLUMN  `priority_support` tinyint(1) DEFAULT '0' AFTER `profile_verification`,
  ADD COLUMN  `weekly_boosts` int DEFAULT '0' AFTER `priority_support`;

-- Update user_subscriptions table
-- Add billing and cancellation tracking columns
ALTER TABLE `user_subscriptions`
  ADD COLUMN  `billing_cycle` enum('monthly','quarterly','annual') DEFAULT 'quarterly' AFTER `auto_renew`,
  ADD COLUMN  `next_billing_date` timestamp NULL DEFAULT NULL AFTER `billing_cycle`,
  ADD COLUMN  `payment_method` varchar(50) DEFAULT 'razorpay' AFTER `next_billing_date`,
  ADD COLUMN  `cancelled_at` timestamp NULL DEFAULT NULL AFTER `payment_method`,
  ADD COLUMN  `cancel_reason` text AFTER `cancelled_at`,
  ADD KEY  `idx_next_billing_date` (`next_billing_date`),
  ADD KEY  `idx_cancelled_at` (`cancelled_at`);

-- ============================================
-- SECTION 3: UPDATE INDEXES FOR PERFORMANCE
-- ============================================

-- Add missing indexes to existing tables if they don't exist

-- user table indexes
ALTER TABLE `user`
  ADD KEY  `idx_current_plan` (`current_plan`),
  ADD KEY  `idx_subscription_status` (`subscription_status`),
  ADD KEY  `idx_subscription_ends` (`subscription_ends`),
  ADD KEY  `idx_email` (`email`),
  ADD KEY  `idx_is_profile_complete` (`is_profile_complete`);

-- connections table indexes
ALTER TABLE `connections`
  ADD KEY  `idx_sender_status` (`sender_id`, `status`),
  ADD KEY  `idx_receiver_status` (`receiver_id`, `status`),
  ADD KEY  `idx_connection_type` (`connection_type`),
  ADD KEY  `idx_requested_at` (`requested_at`);

-- ai_conversations indexes
ALTER TABLE `ai_conversations`
  ADD KEY  `idx_user_character` (`user_id`, `ai_character_id`),
  ADD KEY  `idx_status` (`status`),
  ADD KEY  `idx_last_message_at` (`last_message_at`);

-- conversations indexes
ALTER TABLE `conversations`
  ADD KEY  `idx_created_by` (`created_by`),
  ADD KEY  `idx_is_group` (`is_group`),
  ADD KEY  `idx_last_message_at` (`last_message_at`);

-- messages indexes
ALTER TABLE `messages`
  ADD KEY  `idx_conversation_created` (`conversation_id`, `created_at`),
  ADD KEY  `idx_sender_id` (`sender_id`),
  ADD KEY  `idx_is_deleted` (`is_deleted`);

-- ============================================
-- SECTION 4: DATA MIGRATION & INTEGRITY CHECKS
-- ============================================

-- Update existing subscription_plans records with new column defaults
UPDATE `subscription_plans`
SET
  `max_connections_per_day` = CASE
    WHEN `plan_name` = 'free' THEN 5
    WHEN `plan_name` IN ('pro', 'elite') THEN -1
    ELSE -1
  END,
  `ai_chat_enabled` = CASE
    WHEN `plan_name` IN ('pro', 'elite') THEN 1
    ELSE 0
  END,
  `profile_verification` = CASE
    WHEN `plan_name` = 'elite' THEN 1
    ELSE 0
  END,
  `priority_support` = CASE
    WHEN `plan_name` IN ('pro', 'elite') THEN 1
    ELSE 0
  END,
  `weekly_boosts` = CASE
    WHEN `plan_name` = 'elite' THEN 50
    ELSE 0
  END
WHERE `max_connections_per_day` IS NULL OR `ai_chat_enabled` IS NULL;

-- Sync user_subscriptions billing_cycle from plan defaults
UPDATE `user_subscriptions` us
INNER JOIN `subscription_plans` sp ON us.plan_id = sp.id
SET us.billing_cycle = sp.billing_period
WHERE us.billing_cycle IS NULL;

-- ============================================
-- SECTION 5: VERIFICATION QUERIES
-- ============================================

-- Run these queries to verify the updates were successful:

/*
-- Check new tables were created
SELECT TABLE_NAME, TABLE_ROWS, CREATE_TIME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'devuser_qoupled_upgrade'
  AND TABLE_NAME IN (
    'payment_webhooks',
    'razorpay_orders',
    'mbti_ai_compatibility',
    'mbti_compatibility_real',
    'ai_personality_adaptations',
    'user_advanced_preferences',
    'user_daily_activity',
    'user_matching_analytics',
    'user_plan_history',
    'user_saved_profiles'
  );

-- Check subscription_payments columns
SHOW COLUMNS FROM `subscription_payments`;

-- Check subscription_plans columns
SHOW COLUMNS FROM `subscription_plans`;

-- Check user_subscriptions columns
SHOW COLUMNS FROM `user_subscriptions`;

-- Check indexes were added
SHOW INDEXES FROM `user`;
SHOW INDEXES FROM `connections`;
SHOW INDEXES FROM `ai_conversations`;

-- Verify data integrity
SELECT COUNT(*) as total_plans,
       SUM(CASE WHEN max_connections_per_day IS NOT NULL THEN 1 ELSE 0 END) as plans_with_limits
FROM subscription_plans;
*/

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
SELECT 'Database schema update completed successfully!' as status,
       NOW() as completed_at;
