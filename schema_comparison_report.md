# Database Schema Comparison Report

## Executive Summary

- **Total tables in SQL dump**: 73
- **Total tables in Drizzle schema**: 71
- **Tables in both schemas**: 65
- **Tables only in SQL**: 8
- **Tables only in Drizzle**: 6
- **Tables with mismatches**: 58

## 1. Tables Only in SQL Dump (Missing in Drizzle Schema)

**Severity: CRITICAL** - These tables exist in the database but are not defined in the ORM schema.


### `account_creator`
- **Columns**: 3
- **Column List**:
  - `id` int NOT NULL
  - `title` varchar(200) NOT NULL
  - `created_date` timestamp NOT NULL

### `active_user_subscriptions`
- **Columns**: 1
- **Column List**:
  - `user_id` int NULL

### `mbti_ai_compatibility`
- **Columns**: 8
- **Column List**:
  - `id` int NOT NULL
  - `user_mbti_type` varchar(4) NOT NULL
  - `ai_mbti_type` varchar(4) NOT NULL
  - `compatibility_score` int NOT NULL
  - `relationship_type` enum('ideal','complementary','challenging','similar') NOT NULL
  - `description` text NULL
  - `is_active` tinyint(1) NULL
  - `created_at` timestamp NULL

### `mbti_compatibility_real`
- **Columns**: 11
- **Column List**:
  - `user_mbti` varchar(4) NULL
  - `ai_friend_1` varchar(4) NULL
  - `ai_friend_2` varchar(4) NULL
  - `ai_friend_3` varchar(4) NULL
  - `ai_friend_4` varchar(4) NULL
  - `ai_friend_5` varchar(4) NULL
  - `score_1` int NULL
  - `score_2` int NULL
  - `score_3` int NULL
  - `score_4` int NULL
  - `score_5` int NULL

### `payment_webhooks`
- **Columns**: 10
- **Column List**:
  - `id` int NOT NULL
  - `event_type` varchar(100) NOT NULL
  - `razorpay_payment_id` varchar(255) NULL
  - `razorpay_order_id` varchar(255) NULL
  - `razorpay_signature` text NULL
  - `webhook_payload` json NOT NULL
  - `status` enum('received','processed','failed') NULL
  - `processed_at` timestamp NULL
  - `error_message` text NULL
  - `created_at` timestamp NULL

### `razorpay_orders`
- **Columns**: 10
- **Column List**:
  - `id` int NOT NULL
  - `user_id` int NOT NULL
  - `plan_id` int NOT NULL
  - `razorpay_order_id` varchar(255) NOT NULL
  - `amount` decimal(10,2) NOT NULL
  - `currency` varchar(10) NULL
  - `status` enum('created','attempted','paid','failed') NULL
  - `billing_cycle` enum('monthly','quarterly','annual') NULL
  - `created_at` timestamp NULL
  - `updated_at` timestamp NULL

### `test_progress`
- **Columns**: 7
- **Column List**:
  - `progress_id` int NOT NULL
  - `user_id` int NOT NULL
  - `test_id` int NOT NULL
  - `question_id` int NOT NULL
  - `selected_answer_id` int NULL
  - `progress_timestamp` timestamp NOT NULL
  - `points_received` int NULL

### `user_current_plan_details`
- **Columns**: 1
- **Column List**:
  - `user_id` int NULL

## 2. Tables Only in Drizzle Schema (Not in Database)

**Severity: CRITICAL** - These tables are defined in the ORM but don't exist in the database.


### `ai_personality_adaptations`
- **Columns**: 11
- **Column List**:
  - `id` int NULL
  - `ai_character_id` int NOT NULL
  - `target_user_mbti_type` varchar(4) NOT NULL
  - `communication_style` json NOT NULL
  - `focus_areas` json NOT NULL
  - `approach_modifications` json NOT NULL
  - `avg_satisfaction_score` decimal(3,2) NULL
  - `total_interactions` int NULL
  - `is_active` tinyint NULL
  - `created_at` timestamp NULL
  - `updated_at` timestamp NULL

### `user_advanced_preferences`
- **Columns**: 13
- **Column List**:
  - `id` int NULL
  - `user_id` int NOT NULL
  - `max_distance` int NULL
  - `age_range_min` int NULL
  - `age_range_max` int NULL
  - `show_only_verified` tinyint NULL
  - `hide_users_with_red_flags` tinyint NULL
  - `prioritize_active_users` tinyint NULL
  - `matching_algorithm` enum NULL
  - `notification_preferences` json NULL
  - `privacy_settings` json NULL
  - `created_at` timestamp NULL
  - `updated_at` timestamp NULL

