import { boolean, date, datetime, decimal, float, int, mysqlEnum, mysqlTable, primaryKey, text, time, timestamp, unique, varchar, year,json, uniqueIndex, index  } from "drizzle-orm/mysql-core";

export const USER_DETAILS = mysqlTable('user_details', {
    id: int('id').notNull().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    dob: date('dob').notNull(),
    gender: varchar('gender', { length: 50 }).notNull(),
    location: varchar('location', { length: 255 }).notNull(),
    education: varchar('education', { length: 255 }).notNull(),
    religion: varchar('religion', { length: 100 }).notNull(),
    height: int('height').notNull(),
    weight: int('weight').notNull(),
    university: varchar('university', { length: 50 }).notNull(),
    citizenship: varchar('citizenship', { length: 20 }).notNull()
});


export const EDUCATION_LEVELS = mysqlTable('education_levels', {
  id: int('id').notNull().primaryKey().autoincrement(),
  levelName: varchar('level_name', { length: 255 }).notNull().unique(),
});

export const USER_EDUCATION = mysqlTable('user_education', {
  id: int('id').notNull().primaryKey().autoincrement(),
  user_id: int('user_id').notNull(),
  education_level_id: int('education_level_id').notNull().references(() => EDUCATION_LEVELS.id),
  degree: varchar('degree', { length: 255 }).notNull(),
  graduationYear: year('graduation_year').default(null)
});

export const JOB_TITLES = mysqlTable('job_titles', {
  id: int('id').notNull().primaryKey().autoincrement(),
  title: varchar('title', { length: 150 }).notNull().unique(),
});

export const USER_JOB = mysqlTable('user_job', {
  id: int('id').notNull().primaryKey().autoincrement(),
  user_id: int('user_id').notNull(),
  job_title_id: int('job_title_id').notNull().references(() => JOB_TITLES.id),
  // jobTitle: varchar('job_title', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }).default(null),
  location: varchar('location', { length: 255 }).default(null)
});

export const USER_LANGUAGES = mysqlTable('user_languages', {
    id: int('id').notNull().primaryKey(),
    user_id: int('user_id').notNull(),
    language_id: int('language_id').notNull(),
    created_at: timestamp('created_at').notNull().defaultNow()
}); 

export const USER_OCCUPATION = mysqlTable('user_occupation', {
    id: int('id').notNull().primaryKey(),
    user_id: int('user_id').notNull(),
    place: varchar('place', { length: 255 }).notNull(),
    empt_type: varchar('empt_type', { length: 100 }).notNull(),
    emp_name: varchar('emp_name', { length: 255 }).default(null),
    emp_nature: varchar('emp_nature', { length: 255 }).notNull(),
    annual_income: int('annual_income', { length: 20 }).notNull()
});

export const LANGUAGES = mysqlTable('languages', {
    id: int('id').notNull().primaryKey(),
    title: varchar('title', { length: 256 }).notNull(),
    created_at: timestamp('created_at').notNull().defaultNow()
});

export const ACCOUNT_CREATOR= mysqlTable('account_creator',{
    id:int('id').autoincrement().notNull().primaryKey(),
    title:varchar('title',{length:200}).notNull(),
    created_date: datetime('created_at').notNull(),
});

export const ANALYTICS_QUESTION = mysqlTable('analytics_question', {
    id: int('id').primaryKey().autoincrement(),
    question_text: varchar('question_text', { length: 300 }).notNull(),
    quiz_id: int('quiz_id').notNull(),
});

export const OPTIONS = mysqlTable('options', {
    id: int('id').primaryKey().autoincrement(),
    option_text: varchar('option_text', { length: 300 }).notNull(),
    analytic_id: int('analytic_id').notNull(),
    question_id: int('question_id').notNull(),
});

export const QUIZ_SEQUENCES = mysqlTable('quiz_sequences', {
    id: int('id').primaryKey().autoincrement(),
    type_sequence: text('type_sequence').notNull().default(''),
    user_id: int('user_id').notNull(),
    quiz_id: int('quiz_id').notNull(), 
    createddate: datetime('createddate').notNull(),
    isCompleted: boolean('isCompleted').notNull().default(false), 
    isStarted: boolean('isStarted').notNull().default(false),    
});

export const MBTI_COMPATIBILITY = mysqlTable('mbti_compatibility', {
  id: int('id').primaryKey().autoincrement(),
  mbtiType: varchar('mbti_type', { length: 4 }).notNull(),
  compatibleType: varchar('compatible_type', { length: 4 }).notNull(),
  tier: mysqlEnum('tier', ['great', 'good', 'average', 'not_ideal', 'bad']).notNull(),
  match_order: int('match_order').notNull(),
}, (table) => ({
  uniqueMbtiMatch: unique().on(table.mbtiType, table.compatibleType),
}));

export const USER_PROGRESS = mysqlTable('user_progress', {
    id: int('id').primaryKey().autoincrement(),
    user_id: int('user_id').notNull(),
    question_id: int('question_id').notNull(),
    option_id: int('option_id').notNull(),
    analytic_id: int('analytic_id').notNull(),
    created_at: datetime('created_at').notNull(),
});

export const TESTS = mysqlTable('tests', {
    test_id: int('test_id').autoincrement().primaryKey(),
    test_name: varchar('test_name', { length: 255 }).notNull(),  
    description: text('description').default(null), 
    total_questions: int('total_questions').notNull(),
    created_at: timestamp('created_at').defaultNow(),
  });

export const QUESTIONS = mysqlTable('questions', {
    id: int('id').autoincrement().primaryKey(), 
    questionText: varchar('question_text', { length: 255 }).notNull(),
    test_id: int('test_id').notNull().references(() => TESTS.test_id),
  
  });

  export const ANSWERS = mysqlTable('answers', {
    id: int('id').autoincrement().primaryKey(),  // Auto-incrementing primary key for answers
    question_id: int('question_id').notNull().references(() => QUESTIONS.id),  // Foreign key to the questions table
    answerText: varchar('answer_text', { length: 255 }).notNull(),  // Answer text
    points: int('points').notNull(),  // Points for each answer
});

