import { db } from '@/utils';
import { encryptText } from '@/utils/encryption';
import {
  USER,
  USER_IMAGES,
  USER_EDUCATION,
  EDUCATION_LEVELS,
  USER_JOB,
  JOB_TITLES,
  USER_LANGUAGES,
  LANGUAGES,
  USER_MBTI_ASSESSMENT,
  QUIZ_SEQUENCES,
  TEST_PROGRESS,
  QUIZ_COMPLETION,
  QUESTIONS,
  ANSWERS,
  USER_ADVANCED_PREFERENCES,
  USER_PREFERENCE_VALUES,
  PREFERENCE_CATEGORIES,
  PREFERENCE_OPTIONS
} from '@/utils/schema';
import bcrypt from 'bcryptjs';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// 16 MBTI Types - will cycle through all
const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

let mbtiTypeIndex = 0; // Track which MBTI type to assign next

// Random data pools
const EDUCATION_LEVELS_LIST = [
  'High School',
  'Diploma',
  "Bachelor's Degree",
  "Master's Degree",
  'Doctorate/PhD'
];

const JOB_TITLES_LIST = [
  'Software Engineer', 'Product Manager', 'Data Analyst',
  'Marketing Manager', 'Business Analyst', 'UX Designer',
  'Sales Manager', 'HR Manager', 'Financial Analyst',
  'Consultant', 'Project Manager', 'Content Writer',
  'Graphic Designer', 'Operations Manager', 'Teacher'
];

const COMPANIES = [
  'TCS', 'Infosys', 'Wipro', 'Google', 'Microsoft',
  'Amazon', 'Flipkart', 'Paytm', 'Zomato', 'Swiggy',
  'Accenture', 'Cognizant', 'HCL', 'Tech Mahindra', 'IBM'
];

const LANGUAGES_LIST = [
  'Hindi', 'English', 'Marathi', 'Tamil', 'Telugu',
  'Kannada', 'Malayalam', 'Bengali', 'Gujarati', 'Punjabi',
  'Odia', 'Urdu', 'Assamese'
];

// Height ranges (in cm)
const HEIGHT_RANGES = {
  Male: { min: 165, max: 185 },
  Female: { min: 152, max: 170 },
  Other: { min: 155, max: 180 }
};

// Weight ranges (in kg)
const WEIGHT_RANGES = {
  Male: { min: 60, max: 90 },
  Female: { min: 45, max: 70 },
  Other: { min: 50, max: 80 }
};

// Annual income ranges
const INCOME_RANGES = [
  '3-5 LPA', '5-8 LPA', '8-12 LPA',
  '12-18 LPA', '18-25 LPA', '25-35 LPA',
  '35-50 LPA', '50+ LPA'
];

// Utility functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateBirthDate() {
  const age = getRandomInt(20, 32);
  const today = new Date();
  const birthYear = today.getFullYear() - age;
  const birthDate = new Date(birthYear, getRandomInt(0, 11), getRandomInt(1, 28));
  return birthDate.toISOString().split('T')[0];
}

function generateUsername(name) {
  // Convert name to lowercase, replace spaces with underscore
  let username = name.toLowerCase().replace(/\s+/g, '_');
  // Remove special characters
  username = username.replace(/[^a-z0-9_]/g, '');
  return username;
}

async function checkAndGenerateUniqueUsername(baseName) {
  let username = generateUsername(baseName);
  let counter = 1;
  
  while (true) {
    const [existing] = await db
      .select()
      .from(USER)
      .where(eq(USER.username, username))
      .limit(1);
    
    if (!existing) {
      return username;
    }
    
    username = `${generateUsername(baseName)}${counter}`;
    counter++;
  }
}

function getNextMBTIType() {
  const type = MBTI_TYPES[mbtiTypeIndex];
  mbtiTypeIndex = (mbtiTypeIndex + 1) % MBTI_TYPES.length;
  return type;
}