### `user_daily_activity`
- **Columns**: 9
- **Column List**:
  - `id` int NULL
  - `user_id` int NOT NULL
  - `activity_date` date NOT NULL
  - `profile_views` int NULL
  - `matches_viewed` int NULL
  - `connections_requested` int NULL
  - `messages_exchanged` int NULL
  - `time_spent_minutes` int NULL
  - `created_at` timestamp NULL

### `user_matching_analytics`
- **Columns**: 9
- **Column List**:
  - `id` int NULL
  - `user_id` int NOT NULL
  - `total_matches` int NULL
  - `total_views` int NULL
  - `total_likes` int NULL
  - `total_connections` int NULL
  - `profile_score` decimal(5,2) NULL
  - `last_updated` timestamp NULL
  - `created_at` timestamp NULL

### `user_plan_history`
- **Columns**: 7
- **Column List**:
  - `id` int NULL
  - `user_id` int NOT NULL
  - `previous_plan` enum NOT NULL
  - `new_plan` enum NOT NULL
  - `change_reason` varchar(100) NULL
  - `effective_date` timestamp NOT NULL
  - `created_at` timestamp NULL

### `user_saved_profiles`
- **Columns**: 5
- **Column List**:
  - `id` int NULL
  - `user_id` int NOT NULL
  - `saved_user_id` int NOT NULL
  - `saved_at` timestamp NULL
  - `notes` text NULL

## 3. Tables with Column Mismatches

**Severity: VARIES** - These tables exist in both schemas but have differences in columns or definitions.


### `ai_capabilities`

#### 🔄 Data Type Mismatches (CRITICAL)
- `proficiency_level`:
  - SQL: `enum('basic','intermediate','advanced','expert')`
  - Drizzle: `enum`
- `capability_type`:
  - SQL: `enum('skill','knowledge','tool','personality')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

#### ℹ️ Default Value Mismatches (INFO)
- `is_active`:
  - SQL: `'1'`
  - Drizzle: `true`

### `ai_characters`

#### 🔄 Data Type Mismatches (CRITICAL)
- `response_style`:
  - SQL: `enum('formal','casual','empathetic','analytical','creative')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

#### ℹ️ Default Value Mismatches (INFO)
- `is_active`:
  - SQL: `'1'`
  - Drizzle: `true`

### `ai_chat_sessions`

#### 🔄 Data Type Mismatches (CRITICAL)
- `preferred_response_style`:
  - SQL: `enum('brief','detailed','supportive','direct')`
  - Drizzle: `enum`
- `user_mood`:
  - SQL: `enum('happy','sad','anxious','excited','neutral')`
  - Drizzle: `enum`
- `status`:
  - SQL: `enum('active','idle','ended')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `ai_conversation_ratings`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `ai_conversations`

#### 🔄 Data Type Mismatches (CRITICAL)
- `status`:
  - SQL: `enum('active','archived','deleted')`
  - Drizzle: `enum`
- `conversation_mood`:
  - SQL: `enum('supportive','analytical','creative','casual')`
  - Drizzle: `enum`
- `conversation_type`:
  - SQL: `enum('single_ai','group_ai')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `ai_learning_data`

#### 🔄 Data Type Mismatches (CRITICAL)
- `interaction_type`:
  - SQL: `enum('message','rating','feedback','correction')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `ai_message_reactions`

#### 🔄 Data Type Mismatches (CRITICAL)
- `reaction_type`:
  - SQL: `enum('like','love','helpful','unhelpful','funny','smart')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `ai_messages`

#### 🔄 Data Type Mismatches (CRITICAL)
- `message_type`:
  - SQL: `enum('text','image','file','system','suggestion')`
  - Drizzle: `enum`
- `sender_type`:
  - SQL: `enum('user','ai')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

#### ℹ️ Default Value Mismatches (INFO)
- `is_deleted`:
  - SQL: `'0'`
  - Drizzle: `false`
- `is_edited`:
  - SQL: `'0'`
  - Drizzle: `false`
- `requires_followup`:
  - SQL: `'0'`
  - Drizzle: `false`

### `analytics_question`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `answers`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `compatibility_results`

#### ℹ️ Nullable Mismatches (WARNING)
- `result_id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `connections`