export const QUIZ_COMPLETION = mysqlTable('quiz_completion', {
    completion_id: int('completion_id').autoincrement().primaryKey(),  
    user_id: int('user_id').notNull().references(() => USER_DETAILS.id),
    test_id: int('test_id').notNull().references(() => TESTS.test_id),
    isStarted: boolean('isStarted').notNull().default(false), 
    completed: mysqlEnum('completed', ['no', 'yes']).notNull().default('no'),
    completion_timestamp: timestamp('completion_timestamp').defaultNow(),
});

export const COMPATIBILITY_RESULTS = mysqlTable('compatibility_results', {
    result_id: int('result_id').autoincrement().primaryKey(),  // Auto-incrementing primary key for results
    test_id: int('test_id').notNull().references(() => TESTS.test_id),  
    user_1_id: int('user_1_id').notNull().references(() => USER.id),
    user_2_id: int('user_2_id').notNull().references(() => USER.id), 
    compatibilityScore: int('compatibility_score').default(0), 
});

export const TEST_PROGRESS  = mysqlTable('test_progress', {
    progress_id: int('progress_id').autoincrement().primaryKey(), // Auto-incrementing primary key for progress
    user_id: int('user_id').notNull().references(() => USER_DETAILS.id), // Reference to the user taking the test
    test_id: int('test_id').notNull().references(() => TESTS.test_id),
    question_id: int('question_id').notNull().references(() => QUESTIONS.id), // Reference to the current question
    selected_answer_id: int('selected_answer_id').references(() => ANSWERS.id).default(null), // Optional: Reference to the selected answer
    points_received: int('points_received').default(0), // New field to store points the user got for the question
    progress_timestamp: timestamp('progress_timestamp').defaultNow(), // Timestamp for each progress entry
  });

  export const INVITATIONS = mysqlTable('invitations', {
    id: int('id').autoincrement().primaryKey(),
    user_id: int('user_id').notNull().references(() => USER.id), // ID of the invited user
    inviter_id: int('inviter_id').notNull().references(() => USER.id), // ID of the user who shared the link
    compatibility_checked: boolean('compatibility_checked').notNull().default(false), // Whether compatibility was checked
    created_at: timestamp('created_at').defaultNow(),
  });

  export const COUPLES = mysqlTable('couples', {
    id: int('id').autoincrement().primaryKey(),
    user_id: int('user_id').notNull().references(() => USER.id), // Reference to the user who sent the request
    couple_id: int('couple_id').notNull().references(() => USER.id), // Reference to the user receiving the request
    status: mysqlEnum('status', ['pending', 'accepted', 'rejected']).notNull().default('pending'), // Status of the couple request
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const PEOPLE_PAIR = mysqlTable('people_pair', {
    id: int('id').autoincrement().primaryKey(),
    pair1: varchar('pair1', { length: 4 }).notNull(),
    pair2: varchar('pair2', { length: 4 }).notNull(),
    description: text('description').default(null)
  });

  export const USER_RED_FLAGS = mysqlTable('user_red_flags', {
    id: int('id').autoincrement().primaryKey(),
    user_id: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
    answer_id: int('answer_id').notNull().references(() => ANSWERS.id, { onDelete: 'cascade' }),
    created_at: timestamp('created_at').defaultNow()
  }, (table) => {
    return {
      userAnswerUnique: unique('user_answer_unique').on(table.user_id, table.answer_id)
    }
  });



export const CONVERSATIONS = mysqlTable('conversations', {
  id: int('id').autoincrement().primaryKey(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
  last_message_at: timestamp('last_message_at').defaultNow(),
  is_group: boolean('is_group').default(false),    // For future extension to group chats
  name: varchar('name', { length: 100 }).default(null),  // For group chats
  created_by: int('created_by').notNull().references(() => USER.id, { onDelete: 'cascade' }),
});


export const CONVERSATION_PARTICIPANTS = mysqlTable('conversation_participants', {
  id: int('id').autoincrement().primaryKey(),
  conversation_id: int('conversation_id').notNull().references(() => CONVERSATIONS.id, { onDelete: 'cascade' }),
  user_id: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  joined_at: timestamp('joined_at').defaultNow(),
  left_at: timestamp('left_at').default(null),  // If user left the conversation
  is_admin: boolean('is_admin').default(false), // For group chats
  is_muted: boolean('is_muted').default(false),
  last_read_at: timestamp('last_read_at').default(null), // When user last read the conversation
}, (table) => {
  return {
    // Ensure a user can only be in a conversation once (currently active)
    userConvoUnique: unique('user_convo_unique').on(table.conversation_id, table.user_id)
  };
});


export const MESSAGES = mysqlTable('messages', {
  id: int('id').autoincrement().primaryKey(),
  conversation_id: int('conversation_id').notNull().references(() => CONVERSATIONS.id, { onDelete: 'cascade' }),
  sender_id: int('sender_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  content: text('content').default(null),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
  is_edited: boolean('is_edited').default(false),
  is_deleted: boolean('is_deleted').default(false),
  reply_to_id: int('reply_to_id').references(() => MESSAGES.id).default(null), // For reply functionality
  message_type: mysqlEnum('message_type', ['text', 'image', 'file', 'audio', 'video', 'system']).default('text'),
});

export const MESSAGE_ATTACHMENTS = mysqlTable('message_attachments', {
  id: int('id').autoincrement().primaryKey(),
  message_id: int('message_id').notNull().references(() => MESSAGES.id, { onDelete: 'cascade' }),
  file_name: varchar('file_name', { length: 255 }).notNull(),
  file_path: varchar('file_path', { length: 500 }).notNull(),
  file_type: varchar('file_type', { length: 100 }).notNull(), // MIME type
  file_size: int('file_size').notNull(),  // Size in bytes
  created_at: timestamp('created_at').defaultNow(),
  width: int('width').default(null),      // For images/videos
  height: int('height').default(null),    // For images/videos
  duration: float('duration').default(null), // For audio/video in seconds
  thumbnail_path: varchar('thumbnail_path', { length: 500 }).default(null), // For preview
});

export const MESSAGE_READS = mysqlTable('message_reads', {
  id: int('id').autoincrement().primaryKey(),
  message_id: int('message_id').notNull().references(() => MESSAGES.id, { onDelete: 'cascade' }),
  user_id: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  read_at: timestamp('read_at').defaultNow(),
}, (table) => {
  return {
    // Ensure a message is only marked as read once per user
    messageReadUnique: unique('message_read_unique').on(table.message_id, table.user_id)
  };
});

export const MESSAGE_REACTIONS = mysqlTable('message_reactions', {
  id: int('id').autoincrement().primaryKey(),
  message_id: int('message_id').notNull().references(() => MESSAGES.id, { onDelete: 'cascade' }),
  user_id: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  reaction: varchar('reaction', { length: 50 }).notNull(), // Emoji or reaction code
  created_at: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    // Ensure a user can only have one reaction per message
    userReactionUnique: unique('user_reaction_unique').on(table.message_id, table.user_id)
  };
});

export const USER_CHAT_SETTINGS = mysqlTable('user_chat_settings', {
  id: int('id').autoincrement().primaryKey(),
  user_id: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }).unique(),
  notification_enabled: boolean('notification_enabled').default(true),
  sound_enabled: boolean('sound_enabled').default(true),
  muted_until: timestamp('muted_until').default(null), // Temporarily mute all notifications
  theme: varchar('theme', { length: 50 }).default('light'),
  message_preview_enabled: boolean('message_preview_enabled').default(true),
  read_receipts_enabled: boolean('read_receipts_enabled').default(true),
  typing_indicators_enabled: boolean('typing_indicators_enabled').default(true),
  last_active_at: timestamp('last_active_at').default(null),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
});



// User's own preferences (about themselves)
export const USER_PREFERENCES = mysqlTable('user_preferences', {
  id: int('id').primaryKey().autoincrement(),
  user_id: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  category_id: int('category_id').notNull().references(() => PREFERENCE_CATEGORIES.id, { onDelete: 'cascade' }),
  option_id: int('option_id').notNull().references(() => PREFERENCE_OPTIONS.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => {
  return {
    userCategoryUnique: unique('user_category_unique').on(table.user_id, table.category_id)
  };
});

// User's matching preferences (what they're looking for in others)
export const USER_MATCHING_PREFERENCES = mysqlTable('user_matching_preferences', {
  id: int('id').primaryKey().autoincrement(),
  user_id: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  category_id: int('category_id').notNull().references(() => PREFERENCE_CATEGORIES.id, { onDelete: 'cascade' }),
  importance: mysqlEnum('importance', ['must_have', 'important', 'nice_to_have', 'not_important']).default('nice_to_have'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// For preferences that allow multiple options (like languages, interests)
export const USER_MULTI_PREFERENCES = mysqlTable('user_multi_preferences', {
  id: int('id').primaryKey().autoincrement(),
  user_id: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  category_id: int('category_id').notNull().references(() => PREFERENCE_CATEGORIES.id, { onDelete: 'cascade' }),
  option_id: int('option_id').notNull().references(() => PREFERENCE_OPTIONS.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    userOptionUnique: unique('user_option_unique').on(table.user_id, table.option_id)
  };
});

// For matching preferences that accept multiple options
export const USER_MATCHING_MULTI_PREFERENCES = mysqlTable('user_matching_multi_preferences', {
  id: int('id').primaryKey().autoincrement(),
  user_id: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  category_id: int('category_id').notNull().references(() => PREFERENCE_CATEGORIES.id, { onDelete: 'cascade' }),
  option_id: int('option_id').notNull().references(() => PREFERENCE_OPTIONS.id, { onDelete: 'cascade' }),
  importance: mysqlEnum('importance', ['must_have', 'important', 'nice_to_have', 'not_important']).default('nice_to_have'),
  created_at: timestamp('created_at').defaultNow(),
});

// For preferences with range values (like age, distance, height)
export const USER_RANGE_PREFERENCES = mysqlTable('user_range_preferences', {
  id: int('id').primaryKey().autoincrement(),
  user_id: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  category_id: int('category_id').notNull().references(() => PREFERENCE_CATEGORIES.id, { onDelete: 'cascade' }),
  min_value: int('min_value').notNull(),
  max_value: int('max_value').notNull(),
  importance: mysqlEnum('importance', ['must_have', 'important', 'nice_to_have', 'not_important']).default('nice_to_have'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => {
  return {
    userCategoryRangeUnique: unique('user_category_range_unique').on(table.user_id, table.category_id)
  };
});

// User interests (hobbies, activities, etc.)
export const INTEREST_CATEGORIES = mysqlTable('interest_categories', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  display_name: varchar('display_name', { length: 150 }).notNull(),
  icon: varchar('icon', { length: 100 }).default(null),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
});

export const INTERESTS = mysqlTable('interests', {
  id: int('id').primaryKey().autoincrement(),
  category_id: int('category_id').notNull().references(() => INTEREST_CATEGORIES.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  display_name: varchar('display_name', { length: 150 }).notNull(),
  icon: varchar('icon', { length: 100 }).default(null),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    categoryNameUnique: unique('category_name_unique').on(table.category_id, table.name)
  };
});

export const USER_INTERESTS = mysqlTable('user_interests', {
  id: int('id').primaryKey().autoincrement(),
  user_id: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  interest_id: int('interest_id').notNull().references(() => INTERESTS.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    userInterestUnique: unique('user_interest_unique').on(table.user_id, table.interest_id)
  };
});


// AI Conversations Table
export const AI_CONVERSATIONS = mysqlTable('ai_conversations', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull(), // Removed foreign key constraint
  aiCharacterId: int('ai_character_id').notNull(), // Removed foreign key constraint
  conversationTitle: varchar('conversation_title', { length: 255 }).default(null),
  conversationType: mysqlEnum('conversation_type', ['single_ai', 'group_ai']).default('single_ai'),
  status: mysqlEnum('status', ['active', 'archived', 'deleted']).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  lastMessageAt: timestamp('last_message_at').defaultNow(),
  messageCount: int('message_count').default(0),

  // AI-specific fields
  aiPersonalitySnapshot: json('ai_personality_snapshot').default(null),
  userContext: json('user_context').default(null),
  conversationMood: mysqlEnum('conversation_mood', ['supportive', 'analytical', 'creative', 'casual']).default('supportive')
});

export const AI_MESSAGES = mysqlTable('ai_messages', {
  id: int('id').autoincrement().primaryKey(),

  // Removed FK constraint
  aiConversationId: int('ai_conversation_id').notNull(),

  senderType: mysqlEnum('sender_type', ['user', 'ai']).notNull(),

  // Removed FK constraints
  senderUserId: int('sender_user_id').default(null),
  senderAiId: int('sender_ai_id').default(null),

  content: text('content').notNull(),
  messageType: mysqlEnum('message_type', ['text', 'image', 'file', 'system', 'suggestion']).default('text'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  isEdited: boolean('is_edited').default(false),
  isDeleted: boolean('is_deleted').default(false),

  aiConfidenceScore: decimal('ai_confidence_score', { precision: 5, scale: 2 }).default(null),
  responseTimeMs: int('response_time_ms').default(null),
  aiReasoning: text('ai_reasoning').default(null),
  suggestedResponses: json('suggested_responses').default(null),
  requiresFollowup: boolean('requires_followup').default(false),

  conversationContext: json('conversation_context').default(null),

  // Removed FK constraint
  parentMessageId: int('parent_message_id').default(null),
});


// AI Chat Sessions Table
export const AI_CHAT_SESSIONS = mysqlTable('ai_chat_sessions', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  aiCharacterId: int('ai_character_id').notNull().references(() => AI_CHARACTERS.id, { onDelete: 'cascade' }),
  aiConversationId: int('ai_conversation_id').notNull().references(() => AI_CONVERSATIONS.id, { onDelete: 'cascade' }),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  startedAt: timestamp('started_at').defaultNow(),
  lastActivityAt: timestamp('last_activity_at').defaultNow().onUpdateNow(),
  endedAt: timestamp('ended_at').default(null),
  status: mysqlEnum('status', ['active', 'idle', 'ended']).default('active'),
  
  // Session context
  sessionContext: json('session_context').default(null),
  userMood: mysqlEnum('user_mood', ['happy', 'sad', 'anxious', 'excited', 'neutral']).default('neutral'),
  preferredResponseStyle: mysqlEnum('preferred_response_style', ['brief', 'detailed', 'supportive', 'direct']).default('supportive')
});

// AI Capabilities Table
export const AI_CAPABILITIES = mysqlTable('ai_capabilities', {
  id: int('id').autoincrement().primaryKey(),
  aiCharacterId: int('ai_character_id').notNull().references(() => AI_CHARACTERS.id, { onDelete: 'cascade' }),
  capabilityName: varchar('capability_name', { length: 100 }).notNull(),
  capabilityDescription: text('capability_description').default(null),
  capabilityType: mysqlEnum('capability_type', ['skill', 'knowledge', 'tool', 'personality']).notNull(),
  proficiencyLevel: mysqlEnum('proficiency_level', ['basic', 'intermediate', 'advanced', 'expert']).default('intermediate'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  uniqueAiCapability: unique('unique_ai_capability').on(table.aiCharacterId, table.capabilityName)
}));

// User AI Preferences Table
export const USER_AI_PREFERENCES = mysqlTable('user_ai_preferences', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  aiCharacterId: int('ai_character_id').default(null).references(() => AI_CHARACTERS.id, { onDelete: 'cascade' }),
  preferenceKey: varchar('preference_key', { length: 100 }).notNull(),
  preferenceValue: json('preference_value').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow()
}, (table) => ({
  uniqueUserAiPref: unique('unique_user_ai_pref').on(table.userId, table.aiCharacterId, table.preferenceKey)
}));

// AI Conversation Ratings Table
export const AI_CONVERSATION_RATINGS = mysqlTable('ai_conversation_ratings', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  aiConversationId: int('ai_conversation_id').notNull().references(() => AI_CONVERSATIONS.id, { onDelete: 'cascade' }),
  aiCharacterId: int('ai_character_id').notNull().references(() => AI_CHARACTERS.id, { onDelete: 'cascade' }),
  rating: int('rating').notNull(), // Add check constraint in migration: CHECK (rating >= 1 AND rating <= 5)
  feedback: text('feedback').default(null),
  ratingAspects: json('rating_aspects').default(null),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  uniqueUserConversationRating: unique('unique_user_conversation_rating').on(table.userId, table.aiConversationId)
}));

// AI Message Reactions Table
export const AI_MESSAGE_REACTIONS = mysqlTable('ai_message_reactions', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  aiMessageId: int('ai_message_id').notNull().references(() => AI_MESSAGES.id, { onDelete: 'cascade' }),
  reactionType: mysqlEnum('reaction_type', ['like', 'love', 'helpful', 'unhelpful', 'funny', 'smart']).notNull(),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  uniqueUserMessageReaction: unique('unique_user_message_reaction').on(table.userId, table.aiMessageId, table.reactionType)
}));

// AI Learning Data Table
export const AI_LEARNING_DATA = mysqlTable('ai_learning_data', {
  id: int('id').autoincrement().primaryKey(),
  aiCharacterId: int('ai_character_id').notNull().references(() => AI_CHARACTERS.id, { onDelete: 'cascade' }),
  userId: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  conversationId: int('conversation_id').notNull().references(() => AI_CONVERSATIONS.id, { onDelete: 'cascade' }),
  interactionType: mysqlEnum('interaction_type', ['message', 'rating', 'feedback', 'correction']).notNull(),
  inputData: json('input_data').notNull(),
  expectedOutput: json('expected_output').default(null),
  actualOutput: json('actual_output').default(null),
  userSatisfactionScore: int('user_satisfaction_score').default(null), // Add check constraint: CHECK (user_satisfaction_score >= 1 AND user_satisfaction_score <= 10)
  createdAt: timestamp('created_at').defaultNow()
});

// Updated AI Characters Table with MBTI Type
export const AI_CHARACTERS = mysqlTable('ai_characters', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  displayName: varchar('display_name', { length: 150 }).notNull(),
  avatarUrl: varchar('avatar_url', { length: 500 }).default(null),
  specialty: varchar('specialty', { length: 200 }).notNull(),
  mbtiType: varchar('mbti_type', { length: 4 }).notNull().default('ENFJ'),
  personalityDescription: text('personality_description').default(null),
  systemPrompt: text('system_prompt').notNull(),
  greetingMessage: text('greeting_message').default(null),
  responseStyle: mysqlEnum('response_style', ['formal', 'casual', 'empathetic', 'analytical', 'creative']).default('empathetic'),
  expertiseAreas: json('expertise_areas').default(null),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  
  // AI Stats
  totalConversations: int('total_conversations').default(0),
  totalMessages: int('total_messages').default(0),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0.00'),
  totalRatings: int('total_ratings').default(0)
}, (table) => ({
  mbtiTypeIndex: unique('idx_mbti_type').on(table.mbtiType)
}));



