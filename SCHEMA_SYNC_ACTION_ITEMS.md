# Schema Synchronization Action Items

## Overview
This document outlines the critical actions needed to synchronize your MySQL database with your Drizzle ORM schema.

**Generated**: 2025-10-11

---

## CRITICAL: Tables Missing from Drizzle Schema (8 tables)

These tables exist in your database but are NOT defined in `utils/schema.js`. You need to add these to your Drizzle schema.

### 1. `account_creator` (3 columns)
```javascript
export const ACCOUNT_CREATOR = mysqlTable('account_creator', {
  id: int('id').autoincrement().notNull().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  created_date: timestamp('created_date').notNull(),
});
```

### 2. `active_user_subscriptions` (View/Table)
```javascript
export const ACTIVE_USER_SUBSCRIPTIONS = mysqlTable('active_user_subscriptions', {
  user_id: int('user_id'),
});
```
Note: This appears to be a view, not a table. Verify if this needs to be in schema.

### 3. `mbti_ai_compatibility` (8 columns)
```javascript
export const MBTI_AI_COMPATIBILITY = mysqlTable('mbti_ai_compatibility', {
  id: int('id').autoincrement().notNull().primaryKey(),
  user_mbti_type: varchar('user_mbti_type', { length: 4 }).notNull(),
  ai_mbti_type: varchar('ai_mbti_type', { length: 4 }).notNull(),
  compatibility_score: int('compatibility_score').notNull(),
  relationship_type: mysqlEnum('relationship_type', ['ideal', 'complementary', 'challenging', 'similar']).notNull(),
  description: text('description').default(null),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
});
```

### 4. `mbti_compatibility_real` (11 columns)
```javascript
export const MBTI_COMPATIBILITY_REAL = mysqlTable('mbti_compatibility_real', {
  user_mbti: varchar('user_mbti', { length: 4 }),
  ai_friend_1: varchar('ai_friend_1', { length: 4 }),
  ai_friend_2: varchar('ai_friend_2', { length: 4 }),
  ai_friend_3: varchar('ai_friend_3', { length: 4 }),
  ai_friend_4: varchar('ai_friend_4', { length: 4 }),
  ai_friend_5: varchar('ai_friend_5', { length: 4 }),
  score_1: int('score_1'),
  score_2: int('score_2'),
  score_3: int('score_3'),
  score_4: int('score_4'),
  score_5: int('score_5'),
});
```

### 5. `payment_webhooks` (10 columns)
```javascript
export const PAYMENT_WEBHOOKS = mysqlTable('payment_webhooks', {
  id: int('id').autoincrement().notNull().primaryKey(),
  event_type: varchar('event_type', { length: 100 }).notNull(),
  razorpay_payment_id: varchar('razorpay_payment_id', { length: 255 }),
  razorpay_order_id: varchar('razorpay_order_id', { length: 255 }),
  razorpay_signature: text('razorpay_signature'),
  webhook_payload: json('webhook_payload').notNull(),
  status: mysqlEnum('status', ['received', 'processed', 'failed']).default('received'),
  processed_at: timestamp('processed_at').default(null),
  error_message: text('error_message').default(null),
  created_at: timestamp('created_at').defaultNow(),
});
```

### 6. `razorpay_orders` (10 columns)
```javascript
export const RAZORPAY_ORDERS = mysqlTable('razorpay_orders', {
  id: int('id').autoincrement().notNull().primaryKey(),
  user_id: int('user_id').notNull().references(() => USER.id),
  plan_id: int('plan_id').notNull().references(() => SUBSCRIPTION_PLANS.id),
  razorpay_order_id: varchar('razorpay_order_id', { length: 255 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('INR'),
  status: mysqlEnum('status', ['created', 'attempted', 'paid', 'failed']).default('created'),
  billing_cycle: mysqlEnum('billing_cycle', ['monthly', 'quarterly', 'annual']),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
});
```

### 7. `test_progress` (7 columns)
```javascript
export const TEST_PROGRESS = mysqlTable('test_progress', {
  progress_id: int('progress_id').autoincrement().primaryKey(),
  user_id: int('user_id').notNull().references(() => USER_DETAILS.id),
  test_id: int('test_id').notNull().references(() => TESTS.test_id),
  question_id: int('question_id').notNull().references(() => QUESTIONS.id),
  selected_answer_id: int('selected_answer_id').references(() => ANSWERS.id).default(null),
  progress_timestamp: timestamp('progress_timestamp').defaultNow(),
  points_received: int('points_received').default(0),
});
```

### 8. `user_current_plan_details` (View/Table)
```javascript
export const USER_CURRENT_PLAN_DETAILS = mysqlTable('user_current_plan_details', {
  user_id: int('user_id'),
});
```
Note: This appears to be a view, not a table. Verify if this needs to be in schema.

---

## CRITICAL: Tables Missing from Database (6 tables)

These tables are defined in your Drizzle schema but DON'T exist in the database. You need to create migration scripts.

### 1. `ai_personality_adaptations`
- Create migration to add this table with 11 columns
- Used for AI personality adjustment based on user MBTI

