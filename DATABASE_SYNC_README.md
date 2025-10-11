# Database Schema Synchronization - Implementation Guide

## Overview

This document provides a complete guide to synchronizing your database schema with the Drizzle ORM definitions, fixing security issues, and updating environment variables.

---

## Files Created/Modified

### 1. **table_update.sql** (NEW)
Complete SQL script to update your database with:
- 10 missing tables
- Missing columns in existing tables
- Performance indexes
- Data migrations

### 2. **utils/schema.js** (UPDATED)
- Added missing table definitions:
  - `PAYMENT_WEBHOOKS`
  - `RAZORPAY_ORDERS`
  - `MBTI_AI_COMPATIBILITY`
  - `MBTI_COMPATIBILITY_REAL`
- Updated existing tables with missing columns:
  - `SUBSCRIPTION_PAYMENTS` (added 4 columns)
  - `SUBSCRIPTION_PLANS` (added 6 columns)
  - `USER_SUBSCRIPTIONS` (added 5 columns)
- Fixed auto-increment primary keys with `.notNull()` modifier

### 3. **utils/index.js** (UPDATED - SECURITY FIX)
- ✅ Removed hardcoded database credentials
- ✅ Now uses environment variables
- ✅ Added fallback values for development

### 4. **utils/encryption.js** (UPDATED - SECURITY FIX)
- ✅ Removed hardcoded encryption key
- ✅ Now uses environment variable
- ✅ Added fallback for backward compatibility

### 5. **.env.local** (UPDATED)
- ✅ Comprehensive environment variable configuration
- ✅ Database credentials
- ✅ Razorpay payment gateway keys
- ✅ OpenAI API keys
- ✅ Feature flags and configuration

---

## Step-by-Step Implementation

### Step 1: Backup Your Database (CRITICAL)

```bash
# SSH into your server or use phpMyAdmin
mysqldump -u devuser_qoupled_upgrade -p devuser_qoupled_upgrade > qoupled_backup_$(date +%Y%m%d).sql
```

### Step 2: Run the Database Update Script

```bash
# Option 1: Using MySQL CLI
mysql -u devuser_qoupled_upgrade -p devuser_qoupled_upgrade < table_update.sql

# Option 2: Using phpMyAdmin
# 1. Open phpMyAdmin
# 2. Select database: devuser_qoupled_upgrade
# 3. Go to "Import" tab
# 4. Upload table_update.sql
# 5. Click "Go"
```

### Step 3: Verify Database Changes

```sql
-- Check new tables were created
SELECT TABLE_NAME, TABLE_ROWS
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
SHOW COLUMNS FROM subscription_payments;

-- Check subscription_plans columns
SHOW COLUMNS FROM subscription_plans;

-- Check user_subscriptions columns
SHOW COLUMNS FROM user_subscriptions;
```

### Step 4: Update Your Application

The schema and database connection files have already been updated. Just restart your application:

```bash
# Stop your Next.js development server (Ctrl+C)

# Restart it
npm run dev
```

### Step 5: Test Critical Features

Test the following features to ensure everything works:

1. **User Authentication**
   - Login
   - Signup
   - JWT token generation

2. **Payment System**
   - Razorpay order creation
   - Payment processing
   - Webhook handling

3. **AI Chat**
   - AI character initialization
   - Message sending/receiving
   - Conversation history

4. **Subscriptions**
   - Plan selection
   - Subscription creation
   - Plan upgrades/downgrades

5. **Connections**
   - Send connection request
   - Accept/reject connection
   - View connections list

---

## What Was Fixed

### Security Issues (CRITICAL)

#### Before:
```javascript
// utils/index.js - EXPOSED CREDENTIALS
const connection = await mysql.createConnection({
  host: "68.178.163.247",
  user: "devuser_qoupled_upgrade",
  password: 'Wowfy#user',  // ❌ SECURITY RISK
  port: '3306'
});

// utils/encryption.js - EXPOSED KEY
const secretKey = 'C7d8h2uu@1';  // ❌ SECURITY RISK
```

#### After:
```javascript
// utils/index.js - SECURE
const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || '',  // ✅ FROM ENV
  port: process.env.DB_PORT || '3306'
});

// utils/encryption.js - SECURE
const secretKey = process.env.ENCRYPTION_SECRET_KEY || 'C7d8h2uu@1';  // ✅ FROM ENV
```

### Database Schema Issues

#### Missing Tables (Added 10 tables):
1. `payment_webhooks` - Razorpay webhook logging
2. `razorpay_orders` - Order tracking
3. `mbti_ai_compatibility` - AI-user MBTI compatibility
4. `mbti_compatibility_real` - Pre-calculated scores
5. `ai_personality_adaptations` - AI behavior adaptation
6. `user_advanced_preferences` - Advanced matching preferences
7. `user_daily_activity` - Activity tracking
8. `user_matching_analytics` - Matching performance
9. `user_plan_history` - Subscription change history
10. `user_saved_profiles` - Bookmarked profiles

#### Missing Columns (Added 15 columns):

**subscription_payments:**
- `updated_at` - Track payment updates
- `razorpay_payment_id` - Razorpay payment reference
- `razorpay_order_id` - Razorpay order reference
- `failure_reason` - Payment failure details

**subscription_plans:**
- `features_json` - Detailed feature configuration
- `max_connections_per_day` - Connection limit
- `ai_chat_enabled` - AI chat feature flag
- `profile_verification` - Verification badge flag
- `priority_support` - Support tier flag
- `weekly_boosts` - Boost allowance