#### 🔄 Data Type Mismatches (CRITICAL)
- `connection_type`:
  - SQL: `enum('regular','premium','boosted')`
  - Drizzle: `enum`
- `status`:
  - SQL: `enum('pending','accepted','rejected','blocked')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `connection_id`:
  - SQL: NOT NULL
  - Drizzle: NULL

#### ℹ️ Default Value Mismatches (INFO)
- `is_premium_connection`:
  - SQL: `'0'`
  - Drizzle: `false`

### `conversation_participants`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

#### ℹ️ Default Value Mismatches (INFO)
- `is_muted`:
  - SQL: `'0'`
  - Drizzle: `false`
- `is_admin`:
  - SQL: `'0'`
  - Drizzle: `false`

### `conversations`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

#### ℹ️ Default Value Mismatches (INFO)
- `is_group`:
  - SQL: `'0'`
  - Drizzle: `false`

### `couples`

#### 🔄 Data Type Mismatches (CRITICAL)
- `status`:
  - SQL: `enum('pending','accepted','rejected')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL
- `status`:
  - SQL: NULL
  - Drizzle: NOT NULL

### `daily_connection_usage`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `feature_usage`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `group_chat_invitations`

#### 🔄 Data Type Mismatches (CRITICAL)
- `status`:
  - SQL: `enum('pending','accepted','rejected','delayed','expired')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `group_chat_messages`

#### 🔄 Data Type Mismatches (CRITICAL)
- `message_type`:
  - SQL: `enum('text','system','suggestion','invitation')`
  - Drizzle: `enum`
- `sender_type`:
  - SQL: `enum('user','ai')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

#### ℹ️ Default Value Mismatches (INFO)
- `is_deleted`:
  - SQL: `'0'`
  - Drizzle: `false`

### `group_chat_participants`

#### 🔄 Data Type Mismatches (CRITICAL)
- `role`:
  - SQL: `enum('admin','member')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

#### ℹ️ Default Value Mismatches (INFO)
- `is_active`:
  - SQL: `'1'`
  - Drizzle: `true`

### `group_chats`

#### 🔄 Data Type Mismatches (CRITICAL)
- `status`:
  - SQL: `enum('active','inactive','ended')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `interest_categories`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

#### ℹ️ Default Value Mismatches (INFO)
- `is_active`:
  - SQL: `'1'`
  - Drizzle: `true`

### `interests`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

#### ℹ️ Default Value Mismatches (INFO)
- `is_active`:
  - SQL: `'1'`
  - Drizzle: `true`

### `invitations`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

#### ℹ️ Default Value Mismatches (INFO)
- `compatibility_checked`:
  - SQL: `'0'`
  - Drizzle: `false`

### `mbti_compatibility`

#### 🔄 Data Type Mismatches (CRITICAL)
- `tier`:
  - SQL: `enum('great','good','average','not_ideal','bad')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `message_attachments`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `message_reactions`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `message_reads`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `messages`

#### 🔄 Data Type Mismatches (CRITICAL)
- `message_type`:
  - SQL: `enum('text','image','file','audio','video','system')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

#### ℹ️ Default Value Mismatches (INFO)
- `is_deleted`:
  - SQL: `'0'`
  - Drizzle: `false`
- `is_edited`:
  - SQL: `'0'`
  - Drizzle: `false`

### `options`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `people_pair`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `preference_categories`

#### 🔄 Data Type Mismatches (CRITICAL)
- `category_type`:
  - SQL: `enum('single','multiple','range')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

#### ℹ️ Default Value Mismatches (INFO)
- `allows_multiple`:
  - SQL: `'0'`
  - Drizzle: `false`
- `is_active`:
  - SQL: `'1'`
  - Drizzle: `true`
- `allows_any`:
  - SQL: `'0'`
  - Drizzle: `false`

### `preference_options`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

#### ℹ️ Default Value Mismatches (INFO)
- `is_any_option`:
  - SQL: `'0'`
  - Drizzle: `false`
- `is_active`:
  - SQL: `'1'`
  - Drizzle: `true`
- `includes_others`:
  - SQL: `'0'`
  - Drizzle: `false`

### `profile_boosts`

#### 🔄 Data Type Mismatches (CRITICAL)
- `boost_type`:
  - SQL: `enum('weekly','monthly')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