// User MBTI Assessment Results (to match with compatible AIs)
export const USER_MBTI_ASSESSMENT = mysqlTable('user_mbti_assessment', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }).unique(),
  mbtiType: varchar('mbti_type', { length: 4 }).notNull(),
  
  // Individual trait scores (0-100)
  extraversionScore: int('extraversion_score').notNull(), // E vs I
  sensingScore: int('sensing_score').notNull(),          // S vs N  
  thinkingScore: int('thinking_score').notNull(),        // T vs F
  judgingScore: int('judging_score').notNull(),          // J vs P
  
  // Assessment metadata
  assessmentDate: timestamp('assessment_date').defaultNow(),
  confidenceLevel: mysqlEnum('confidence_level', ['low', 'medium', 'high']).default('medium'),
  assessmentVersion: varchar('assessment_version', { length: 10 }).default('1.0'),
  
  // Detailed results
  traitDescriptions: json('trait_descriptions').default(null),
  strengthsWeaknesses: json('strengths_weaknesses').default(null),
  careerSuggestions: json('career_suggestions').default(null),
  relationshipInsights: json('relationship_insights').default(null),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow()
});

// AI Personality Adaptations (how AI adjusts based on user's MBTI)
export const AI_PERSONALITY_ADAPTATIONS = mysqlTable('ai_personality_adaptations', {
  id: int('id').primaryKey().autoincrement(),
  aiCharacterId: int('ai_character_id').notNull().references(() => AI_CHARACTERS.id, { onDelete: 'cascade' }),
  targetUserMbtiType: varchar('target_user_mbti_type', { length: 4 }).notNull(),
  
  // Adaptation settings
  communicationStyle: json('communication_style').notNull(), // How to adjust tone, pace, etc.
  focusAreas: json('focus_areas').notNull(),                // What topics to emphasize
  approachModifications: json('approach_modifications').notNull(), // How to modify standard approach
  
  // Effectiveness metrics
  avgSatisfactionScore: decimal('avg_satisfaction_score', { precision: 3, scale: 2 }).default('0.00'),
  totalInteractions: int('total_interactions').default(0),
  
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow()
}, (table) => ({
  uniqueAiUserMbti: unique('unique_ai_user_mbti').on(table.aiCharacterId, table.targetUserMbtiType)
}));