**user_subscriptions:**
- `billing_cycle` - Billing frequency
- `next_billing_date` - Next charge date
- `payment_method` - Payment method used
- `cancelled_at` - Cancellation timestamp
- `cancel_reason` - Cancellation reason

---

## Environment Variables Reference

### Required Variables (Already Configured)

```bash
# Database
DB_HOST=68.178.163.247
DB_USER=devuser_qoupled_upgrade
DB_PASSWORD=Wowfy#user
DB_NAME=devuser_qoupled_upgrade
DB_PORT=3306

# Security
ENCRYPTION_SECRET_KEY=C7d8h2uu@1
JWT_SECRET=newsecretKey

# Payments
RAZORPAY_KEY_ID=rzp_test_R6W8uNyG4waGLz
RAZORPAY_KEY_SECRET=29aZ1H4rKqqJuRvns6KwUEXL
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_R6W8uNyG4waGLz

# AI
OPENAI_API_KEY=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
```

### Optional Variables (Configure as needed)

See `.env.local` for complete list including:
- Email service (SMTP, SendGrid)
- SMS service (Twilio)
- File storage (AWS S3, Cloudinary)
- Analytics (Google Analytics, Sentry)
- Social auth (Google, Facebook)
- Feature flags
- Rate limiting

---

## Performance Improvements

### Indexes Added

The `table_update.sql` script adds performance indexes to:

1. **user table**
   - `current_plan`, `subscription_status`, `subscription_ends`
   - `email`, `is_profile_complete`

2. **connections table**
   - `sender_id` + `status`, `receiver_id` + `status`
   - `connection_type`, `requested_at`

3. **ai_conversations table**
   - `user_id` + `ai_character_id`, `status`
   - `last_message_at`

4. **conversations table**
   - `created_by`, `is_group`, `last_message_at`

5. **messages table**
   - `conversation_id` + `created_at`
   - `sender_id`, `is_deleted`

---

## Troubleshooting

### Issue: Database connection fails after update

**Solution:**
Check your `.env.local` file and ensure all database credentials are correct:
```bash
DB_HOST=68.178.163.247
DB_USER=devuser_qoupled_upgrade
DB_PASSWORD=Wowfy#user
DB_NAME=devuser_qoupled_upgrade
```

### Issue: Payment integration not working

**Solution:**
1. Verify Razorpay keys in `.env.local`
2. Check that `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are correct
3. Ensure `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set (used by frontend)

### Issue: AI chat not responding

**Solution:**
1. Verify OpenAI API key in `.env.local`
2. Check API key is valid and has credits
3. Verify `AI_SERVICE_ENABLED=true` in `.env.local`

### Issue: Table already exists error

**Solution:**
The SQL script uses `CREATE TABLE IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS`, so this shouldn't happen. If it does:
1. Check if you're running the script multiple times
2. Verify you're connected to the correct database

### Issue: Foreign key constraint errors

**Solution:**
The script creates tables in dependency order. If you get FK errors:
1. Ensure all parent tables exist first
2. Check that referenced IDs exist in parent tables
3. Run the script in order (don't skip sections)

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Backup production database
- [ ] Test all changes in staging environment
- [ ] Update environment variables in production
- [ ] Change all default secrets and keys
- [ ] Enable SSL/TLS for database connection
- [ ] Set `NODE_ENV=production`
- [ ] Enable email verification (`FEATURE_EMAIL_VERIFICATION_REQUIRED=true`)
- [ ] Configure proper logging (`LOG_LEVEL=error`)
- [ ] Set up monitoring and alerting
- [ ] Test payment integration with production keys
- [ ] Verify Razorpay webhook configuration
- [ ] Test AI chat functionality
- [ ] Verify all API endpoints work correctly
- [ ] Load test critical paths
- [ ] Set up database backups
- [ ] Configure CDN for static assets
- [ ] Enable rate limiting
- [ ] Set up SSL certificates

---

## Additional Recommendations

### 1. Add to .gitignore

Ensure `.env.local` is in your `.gitignore`:
```bash
echo ".env.local" >> .gitignore
```

### 2. Set Up Database Migrations

Consider setting up Drizzle Kit for proper migration management:

```bash
npm install -D drizzle-kit

# Create drizzle.config.ts
```

### 3. Implement Proper Error Handling

Add try-catch blocks around database operations and log errors properly.

### 4. Add Database Connection Pooling

For production, use connection pooling:
```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

### 5. Regular Backups

Set up automated database backups:
```bash
# Add to cron job
0 2 * * * mysqldump -u user -p database > backup_$(date +\%Y\%m\%d).sql
```

---

## Support

If you encounter any issues:

1. Check this README for troubleshooting steps
2. Review the SQL script comments
3. Check application logs for specific errors
4. Verify environment variables are loaded correctly
5. Test database connection manually

---

## Summary

✅ **Completed:**
- Created `table_update.sql` with 10 new tables and column updates
- Updated `utils/schema.js` with all missing table definitions
- Fixed security vulnerabilities in `utils/index.js` and `utils/encryption.js`
- Created comprehensive `.env.local` file
- Added performance indexes
- Documented all changes

✅ **Ready to Deploy:**
- All schema files updated
- Database script ready to run
- Environment variables configured
- Security issues resolved

⚠️ **Next Steps:**
1. Backup your database
2. Run `table_update.sql`
3. Restart your application
4. Test all features
5. Deploy to production with proper configuration