#### ℹ️ Default Value Mismatches (INFO)
- `is_active`:
  - SQL: `'1'`
  - Drizzle: `true`

### `questions`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `quiz_completion`

#### 🔄 Data Type Mismatches (CRITICAL)
- `completed`:
  - SQL: `enum('no','yes')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `completion_timestamp`:
  - SQL: NOT NULL
  - Drizzle: NULL
- `completion_id`:
  - SQL: NOT NULL
  - Drizzle: NULL

#### ℹ️ Default Value Mismatches (INFO)
- `isStarted`:
  - SQL: `'0'`
  - Drizzle: `false`

### `quiz_sequences`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

#### ℹ️ Default Value Mismatches (INFO)
- `type_sequence`:
  - SQL: `None`
  - Drizzle: `''`
- `isStarted`:
  - SQL: `'0'`
  - Drizzle: `false`
- `isCompleted`:
  - SQL: `'0'`
  - Drizzle: `false`

### `subscription_payments`

#### ❌ Columns in SQL but NOT in Drizzle (CRITICAL)
- `failure_reason` - text NULL
- `razorpay_order_id` - varchar(255) NULL
- `razorpay_payment_id` - varchar(255) NULL
- `updated_at` - timestamp NULL

#### 🔄 Data Type Mismatches (CRITICAL)
- `status`:
  - SQL: `enum('pending','completed','failed','refunded')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `subscription_plans`

#### ❌ Columns in SQL but NOT in Drizzle (CRITICAL)
- `ai_chat_enabled` - tinyint(1) NULL
- `features_json` - json NULL
- `max_connections_per_day` - int NULL
- `priority_support` - tinyint(1) NULL
- `profile_verification` - tinyint(1) NULL
- `weekly_boosts` - int NULL

#### 🔄 Data Type Mismatches (CRITICAL)
- `billing_period`:
  - SQL: `enum('monthly','quarterly','annual')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

#### ℹ️ Default Value Mismatches (INFO)
- `is_active`:
  - SQL: `'1'`
  - Drizzle: `true`

### `tests`

#### ℹ️ Nullable Mismatches (WARNING)
- `created_at`:
  - SQL: NOT NULL
  - Drizzle: NULL
- `test_id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `user`

#### 🔄 Data Type Mismatches (CRITICAL)
- `current_plan`:
  - SQL: `enum('free','pro','elite')`
  - Drizzle: `enum`
- `subscription_status`:
  - SQL: `enum('active','expired','trial')`
  - Drizzle: `enum`

#### ℹ️ Default Value Mismatches (INFO)
- `is_email_verified`:
  - SQL: `'0'`
  - Drizzle: `false`
- `is_profile_verified`:
  - SQL: `'0'`
  - Drizzle: `false`
- `is_profile_complete`:
  - SQL: `'0'`
  - Drizzle: `false`
- `is_verified`:
  - SQL: `'0'`
  - Drizzle: `false`
- `profile_boost_active`:
  - SQL: `'0'`
  - Drizzle: `false`
- `is_phone_verified`:
  - SQL: `'0'`
  - Drizzle: `false`

### `user_ai_friends`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

#### ℹ️ Default Value Mismatches (INFO)
- `is_active`:
  - SQL: `'1'`
  - Drizzle: `true`

### `user_ai_preferences`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `user_badges`

#### 🔄 Data Type Mismatches (CRITICAL)
- `badge_type`:
  - SQL: `enum('verified','top_tier','premium','elite')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

#### ℹ️ Default Value Mismatches (INFO)
- `is_active`:
  - SQL: `'1'`
  - Drizzle: `true`

### `user_chat_settings`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

#### ℹ️ Default Value Mismatches (INFO)
- `sound_enabled`:
  - SQL: `'1'`
  - Drizzle: `true`
- `message_preview_enabled`:
  - SQL: `'1'`
  - Drizzle: `true`
- `read_receipts_enabled`:
  - SQL: `'1'`
  - Drizzle: `true`
- `typing_indicators_enabled`:
  - SQL: `'1'`
  - Drizzle: `true`
- `notification_enabled`:
  - SQL: `'1'`
  - Drizzle: `true`

### `user_interests`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `user_matching_multi_preferences`

#### 🔄 Data Type Mismatches (CRITICAL)
- `importance`:
  - SQL: `enum('must_have','important','nice_to_have','not_important')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `user_matching_preferences`