// Add this to your schema.js file

export const USER_AI_FRIENDS = mysqlTable("user_ai_friends", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull(), // References user table
  user_mbti_type: varchar("user_mbti_type", { length: 4 }).notNull(), // e.g., "ENFP"
  ai_friend_mbti_type: varchar("ai_friend_mbti_type", { length: 4 }).notNull(), // e.g., "INTJ"
  friend_index: int("friend_index").notNull(), // 1, 2, 3, 4, 5 for the 5 AI friends
  friendship_strength: int("friendship_strength").default(50), // 0-100 compatibility score
  is_active: boolean("is_active").default(true),
  last_interaction: timestamp("last_interaction").default(null),
  total_interactions: int("total_interactions").default(0),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => ({
  // Unique constraint to ensure each user gets exactly 5 AI friends (one per index)
  userFriendIndexUnique: uniqueIndex("user_ai_friends_unique", [
    table.user_id,
    table.friend_index
  ]),
}));

export const USER_SUGGESTIONS = mysqlTable('user_suggestions', {
  id: int('id').autoincrement().primaryKey(),
  aiCharacterId: int('ai_character_id').notNull().references(() => AI_CHARACTERS.id, { onDelete: 'cascade' }),
  requesterUserId: int('requester_user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  suggestedUserId: int('suggested_user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  suggestionReason: text('suggestion_reason').default(null),
  compatibilityScore: int('compatibility_score').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  status: mysqlEnum('status', ['pending', 'accepted', 'rejected', 'expired']).default('pending')
}, (table) => {
  return {
    uniqueSuggestion: unique('unique_suggestion').on(table.aiCharacterId, table.requesterUserId, table.suggestedUserId)
  };
});

// Group Chat Invitations Table
export const GROUP_CHAT_INVITATIONS = mysqlTable('group_chat_invitations', {
  id: int('id').autoincrement().primaryKey(),
  aiCharacterId: int('ai_character_id').notNull().references(() => AI_CHARACTERS.id, { onDelete: 'cascade' }),
  initiatorUserId: int('initiator_user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  invitedUserId: int('invited_user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  invitationMessage: text('invitation_message').default(null),
  status: mysqlEnum('status', ['pending', 'accepted', 'rejected', 'delayed', 'expired']).default('pending'),
  delayUntil: timestamp('delay_until').default(null),
  createdAt: timestamp('created_at').defaultNow(),
  respondedAt: timestamp('responded_at').default(null),
  expiresAt: timestamp('expires_at').default(null)
}, (table) => {
  return {
    uniqueInvitation: unique('unique_invitation').on(table.aiCharacterId, table.initiatorUserId, table.invitedUserId)
  };
});

// Group Chats Table
export const GROUP_CHATS = mysqlTable('group_chats', {
  id: int('id').autoincrement().primaryKey(),
  aiCharacterId: int('ai_character_id').notNull().references(() => AI_CHARACTERS.id, { onDelete: 'cascade' }),
  chatName: varchar('chat_name', { length: 255 }).default(null),
  createdByUserId: int('created_by_user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  status: mysqlEnum('status', ['active', 'inactive', 'ended']).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  lastMessageAt: timestamp('last_message_at').defaultNow()
});

// Group Chat Participants Table
export const GROUP_CHAT_PARTICIPANTS = mysqlTable('group_chat_participants', {
  id: int('id').autoincrement().primaryKey(),
  groupChatId: int('group_chat_id').notNull().references(() => GROUP_CHATS.id, { onDelete: 'cascade' }),
  userId: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at').defaultNow(),
  leftAt: timestamp('left_at').default(null),
  role: mysqlEnum('role', ['admin', 'member']).default('member'),
  isActive: boolean('is_active').default(true)
}, (table) => {
  return {
    uniqueParticipant: unique('unique_participant').on(table.groupChatId, table.userId)
  };
});

// Group Chat Messages Table
export const GROUP_CHAT_MESSAGES = mysqlTable('group_chat_messages', {
  id: int('id').autoincrement().primaryKey(),
  groupChatId: int('group_chat_id').notNull().references(() => GROUP_CHATS.id, { onDelete: 'cascade' }),
  senderType: mysqlEnum('sender_type', ['user', 'ai']).notNull(),
  senderUserId: int('sender_user_id').default(null).references(() => USER.id, { onDelete: 'cascade' }),
  senderAiId: int('sender_ai_id').default(null).references(() => AI_CHARACTERS.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  messageType: mysqlEnum('message_type', ['text', 'system', 'suggestion', 'invitation']).default('text'),
  createdAt: timestamp('created_at').defaultNow(),
  isDeleted: boolean('is_deleted').default(false)
});



// New Ones


export const USER = mysqlTable('user', {
  id: int('id').notNull().primaryKey().autoincrement(),
  username: varchar('username', { length: 255 }).notNull(),
  birthDate: date('birthDate').notNull(),
  gender: varchar('gender', { length: 150 }).default(null),
  password: varchar('password', { length: 150 }).default(null),

  // NEW PRICING FIELDS
  currentPlan: mysqlEnum('current_plan', ['free', 'pro', 'elite']).default('free'),
  isVerified: boolean('is_verified').default(false),
  verificationDate: timestamp('verification_date').default(null),
  profileBoostActive: boolean('profile_boost_active').default(false),
  profileBoostEnds: timestamp('profile_boost_ends').default(null),
  subscriptionStatus: mysqlEnum('subscription_status', ['active', 'expired', 'trial']).default('trial'),
  subscriptionEnds: timestamp('subscription_ends').default(null),

  // Existing fields
  phone: varchar('phone', { length: 20 }).default(null),
  isPhoneVerified: boolean('is_phone_verified').default(false),
  email: varchar('email', { length: 255 }).default(null),
  isEmailVerified: boolean('is_email_verified').default(false),
  profileImageUrl: varchar('profile_image_url', { length: 500 }).default(null),

  country: varchar('country', { length: 150 }).default(null),
  country_code: varchar('country_code', { length: 10 }).default(null),

  state: varchar('state', { length: 150 }).default(null),
  state_code: varchar('state_code', { length: 10 }).default(null),

  city: varchar('city', { length: 150 }).default(null),
  city_code: varchar('city_code', { length: 20 }).default(null),


  // religion: varchar('religion', { length: 150 }).default(null),
  // caste: varchar('caste', { length: 150 }).default(null),

  religion_id: int('religion_id').default(null).references(() => RELIGIONS.id),
  caste_id: int('caste_id').default(null).references(() => CASTES_OR_DENOMINATIONS.id),


  height: decimal('height', { precision: 5, scale: 2 }).default(null),
  weight: decimal('weight', { precision: 5, scale: 2 }).default(null),
  income: varchar('income', { length: 100 }).default(null),
  isProfileVerified: boolean('is_profile_verified').default(false),
  isProfileComplete: boolean('is_profile_complete').default(false),
});

export const USER_IMAGES = mysqlTable('user_images', {
  id: int('id').primaryKey().autoincrement(),
  user_id: int('user_id').notNull(), // references USER.id
  image_url: varchar('image_url', { length: 500 }).notNull(),
  is_profile: boolean('is_profile').default(false), // indicates if it's the current profile image
  uploaded_at: timestamp('uploaded_at').defaultNow(),
});

export const RELIGIONS = mysqlTable('religions', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(), // e.g., Hinduism, Islam, Christianity
  is_user_added: boolean('is_user_added').default(false), // user-added religions
  is_approved: boolean('is_approved').default(true), // approved entries
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow()
});

export const CASTES_OR_DENOMINATIONS = mysqlTable('castes_or_denominations', {
  id: int('id').primaryKey().autoincrement(),
  religion_id: int('religion_id').notNull().references(() => RELIGIONS.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(), // caste/subgroup/denomination name
  type: mysqlEnum('type', ['caste','denomination','subgroup']).default('caste'),
  is_user_added: boolean('is_user_added').default(false), // added by user
  is_approved: boolean('is_approved').default(false), // admin must approve
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  // prevent exact duplicate for same religion
  uniqueRelCaste: unique('unique_religion_caste').on(table.religion_id, table.name)
}));


// Updated CONNECTIONS table with premium tracking
export const CONNECTIONS = mysqlTable("connections", {
  connectionId: int("connection_id").primaryKey().autoincrement(),
  senderId: int("sender_id").notNull().references(() => USER.id),
  receiverId: int("receiver_id").notNull().references(() => USER.id),
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "blocked"]).default("pending"),
  
  // NEW PREMIUM FIELDS
  connectionType: mysqlEnum("connection_type", ["regular", "premium", "boosted"]).default("regular"),
  isPremiumConnection: boolean("is_premium_connection").default(false),
  
  requestedAt: timestamp("requested_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

// ============================================
// NEW TABLES FOR PRICING SYSTEM
// ============================================

// Subscription Plans
export const SUBSCRIPTION_PLANS = mysqlTable('subscription_plans', {
  id: int('id').notNull().autoincrement().primaryKey(),
  planName: varchar('plan_name', { length: 50 }).notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('INR'),
  billingPeriod: mysqlEnum('billing_period', ['monthly', 'quarterly', 'annual']).notNull(),
  features: json('features').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  featuresJson: json('features_json').default(null),
  maxConnectionsPerDay: int('max_connections_per_day').default(-1),
  aiChatEnabled: boolean('ai_chat_enabled').default(false),
  profileVerification: boolean('profile_verification').default(false),
  prioritySupport: boolean('priority_support').default(false),
  weeklyBoosts: int('weekly_boosts').default(0)
}, (table) => ({
  uniquePlanPeriod: unique('unique_plan_period').on(table.planName, table.billingPeriod)
}));

// User Subscriptions
export const USER_SUBSCRIPTIONS = mysqlTable('user_subscriptions', {
  id: int('id').notNull().autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  planId: int('plan_id').notNull().references(() => SUBSCRIPTION_PLANS.id),
  status: mysqlEnum('status', ['active', 'expired', 'cancelled', 'pending']).default('pending'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  autoRenew: boolean('auto_renew').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  billingCycle: mysqlEnum('billing_cycle', ['monthly', 'quarterly', 'annual']).default('quarterly'),
  nextBillingDate: timestamp('next_billing_date').default(null),
  paymentMethod: varchar('payment_method', { length: 50 }).default('razorpay'),
  cancelledAt: timestamp('cancelled_at').default(null),
  cancelReason: text('cancel_reason').default(null)
});

// Subscription Payments
export const SUBSCRIPTION_PAYMENTS = mysqlTable('subscription_payments', {
  id: int('id').notNull().autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  subscriptionId: int('subscription_id').notNull().references(() => USER_SUBSCRIPTIONS.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('INR'),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  paymentId: varchar('payment_id', { length: 255 }).notNull(),
  status: mysqlEnum('status', ['pending', 'completed', 'failed', 'refunded']).default('pending'),
  paidAt: timestamp('paid_at').default(null),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  razorpayPaymentId: varchar('razorpay_payment_id', { length: 255 }).default(null),
  razorpayOrderId: varchar('razorpay_order_id', { length: 255 }).default(null),
  failureReason: text('failure_reason').default(null)
});

// Profile Boosts (₹99 weekly add-on)
export const PROFILE_BOOSTS = mysqlTable('profile_boosts', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  boostType: mysqlEnum('boost_type', ['weekly', 'monthly']).default('weekly'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentId: varchar('payment_id', { length: 255 }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Daily Connection Usage (Free plan: 5/day limit)
export const DAILY_CONNECTION_USAGE = mysqlTable('daily_connection_usage', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  connectionsUsed: int('connections_used').default(0),
  maxConnections: int('max_connections').notNull(),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  userDateUnique: unique('user_date_unique').on(table.userId, table.date)
}));

// User Badges System (Verified, Elite, etc.)
export const USER_BADGES = mysqlTable('user_badges', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  badgeType: mysqlEnum('badge_type', ['verified', 'top_tier', 'premium', 'elite']).notNull(),
  badgeName: varchar('badge_name', { length: 100 }).notNull(),
  badgeDescription: varchar('badge_description', { length: 255 }).default(null),
  isActive: boolean('is_active').default(true),
  awardedAt: timestamp('awarded_at').defaultNow(),
  expiresAt: timestamp('expires_at').default(null)
}, (table) => ({
  userBadgeUnique: unique('user_badge_unique').on(table.userId, table.badgeType)
}));

// Feature Usage Tracking (AI chat, group chat limits, etc.)
export const FEATURE_USAGE = mysqlTable('feature_usage', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  featureName: varchar('feature_name', { length: 100 }).notNull(),
  usageCount: int('usage_count').default(0),
  lastUsed: timestamp('last_used').defaultNow(),
  resetDate: date('reset_date').notNull(),
  maxUsage: int('max_usage').default(null), // NULL = unlimited
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  userFeatureDate: unique('user_feature_date').on(table.userId, table.featureName, table.resetDate)
}));

// ============================================
// INDEXES FOR PERFORMANCE
// ============================================

// Enhanced PREFERENCE_CATEGORIES table
export const PREFERENCE_CATEGORIES = mysqlTable('preference_categories', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  displayName: varchar('display_name', { length: 150 }).notNull(),
  description: varchar('description', { length: 255 }).default(null),
  isActive: boolean('is_active').default(true),
  allowsAny: boolean('allows_any').default(false),
  allowsMultiple: boolean('allows_multiple').default(false),
  categoryType: mysqlEnum('category_type', ['single', 'multiple', 'range']).default('single'),
  displayOrder: int('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Enhanced PREFERENCE_OPTIONS table
export const PREFERENCE_OPTIONS = mysqlTable('preference_options', {
  id: int('id').primaryKey().autoincrement(),
  categoryId: int('category_id').notNull().references(() => PREFERENCE_CATEGORIES.id, { onDelete: 'cascade' }),
  value: varchar('value', { length: 100 }).notNull(),
  displayValue: varchar('display_value', { length: 150 }).notNull(),
  icon: varchar('icon', { length: 100 }).default(null),
  isActive: boolean('is_active').default(true),
  isAnyOption: boolean('is_any_option').default(false),
  includesOthers: boolean('includes_others').default(false),
  displayOrder: int('display_order').default(0),
  optionColor: varchar('option_color', { length: 50 }).default(null),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  categoryValueUnique: unique('category_value_unique').on(table.categoryId, table.value)
}));

// New flexible USER_PREFERENCE_VALUES table
export const USER_PREFERENCE_VALUES = mysqlTable('user_preference_values', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  categoryId: int('category_id').notNull().references(() => PREFERENCE_CATEGORIES.id, { onDelete: 'cascade' }),
  optionId: int('option_id').default(null).references(() => PREFERENCE_OPTIONS.id, { onDelete: 'cascade' }),
  customValue: varchar('custom_value', { length: 255 }).default(null),
  rangeMin: int('range_min').default(null),
  rangeMax: int('range_max').default(null),
  isAnySelected: boolean('is_any_selected').default(false),
  importance: mysqlEnum('importance', ['must_have', 'important', 'nice_to_have', 'not_important']).default('nice_to_have'),
  isDealBreaker: boolean('is_deal_breaker').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  userCategoryIndex: index('idx_user_category').on(table.userId, table.categoryId),
  userAnyIndex: index('idx_user_any').on(table.userId, table.isAnySelected),
  dealBreakerIndex: index('idx_deal_breaker').on(table.userId, table.isDealBreaker)
}));

// ============================================
// SUBSCRIPTION & PLAN TABLES (Already in previous schema)
// ============================================

// User saved profiles table
export const USER_SAVED_PROFILES = mysqlTable('user_saved_profiles', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  savedUserId: int('saved_user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  savedAt: timestamp('saved_at').defaultNow(),
  notes: text('notes').default(null),
}, (table) => ({
  userSavedUnique: unique('user_saved_unique').on(table.userId, table.savedUserId)
}));

// User matching analytics table
export const USER_MATCHING_ANALYTICS = mysqlTable('user_matching_analytics', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  totalMatches: int('total_matches').default(0),
  totalViews: int('total_views').default(0),
  totalLikes: int('total_likes').default(0),
  totalConnections: int('total_connections').default(0),
  profileScore: decimal('profile_score', { precision: 5, scale: 2 }).default('0.00'),
  lastUpdated: timestamp('last_updated').defaultNow().onUpdateNow(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userAnalyticsUnique: unique('user_analytics_unique').on(table.userId)
}));

// Daily user activity tracking
export const USER_DAILY_ACTIVITY = mysqlTable('user_daily_activity', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  activityDate: date('activity_date').notNull(),
  profileViews: int('profile_views').default(0),
  matchesViewed: int('matches_viewed').default(0),
  connectionsRequested: int('connections_requested').default(0),
  messagesExchanged: int('messages_exchanged').default(0),
  timeSpentMinutes: int('time_spent_minutes').default(0),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userDateUnique: unique('user_date_unique').on(table.userId, table.activityDate)
}));