function generateMBTIScores(mbtiType) {
  return {
    extraversionScore: mbtiType[0] === 'E' ? getRandomInt(55, 95) : getRandomInt(5, 45),
    sensingScore: mbtiType[1] === 'S' ? getRandomInt(55, 95) : getRandomInt(5, 45),
    thinkingScore: mbtiType[2] === 'T' ? getRandomInt(55, 95) : getRandomInt(5, 45),
    judgingScore: mbtiType[3] === 'J' ? getRandomInt(55, 95) : getRandomInt(5, 45)
  };
}

// Database helper functions
async function getOrCreateEducationLevel(degree) {
  try {
    const [existing] = await db
      .select()
      .from(EDUCATION_LEVELS)
      .where(eq(EDUCATION_LEVELS.levelName, degree))
      .limit(1);
    
    if (existing) return existing.id;
    
    const [newLevel] = await db
      .insert(EDUCATION_LEVELS)
      .values({ levelName: degree })
      .$returningId();
    
    return newLevel.id;
  } catch (error) {
    console.error('Error with education level:', error);
    return null;
  }
}

async function getOrCreateJobTitle(title) {
  try {
    const [existing] = await db
      .select()
      .from(JOB_TITLES)
      .where(eq(JOB_TITLES.title, title))
      .limit(1);
    
    if (existing) return existing.id;
    
    const [newTitle] = await db
      .insert(JOB_TITLES)
      .values({ title })
      .$returningId();
    
    return newTitle.id;
  } catch (error) {
    console.error('Error with job title:', error);
    return null;
  }
}

async function getOrCreateLanguage(title) {
  try {
    const [existing] = await db
      .select()
      .from(LANGUAGES)
      .where(eq(LANGUAGES.title, title))
      .limit(1);
    
    if (existing) return existing.id;
    
    const [newLang] = await db
      .insert(LANGUAGES)
      .values({ title })
      .$returningId();
    
    return newLang.id;
  } catch (error) {
    console.error('Error with language:', error);
    return null;
  }
}