#### 🔄 Data Type Mismatches (CRITICAL)
- `importance`:
  - SQL: `enum('must_have','important','nice_to_have','not_important')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `user_mbti_assessment`

#### 🔄 Data Type Mismatches (CRITICAL)
- `confidence_level`:
  - SQL: `enum('low','medium','high')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `user_multi_preferences`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `user_occupation`

#### 🔄 Data Type Mismatches (CRITICAL)
- `annual_income`:
  - SQL: `int`
  - Drizzle: `int(20)`

### `user_preference_values`

#### 🔄 Data Type Mismatches (CRITICAL)
- `importance`:
  - SQL: `enum('must_have','important','nice_to_have','not_important')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

#### ℹ️ Default Value Mismatches (INFO)
- `is_any_selected`:
  - SQL: `'0'`
  - Drizzle: `false`
- `is_deal_breaker`:
  - SQL: `'0'`
  - Drizzle: `false`

### `user_preferences`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `user_progress`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

#### ℹ️ Default Value Mismatches (INFO)
- `created_at`:
  - SQL: `CURRENT_TIMESTAMP`
  - Drizzle: `None`

### `user_range_preferences`

#### 🔄 Data Type Mismatches (CRITICAL)
- `importance`:
  - SQL: `enum('must_have','important','nice_to_have','not_important')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `user_red_flags`

#### ℹ️ Nullable Mismatches (WARNING)
- `created_at`:
  - SQL: NOT NULL
  - Drizzle: NULL
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

### `user_subscriptions`

#### ❌ Columns in SQL but NOT in Drizzle (CRITICAL)
- `billing_cycle` - enum('monthly','quarterly','annual') NULL
- `cancel_reason` - text NULL
- `cancelled_at` - timestamp NULL
- `next_billing_date` - timestamp NULL
- `payment_method` - varchar(50) NULL