### 2. `user_advanced_preferences`
- Create migration to add this table with 13 columns
- Used for advanced matching preferences (distance, age range, etc.)

### 3. `user_daily_activity`
- Create migration to add this table with 9 columns
- Used for tracking daily user activity metrics

### 4. `user_matching_analytics`
- Create migration to add this table with 9 columns
- Used for user matching analytics and profile scoring

### 5. `user_plan_history`
- Create migration to add this table with 7 columns
- Used for tracking subscription plan changes

### 6. `user_saved_profiles`
- Create migration to add this table with 5 columns
- Used for users to save/bookmark other profiles

---

## CRITICAL: Missing Columns in Existing Tables

### `subscription_payments` - Missing 4 columns in Drizzle
Add these columns to the Drizzle schema:
```javascript
failure_reason: text('failure_reason').default(null),
razorpay_order_id: varchar('razorpay_order_id', { length: 255 }),
razorpay_payment_id: varchar('razorpay_payment_id', { length: 255 }),
updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
```

### `subscription_plans` - Missing 6 columns in Drizzle
Add these columns to the Drizzle schema:
```javascript
ai_chat_enabled: boolean('ai_chat_enabled').default(false),
features_json: json('features_json').default(null),
max_connections_per_day: int('max_connections_per_day'),
priority_support: boolean('priority_support').default(false),
profile_verification: boolean('profile_verification').default(false),
weekly_boosts: int('weekly_boosts'),
```

### `user_subscriptions` - Missing 5 columns in Drizzle
Add these columns to the Drizzle schema:
```javascript
billing_cycle: mysqlEnum('billing_cycle', ['monthly', 'quarterly', 'annual']),
cancel_reason: text('cancel_reason').default(null),
cancelled_at: timestamp('cancelled_at').default(null),
next_billing_date: timestamp('next_billing_date'),
payment_method: varchar('payment_method', { length: 50 }),
```

---

## WARNING: Common Issues Across Many Tables

### 1. Auto-increment Primary Key Nullability
**58 tables** have this issue where the auto-increment primary key is marked as nullable in Drizzle but NOT NULL in SQL.

**Pattern in Drizzle:**
```javascript
id: int('id').autoincrement().primaryKey(),  // Missing .notNull()
```

**Should be:**
```javascript
id: int('id').autoincrement().notNull().primaryKey(),
```

**Affected tables:** All auto-increment primary key tables in Drizzle schema.

### 2. Boolean Default Value Format
Many tables have boolean defaults as `'0'` / `'1'` in SQL but `false` / `true` in Drizzle.

**This is OK** - Drizzle handles this conversion automatically. MySQL stores booleans as TINYINT(1).

### 3. ENUM Type Definitions
Many ENUM columns are missing their value definitions in the comparison.

**Example issue:**
```javascript
// SQL: enum('pending','accepted','rejected')
// Drizzle: enum

// Should be:
status: mysqlEnum('status', ['pending', 'accepted', 'rejected']).default('pending'),
```

Make sure all enum definitions include their possible values.

---

## Action Plan

### Step 1: Add Missing Tables to Drizzle Schema (CRITICAL)
1. Add the 8 missing table definitions to `utils/schema.js`
2. Focus on: `payment_webhooks`, `razorpay_orders`, `test_progress`, `mbti_ai_compatibility`

### Step 2: Create Database Migrations (CRITICAL)
1. Create migrations for the 6 tables that exist in Drizzle but not in DB
2. Run migrations to create these tables

### Step 3: Fix Missing Columns (CRITICAL)
1. Update `subscription_payments` table definition
2. Update `subscription_plans` table definition
3. Update `user_subscriptions` table definition

### Step 4: Fix Auto-increment Primary Keys (HIGH PRIORITY)
1. Add `.notNull()` to all auto-increment primary keys in Drizzle schema
2. This affects 58 tables

### Step 5: Verify ENUM Definitions (MEDIUM PRIORITY)
1. Review all ENUM columns
2. Ensure all enum values are properly defined in Drizzle schema

### Step 6: Run Comprehensive Tests
1. Test all database operations
2. Verify data integrity
3. Check foreign key relationships

---

## Recommended Next Steps

1. **Backup your database** before making any changes
2. Create a new branch for schema synchronization
3. Start with Step 1 (add missing tables to Drizzle)
4. Create and test migrations for Step 2
5. Fix critical column mismatches (Step 3)
6. Run full test suite
7. Deploy to staging for testing

---

## Files to Update

- **Primary file**: `D:\Shabeer\Work\DoutyaWorks\qoupled_ai\utils\schema.js`
- **Create migrations** for missing database tables
- **Test files** to verify changes

---

## Useful Commands

```bash
# Generate Drizzle migration
npx drizzle-kit generate:mysql

# Push schema to database
npx drizzle-kit push:mysql

# Check schema differences
npx drizzle-kit check:mysql
```

---

*This report was generated by comparing `qoupled.sql` with `utils/schema.js`*
*Full detailed report: `schema_comparison_report.md`*