// MBTI Quiz completion
async function insertMBTIQuizCompletion(userId, mbtiType) {
  try {
    await db.insert(QUIZ_SEQUENCES).values({
      user_id: userId,
      quiz_id: 1,
      type_sequence: mbtiType,
      isCompleted: true,
      isStarted: true,
      createddate: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error inserting MBTI quiz completion:', error);
    return false;
  }
}

// Compatibility test progress
async function insertCompatibilityTestProgress(userId) {
  try {
    const questions = await db
      .select({
        questionId: QUESTIONS.id
      })
      .from(QUESTIONS)
      .where(eq(QUESTIONS.test_id, 2))
      .limit(60);

    if (questions.length === 0) {
      console.log('No compatibility test questions found');
      return true;
    }

    for (const question of questions) {
      const answers = await db
        .select({
          id: ANSWERS.id,
          points: ANSWERS.points
        })
        .from(ANSWERS)
        .where(eq(ANSWERS.question_id, question.questionId))
        .execute();

      if (answers.length > 0) {
        const selectedAnswer = getRandomElement(answers);
        
        await db.insert(TEST_PROGRESS).values({
          user_id: userId,
          test_id: 2,
          question_id: question.questionId,
          selected_answer_id: selectedAnswer.id,
          points_received: selectedAnswer.points || getRandomInt(0, 4),
          progress_timestamp: new Date()
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error inserting test progress:', error);
    return false;
  }
}

// Mark compatibility test completed
async function markCompatibilityTestCompleted(userId) {
  try {
    const [existing] = await db
      .select()
      .from(QUIZ_COMPLETION)
      .where(
        and(
          eq(QUIZ_COMPLETION.user_id, userId),
          eq(QUIZ_COMPLETION.test_id, 2)
        )
      )
      .limit(1);

    if (existing) {
      await db
        .update(QUIZ_COMPLETION)
        .set({ completed: 'yes', completedAt: new Date() })
        .where(
          and(
            eq(QUIZ_COMPLETION.user_id, userId),
            eq(QUIZ_COMPLETION.test_id, 2)
          )
        );
    } else {
      await db.insert(QUIZ_COMPLETION).values({
        user_id: userId,
        test_id: 2,
        completed: 'yes',
        completedAt: new Date()
      });
    }
    return true;
  } catch (error) {
    console.error('Error marking test completion:', error);
    return false;
  }
}

// Store lookingFor preference
async function storeLookingForPreference(userId, lookingFor) {
  try {
    let [category] = await db
      .select()
      .from(PREFERENCE_CATEGORIES)
      .where(eq(PREFERENCE_CATEGORIES.name, 'looking_for'))
      .limit(1);

    if (!category) {
      const [newCategory] = await db
        .insert(PREFERENCE_CATEGORIES)
        .values({
          name: 'looking_for',
          displayName: 'Looking For',
          categoryType: 'single',
          isActive: true
        })
        .$returningId();
      
      category = { id: newCategory.id };
    }

    let [option] = await db
      .select()
      .from(PREFERENCE_OPTIONS)
      .where(
        and(
          eq(PREFERENCE_OPTIONS.categoryId, category.id),
          eq(PREFERENCE_OPTIONS.value, lookingFor)
        )
      )
      .limit(1);

    if (!option) {
      const [newOption] = await db
        .insert(PREFERENCE_OPTIONS)
        .values({
          categoryId: category.id,
          value: lookingFor,
          displayValue: lookingFor,
          isActive: true
        })
        .$returningId();
      
      option = { id: newOption.id };
    }

    await db.insert(USER_PREFERENCE_VALUES).values({
      userId: userId,
      categoryId: category.id,
      optionId: option.id,
      importance: 'must_have'
    });

    return true;
  } catch (error) {
    console.error('Error storing lookingFor preference:', error);
    return false;
  }
}

// Main function to create user
async function createUser(userData) {
  try {
    const {
      name,
      gender,
      lookingFor,
      imageUrl,
      country,
      countryCode,
      state,
      stateCode,
      city,
      religionId,
      casteId
    } = userData;

    // Generate unique username
    const username = await checkAndGenerateUniqueUsername(name);
    
    // Generate email
    const email = `${username}@gmail.com`;
    
    // Default password
    // const hashedPassword = await bcrypt.hash('testTEST#', 10);
    const encryptedPassword = encryptText('testTEST#');
    
    // Generate birth date
    const birthDate = generateBirthDate();
    
    // Random height and weight based on gender
    const heightRange = HEIGHT_RANGES[gender] || HEIGHT_RANGES.Other;
    const weightRange = WEIGHT_RANGES[gender] || WEIGHT_RANGES.Other;
    const height = getRandomFloat(heightRange.min, heightRange.max, 2);
    const weight = getRandomFloat(weightRange.min, weightRange.max, 2);
    
    // Random income
    const income = getRandomElement(INCOME_RANGES);
    
    // Get next MBTI type (ensures all 16 types are used)
    const mbtiType = getNextMBTIType();
    const mbtiScores = generateMBTIScores(mbtiType);

    // Insert user
    const [user] = await db
      .insert(USER)
      .values({
        name: name,
        username: username,
        birthDate: birthDate,
        gender: gender,
        password: encryptedPassword,
        phone: '9876543201',
        isPhoneVerified: true,
        email: email,
        isEmailVerified: true,
        profileImageUrl: imageUrl,
        country: country,
        country_code: countryCode,
        state: state,
        state_code: stateCode,
        city: city,
        religion_id: religionId !== 'Other' ? religionId : null,
        caste_id: casteId !== 'Other' ? casteId : null,
        height: height,
        weight: weight,
        income: income,
        currentPlan: getRandomElement(['free', 'pro', 'elite']),
        isVerified: Math.random() > 0.5,
        subscriptionStatus: getRandomElement(['active', 'expired', 'trial']),
        isProfileVerified: true,
        isProfileComplete: true
      })
      .$returningId();

    const userId = user.id;

    // Insert user image
    if (imageUrl) {
      await db.insert(USER_IMAGES).values({
        user_id: userId,
        image_url: imageUrl,
        is_profile: true
      });
    }

    // Insert MBTI assessment
    await db.insert(USER_MBTI_ASSESSMENT).values({
      userId: userId,
      mbtiType: mbtiType,
      extraversionScore: mbtiScores.extraversionScore,
      sensingScore: mbtiScores.sensingScore,
      thinkingScore: mbtiScores.thinkingScore,
      judgingScore: mbtiScores.judgingScore,
      confidenceLevel: getRandomElement(['low', 'medium', 'high']),
      assessmentVersion: '1.0'
    });

    // Insert MBTI quiz completion
    await insertMBTIQuizCompletion(userId, mbtiType);

    // Insert compatibility test progress and completion
    await insertCompatibilityTestProgress(userId);
    await markCompatibilityTestCompleted(userId);

    // Insert education
    const education = getRandomElement(EDUCATION_LEVELS_LIST);
    const educationLevelId = await getOrCreateEducationLevel(education);
    if (educationLevelId) {
      await db.insert(USER_EDUCATION).values({
        user_id: userId,
        education_level_id: educationLevelId,
        degree: education,
        graduationYear: getRandomInt(2015, 2024)
      });
    }

    // Insert job
    const jobTitle = getRandomElement(JOB_TITLES_LIST);
    const company = getRandomElement(COMPANIES);
    const jobTitleId = await getOrCreateJobTitle(jobTitle);
    if (jobTitleId) {
      await db.insert(USER_JOB).values({
        user_id: userId,
        job_title_id: jobTitleId,
        company: company,
        location: city || state || country
      });
    }

    // Insert languages (3-4 random languages)
    const languageCount = getRandomInt(3, 4);
    const selectedLanguages = [];
    while (selectedLanguages.length < languageCount) {
      const lang = getRandomElement(LANGUAGES_LIST);
      if (!selectedLanguages.includes(lang)) {
        selectedLanguages.push(lang);
      }
    }
    
    for (const language of selectedLanguages) {
      const languageId = await getOrCreateLanguage(language);
      if (languageId) {
        await db.insert(USER_LANGUAGES).values({
          user_id: userId,
          language_id: languageId
        });
      }
    }

    // Store lookingFor preference
    await storeLookingForPreference(userId, lookingFor);

    // Insert advanced matching preferences
    await db.insert(USER_ADVANCED_PREFERENCES).values({
      userId: userId,
      maxDistance: getRandomInt(20, 100),
      ageRangeMin: getRandomInt(20, 25),
      ageRangeMax: getRandomInt(28, 35),
      showOnlyVerified: Math.random() > 0.5,
      hideUsersWithRedFlags: Math.random() > 0.5,
      prioritizeActiveUsers: Math.random() > 0.7,
      matchingAlgorithm: getRandomElement(['personality', 'compatibility', 'hybrid'])
    });

    return {
      success: true,
      userId: userId,
      username: username,
      mbtiType: mbtiType,
      message: `User ${name} created successfully`
    };

  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// API Route Handler
export async function POST(request) {
  try {
    const data = await request.json();
    
    const result = await createUser(data);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        userId: result.userId,
        username: result.username,
        mbtiType: result.mbtiType,
        message: result.message
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.error
      }, { status: 400 });
    }

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to create user'
    }, { status: 500 });
  }
}

export async function GET(request) {
  return NextResponse.json({
    message: 'Admin User Creator API',
    version: '3.0',
    features: [
      'Unique username generation',
      'All 16 MBTI types rotation',
      'Complete compatibility test data',
      'Random realistic profiles',
      'Religion & caste support',
      'Location tracking',
      'Image upload support'
    ]
  });
}