#### 🔄 Data Type Mismatches (CRITICAL)
- `status`:
  - SQL: `enum('active','expired','cancelled','pending')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

#### ℹ️ Default Value Mismatches (INFO)
- `auto_renew`:
  - SQL: `'1'`
  - Drizzle: `true`

### `user_suggestions`

#### 🔄 Data Type Mismatches (CRITICAL)
- `status`:
  - SQL: `enum('pending','accepted','rejected','expired')`
  - Drizzle: `enum`

#### ℹ️ Nullable Mismatches (WARNING)
- `id`:
  - SQL: NOT NULL
  - Drizzle: NULL

## 4. Complete Table List

### Tables in SQL Dump
- `account_creator` (3 columns)
- `active_user_subscriptions` (1 columns)
- `ai_capabilities` (8 columns)
- `ai_characters` (18 columns)
- `ai_chat_sessions` (12 columns)
- `ai_conversation_ratings` (8 columns)
- `ai_conversations` (13 columns)
- `ai_learning_data` (10 columns)
- `ai_message_reactions` (5 columns)
- `ai_messages` (18 columns)
- `analytics_question` (3 columns)
- `answers` (4 columns)
- `compatibility_results` (5 columns)
- `connections` (8 columns)
- `conversation_participants` (8 columns)
- `conversations` (7 columns)
- `couples` (6 columns)
- `daily_connection_usage` (6 columns)
- `education_levels` (2 columns)
- `feature_usage` (8 columns)
- `group_chat_invitations` (10 columns)
- `group_chat_messages` (9 columns)
- `group_chat_participants` (7 columns)
- `group_chats` (8 columns)
- `interest_categories` (6 columns)
- `interests` (7 columns)
- `invitations` (5 columns)
- `job_titles` (2 columns)
- `languages` (3 columns)
- `mbti_ai_compatibility` (8 columns)
- `mbti_compatibility` (5 columns)
- `mbti_compatibility_real` (11 columns)
- `message_attachments` (11 columns)
- `message_reactions` (5 columns)
- `message_reads` (4 columns)
- `messages` (10 columns)
- `options` (4 columns)
- `payment_webhooks` (10 columns)
- `people_pair` (4 columns)
- `preference_categories` (11 columns)
- `preference_options` (12 columns)
- `profile_boosts` (9 columns)
- `questions` (3 columns)
- `quiz_completion` (6 columns)
- `quiz_sequences` (7 columns)
- `razorpay_orders` (10 columns)
- `subscription_payments` (14 columns)
- `subscription_plans` (15 columns)
- `test_progress` (7 columns)
- `tests` (5 columns)
- `user` (27 columns)
- `user_ai_friends` (11 columns)
- `user_ai_preferences` (7 columns)
- `user_badges` (8 columns)
- `user_chat_settings` (11 columns)
- `user_current_plan_details` (1 columns)
- `user_details` (11 columns)
- `user_education` (5 columns)
- `user_interests` (4 columns)
- `user_job` (5 columns)
- `user_languages` (4 columns)
- `user_matching_multi_preferences` (6 columns)
- `user_matching_preferences` (6 columns)
- `user_mbti_assessment` (16 columns)
- `user_multi_preferences` (5 columns)
- `user_occupation` (7 columns)
- `user_preference_values` (12 columns)
- `user_preferences` (6 columns)
- `user_progress` (6 columns)
- `user_range_preferences` (8 columns)
- `user_red_flags` (4 columns)
- `user_subscriptions` (14 columns)
- `user_suggestions` (8 columns)

### Tables in Drizzle Schema
- `ai_capabilities` (8 columns)
- `ai_characters` (18 columns)
- `ai_chat_sessions` (12 columns)
- `ai_conversation_ratings` (8 columns)
- `ai_conversations` (13 columns)
- `ai_learning_data` (10 columns)
- `ai_message_reactions` (5 columns)
- `ai_messages` (18 columns)
- `ai_personality_adaptations` (11 columns)
- `analytics_question` (3 columns)
- `answers` (4 columns)
- `compatibility_results` (5 columns)
- `connections` (8 columns)
- `conversation_participants` (8 columns)
- `conversations` (7 columns)
- `couples` (6 columns)
- `daily_connection_usage` (6 columns)
- `education_levels` (2 columns)
- `feature_usage` (8 columns)
- `group_chat_invitations` (10 columns)
- `group_chat_messages` (9 columns)
- `group_chat_participants` (7 columns)
- `group_chats` (8 columns)
- `interest_categories` (6 columns)
- `interests` (7 columns)
- `invitations` (5 columns)
- `job_titles` (2 columns)
- `languages` (3 columns)
- `mbti_compatibility` (5 columns)
- `message_attachments` (11 columns)
- `message_reactions` (5 columns)
- `message_reads` (4 columns)
- `messages` (10 columns)
- `options` (4 columns)
- `people_pair` (4 columns)
- `preference_categories` (11 columns)
- `preference_options` (12 columns)
- `profile_boosts` (9 columns)
- `questions` (3 columns)
- `quiz_completion` (6 columns)
- `quiz_sequences` (7 columns)
- `subscription_payments` (10 columns)
- `subscription_plans` (9 columns)
- `tests` (5 columns)
- `user` (27 columns)
- `user_advanced_preferences` (13 columns)
- `user_ai_friends` (11 columns)
- `user_ai_preferences` (7 columns)
- `user_badges` (8 columns)
- `user_chat_settings` (11 columns)
- `user_daily_activity` (9 columns)
- `user_details` (11 columns)
- `user_education` (5 columns)
- `user_interests` (4 columns)
- `user_job` (5 columns)
- `user_languages` (4 columns)
- `user_matching_analytics` (9 columns)
- `user_matching_multi_preferences` (6 columns)
- `user_matching_preferences` (6 columns)
- `user_mbti_assessment` (16 columns)
- `user_multi_preferences` (5 columns)
- `user_occupation` (7 columns)
- `user_plan_history` (7 columns)
- `user_preference_values` (12 columns)
- `user_preferences` (6 columns)
- `user_progress` (6 columns)
- `user_range_preferences` (8 columns)
- `user_red_flags` (4 columns)
- `user_saved_profiles` (5 columns)
- `user_subscriptions` (9 columns)
- `user_suggestions` (8 columns)

## 5. Recommendations

### Critical Issues to Address:

1. **Add 8 missing tables to Drizzle schema**
   - These tables exist in the database but are not defined in the ORM
   - This will cause issues if you try to query these tables using Drizzle

2. **Create 6 missing tables in database**
   - These tables are defined in Drizzle but don't exist in the database
   - Run migrations to create these tables

3. **Fix column mismatches in 58 tables**
   - Review each mismatch and update either the database or Drizzle schema
   - Pay special attention to type mismatches as they can cause data corruption

---

*Report generated by Database Schema Comparison Tool*