// User plan upgrade history
export const USER_PLAN_HISTORY = mysqlTable('user_plan_history', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  previousPlan: mysqlEnum('previous_plan', ['free', 'pro', 'elite']).notNull(),
  newPlan: mysqlEnum('new_plan', ['free', 'pro', 'elite']).notNull(),
  changeReason: varchar('change_reason', { length: 100 }).default(null),
  effectiveDate: timestamp('effective_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Advanced matching preferences
export const USER_ADVANCED_PREFERENCES = mysqlTable('user_advanced_preferences', {
  id: int('id').notNull().primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }).unique(),
  maxDistance: int('max_distance').default(50), // km
  ageRangeMin: int('age_range_min').default(18),
  ageRangeMax: int('age_range_max').default(35),
  showOnlyVerified: boolean('show_only_verified').default(false),
  hideUsersWithRedFlags: boolean('hide_users_with_red_flags').default(false),
  prioritizeActiveUsers: boolean('prioritize_active_users').default(true),
  matchingAlgorithm: mysqlEnum('matching_algorithm', ['personality', 'compatibility', 'hybrid']).default('hybrid'),
  notificationPreferences: json('notification_preferences').default(null),
  privacySettings: json('privacy_settings').default(null),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ============================================
// RAZORPAY & PAYMENT WEBHOOK TABLES
// ============================================

// Payment Webhooks
export const PAYMENT_WEBHOOKS = mysqlTable('payment_webhooks', {
  id: int('id').notNull().autoincrement().primaryKey(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  razorpayPaymentId: varchar('razorpay_payment_id', { length: 255 }).default(null),
  razorpayOrderId: varchar('razorpay_order_id', { length: 255 }).default(null),
  razorpaySignature: text('razorpay_signature').default(null),
  webhookPayload: json('webhook_payload').notNull(),
  status: mysqlEnum('status', ['received', 'processed', 'failed']).default('received'),
  processedAt: timestamp('processed_at').default(null),
  errorMessage: text('error_message').default(null),
  createdAt: timestamp('created_at').defaultNow()
});

// Razorpay Orders
export const RAZORPAY_ORDERS = mysqlTable('razorpay_orders', {
  id: int('id').notNull().autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => USER.id, { onDelete: 'cascade' }),
  planId: int('plan_id').notNull().references(() => SUBSCRIPTION_PLANS.id),
  razorpayOrderId: varchar('razorpay_order_id', { length: 255 }).notNull().unique(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('INR'),
  status: mysqlEnum('status', ['created', 'attempted', 'paid', 'failed']).default('created'),
  billingCycle: mysqlEnum('billing_cycle', ['monthly', 'quarterly', 'annual']).default('quarterly'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow()
});

// ============================================
// MBTI COMPATIBILITY TABLES
// ============================================

// MBTI-AI Compatibility
export const MBTI_AI_COMPATIBILITY = mysqlTable('mbti_ai_compatibility', {
  id: int('id').notNull().autoincrement().primaryKey(),
  userMbtiType: varchar('user_mbti_type', { length: 4 }).notNull(),
  aiMbtiType: varchar('ai_mbti_type', { length: 4 }).notNull(),
  compatibilityScore: int('compatibility_score').notNull(),
  relationshipType: mysqlEnum('relationship_type', ['ideal', 'complementary', 'challenging', 'similar']).notNull(),
  description: text('description').default(null),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  uniqueMbtiPair: unique('unique_mbti_pair').on(table.userMbtiType, table.aiMbtiType)
}));

// MBTI Compatibility Real (Pre-calculated compatibility scores)
export const MBTI_COMPATIBILITY_REAL = mysqlTable('mbti_compatibility_real', {
  id: int('id').notNull().autoincrement().primaryKey(),
  userMbti: varchar('user_mbti', { length: 4 }).notNull().unique(),
  aiFriend1: varchar('ai_friend_1', { length: 4 }).default(null),
  aiFriend2: varchar('ai_friend_2', { length: 4 }).default(null),
  aiFriend3: varchar('ai_friend_3', { length: 4 }).default(null),
  aiFriend4: varchar('ai_friend_4', { length: 4 }).default(null),
  aiFriend5: varchar('ai_friend_5', { length: 4 }).default(null),
  score1: int('score_1').default(null),
  score2: int('score_2').default(null),
  score3: int('score_3').default(null),
  score4: int('score_4').default(null),
  score5: int('score_5').default(null)
});