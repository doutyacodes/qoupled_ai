import { db } from '@/utils';
import {
    EDUCATION_LEVELS,
    INTERESTS,
    INTEREST_CATEGORIES,
    JOB_TITLES,
    LANGUAGES,
    USER,
    USER_ADVANCED_PREFERENCES,
    USER_EDUCATION,
    USER_INTERESTS,
    USER_JOB,
    USER_LANGUAGES,
    USER_MBTI_ASSESSMENT,
    QUIZ_SEQUENCES,  // CRITICAL: For MBTI quiz completion
    TEST_PROGRESS,   // CRITICAL: For compatibility test answers
    TESTS,
    QUESTIONS,
    ANSWERS
} from '@/utils/schema';
import bcrypt from 'bcryptjs';
import { eq, and, or, inArray } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// 16 MBTI Types
const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

// Sample data - RENAMED to avoid conflicts with schema table imports
const FIRST_NAMES = {
  male: ['Arjun', 'Rohan', 'Aditya', 'Vikram', 'Rahul', 'Karan', 'Raj', 'Amit', 'Siddharth', 'Nikhil', 'Varun', 'Akash', 'Dev', 'Aarav', 'Ishaan', 'Vihaan'],
  female: ['Priya', 'Ananya', 'Sneha', 'Riya', 'Aditi', 'Kavya', 'Neha', 'Pooja', 'Simran', 'Tanvi', 'Ishita', 'Meera', 'Diya', 'Saanvi', 'Aarohi', 'Kiara']
};

const LAST_NAMES = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Iyer', 'Mehta', 'Verma', 'Joshi', 'Nair', 'Gupta', 'Malhotra', 'Agarwal', 'Kapoor', 'Rao', 'Chopra'];

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];

const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain'];

const INCOME_RANGES = ['3-5 LPA', '5-8 LPA', '8-12 LPA', '12-18 LPA', '18-25 LPA', '25+ LPA'];

const EDUCATIONS = ['B.Tech', 'MBA', 'B.Com', 'M.Tech', 'BCA', 'MCA', 'BA', 'MA', 'BSc', 'MSc'];

const JOB_TITLE_OPTIONS = ['Software Engineer', 'Product Manager', 'Data Analyst', 'Marketing Manager', 'Business Analyst', 'UX Designer', 'Sales Manager', 'HR Manager', 'Financial Analyst', 'Consultant'];

const COMPANIES = ['TCS', 'Infosys', 'Wipro', 'Google', 'Microsoft', 'Amazon', 'Flipkart', 'Paytm', 'Zomato', 'Swiggy'];

const INTEREST_OPTIONS = ['Reading', 'Traveling', 'Cooking', 'Photography', 'Yoga', 'Music', 'Dancing', 'Sports', 'Gaming', 'Movies', 'Art', 'Fitness'];

const LANGUAGE_OPTIONS = ['Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Gujarati', 'Punjabi'];

// Helper functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateBirthDate(age) {
  const today = new Date();
  const birthYear = today.getFullYear() - age;
  const birthDate = new Date(birthYear, getRandomInt(0, 11), getRandomInt(1, 28));
  return birthDate.toISOString().split('T')[0];
}

function generateDummyUser(gender, mbtiType, index) {
  const age = getRandomInt(20, 30);
  const firstName = getRandomElement(FIRST_NAMES[gender]);
  const lastName = getRandomElement(LAST_NAMES);
  const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${getRandomInt(100, 999)}`;
  
  const user = {
    username: username,
    birthDate: generateBirthDate(age),
    gender: gender.charAt(0).toUpperCase() + gender.slice(1),
    password: `password${index}`,
    currentPlan: getRandomElement(['free', 'pro', 'elite']),
    isVerified: Math.random() > 0.5,
    phone: `+91${getRandomInt(6000000000, 9999999999)}`,
    isPhoneVerified: Math.random() > 0.3,
    email: `${username}@example.com`,
    isEmailVerified: Math.random() > 0.2,
    profileImageUrl: `https://i.pravatar.cc/300?img=${index}`,
    country: 'India',
    state: getRandomElement(['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Telangana']),
    city: getRandomElement(CITIES),
    religion: getRandomElement(RELIGIONS),
    caste: getRandomElement(['General', 'OBC', 'SC', 'ST', 'Prefer not to say']),
    height: (getRandomInt(150, 190) / 100).toFixed(2),
    weight: (getRandomInt(50, 90)).toFixed(2),
    income: getRandomElement(INCOME_RANGES),
    isProfileVerified: Math.random() > 0.4,
    isProfileComplete: Math.random() > 0.3,
    subscriptionStatus: getRandomElement(['active', 'expired', 'trial']),

    mbti: {
      mbtiType: mbtiType,
      extraversionScore: mbtiType[0] === 'E' ? getRandomInt(60, 100) : getRandomInt(0, 40),
      sensingScore: mbtiType[1] === 'S' ? getRandomInt(60, 100) : getRandomInt(0, 40),
      thinkingScore: mbtiType[2] === 'T' ? getRandomInt(60, 100) : getRandomInt(0, 40),
      judgingScore: mbtiType[3] === 'J' ? getRandomInt(60, 100) : getRandomInt(0, 40),
      confidenceLevel: getRandomElement(['low', 'medium', 'high']),
      assessmentVersion: '1.0'
    },

    education: {
      degree: getRandomElement(EDUCATIONS),
      graduationYear: getRandomInt(2015, 2023)
    },

    job: {
      jobTitle: getRandomElement(JOB_TITLE_OPTIONS),
      company: getRandomElement(COMPANIES),
      location: getRandomElement(CITIES)
    },

    languages: Array.from({ length: getRandomInt(2, 4) }, () => 
      getRandomElement(LANGUAGE_OPTIONS)
    ).filter((v, i, a) => a.indexOf(v) === i),

    interests: Array.from({ length: getRandomInt(3, 6) }, () => 
      getRandomElement(INTEREST_OPTIONS)
    ).filter((v, i, a) => a.indexOf(v) === i),

    matchingPreferences: {
      ageRangeMin: getRandomInt(20, 25),
      ageRangeMax: getRandomInt(28, 35),
      maxDistance: getRandomInt(20, 100),
      heightRangeMin: getRandomInt(150, 165),
      heightRangeMax: getRandomInt(170, 190),
      matchingAlgorithm: getRandomElement(['personality', 'compatibility', 'hybrid']),
      showOnlyVerified: Math.random() > 0.5,
      hideUsersWithRedFlags: Math.random() > 0.5,
      prioritizeActiveUsers: Math.random() > 0.7
    }
  };

  return user;
}

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

async function getOrCreateInterest(name) {
  try {
    const [existing] = await db
      .select()
      .from(INTERESTS)
      .where(eq(INTERESTS.name, name))
      .limit(1);
    
    if (existing) return existing.id;
    
    let categoryId = 1;
    const [category] = await db
      .select()
      .from(INTEREST_CATEGORIES)
      .where(eq(INTEREST_CATEGORIES.name, 'general'))
      .limit(1);
    
    if (category) {
      categoryId = category.id;
    }
    
    const [newInterest] = await db
      .insert(INTERESTS)
      .values({ 
        category_id: categoryId,
        name,
        display_name: name
      })
      .$returningId();
    
    return newInterest.id;
  } catch (error) {
    console.error('Error with interest:', error);
    return null;
  }
}

// CRITICAL: Insert QUIZ_SEQUENCES for MBTI quiz completion
async function insertMBTIQuizCompletion(userId, mbtiType) {
  try {
    await db.insert(QUIZ_SEQUENCES).values({
      user_id: userId,
      quiz_id: 1, // MBTI quiz ID
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

// CRITICAL: Insert TEST_PROGRESS for compatibility test (makes users matchable)
async function insertCompatibilityTestProgress(userId) {
  try {
    // Get compatibility test questions (test_id = 2)
    const questions = await db
      .select({
        questionId: QUESTIONS.id
      })
      .from(QUESTIONS)
      .where(eq(QUESTIONS.test_id, 2))
      .limit(60); // Typical compatibility test has ~60 questions

    if (questions.length === 0) {
      console.log('No compatibility test questions found, skipping test progress');
      return true; // Not a critical error if test doesn't exist
    }

    // For each question, insert a random answer with points
    for (const question of questions) {
      // Get answers for this question
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
          test_id: 2, // Compatibility test
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

// Insert a single user with all related data
async function insertUserToDatabase(userData, includeTestData = true) {
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // 1. Insert user
    const [user] = await db
      .insert(USER)
      .values({
        username: userData.username,
        birthDate: userData.birthDate,
        gender: userData.gender,
        password: hashedPassword,
        phone: userData.phone,
        isPhoneVerified: userData.isPhoneVerified,
        email: userData.email,
        isEmailVerified: userData.isEmailVerified,
        profileImageUrl: userData.profileImageUrl,
        country: userData.country,
        state: userData.state,
        city: userData.city,
        religion: userData.religion,
        caste: userData.caste,
        height: userData.height,
        weight: userData.weight,
        income: userData.income,
        currentPlan: userData.currentPlan,
        isVerified: userData.isVerified,
        subscriptionStatus: userData.subscriptionStatus,
        isProfileVerified: userData.isProfileVerified,
        isProfileComplete: userData.isProfileComplete,
      })
      .$returningId();
    
    const userId = user.id;

    // 2. Insert MBTI assessment
    await db.insert(USER_MBTI_ASSESSMENT).values({
      userId: userId,
      mbtiType: userData.mbti.mbtiType,
      extraversionScore: userData.mbti.extraversionScore,
      sensingScore: userData.mbti.sensingScore,
      thinkingScore: userData.mbti.thinkingScore,
      judgingScore: userData.mbti.judgingScore,
      confidenceLevel: userData.mbti.confidenceLevel,
      assessmentVersion: userData.mbti.assessmentVersion,
    });

    // 3. **CRITICAL**: Insert MBTI quiz completion (makes user discoverable in personality matching)
    await insertMBTIQuizCompletion(userId, userData.mbti.mbtiType);

    // 4. **CRITICAL**: Insert compatibility test progress (makes user discoverable in compatibility matching)
    if (includeTestData) {
      await insertCompatibilityTestProgress(userId);
    }

    // 5. Insert education
    const educationLevelId = await getOrCreateEducationLevel(userData.education.degree);
    if (educationLevelId) {
      await db.insert(USER_EDUCATION).values({
        user_id: userId,
        education_level_id: educationLevelId,
        degree: userData.education.degree,
        graduationYear: userData.education.graduationYear,
      });
    }

    // 6. Insert job
    const jobTitleId = await getOrCreateJobTitle(userData.job.jobTitle);
    if (jobTitleId) {
      await db.insert(USER_JOB).values({
        user_id: userId,
        job_title_id: jobTitleId,
        company: userData.job.company,
        location: userData.job.location,
      });
    }

    // 7. Insert languages
    for (const language of userData.languages) {
      const languageId = await getOrCreateLanguage(language);
      if (languageId) {
        await db.insert(USER_LANGUAGES).values({
          user_id: userId,
          language_id: languageId,
        });
      }
    }

    // 8. Insert interests
    for (const interest of userData.interests) {
      const interestId = await getOrCreateInterest(interest);
      if (interestId) {
        await db.insert(USER_INTERESTS).values({
          user_id: userId,
          interest_id: interestId,
        });
      }
    }

    // 9. Insert advanced matching preferences
    await db.insert(USER_ADVANCED_PREFERENCES).values({
      userId: userId,
      maxDistance: userData.matchingPreferences.maxDistance,
      ageRangeMin: userData.matchingPreferences.ageRangeMin,
      ageRangeMax: userData.matchingPreferences.ageRangeMax,
      showOnlyVerified: userData.matchingPreferences.showOnlyVerified,
      hideUsersWithRedFlags: userData.matchingPreferences.hideUsersWithRedFlags,
      prioritizeActiveUsers: userData.matchingPreferences.prioritizeActiveUsers,
      matchingAlgorithm: userData.matchingPreferences.matchingAlgorithm,
    });

    return { 
      success: true, 
      userId, 
      username: userData.username,
      mbtiType: userData.mbti.mbtiType 
    };
  } catch (error) {
    console.error('Error inserting user:', error);
    return { success: false, error: error.message };
  }
}

export async function POST(request) {
  try {
    const { count = 32, includeTestData = true } = await request.json();
    
    const users = [];
    let userIndex = 1;
    const insertResults = [];
    let successCount = 0;
    let failCount = 0;

    // Generate users for each MBTI type
    for (let i = 0; i < MBTI_TYPES.length; i++) {
      const mbtiType = MBTI_TYPES[i];
      
      const maleUser = generateDummyUser('male', mbtiType, userIndex++);
      users.push(maleUser);
      
      const femaleUser = generateDummyUser('female', mbtiType, userIndex++);
      users.push(femaleUser);
      
      const additionalCount = Math.floor((count - 32) / 16);
      for (let j = 0; j < additionalCount; j++) {
        const gender = j % 2 === 0 ? 'male' : 'female';
        const additionalUser = generateDummyUser(gender, mbtiType, userIndex++);
        users.push(additionalUser);
      }
    }

    const finalUsers = users.slice(0, count);

    console.log(`Starting insertion of ${finalUsers.length} users...`);
    
    for (let i = 0; i < finalUsers.length; i++) {
      const user = finalUsers[i];
      console.log(`Inserting user ${i + 1}/${finalUsers.length}: ${user.username} (${user.mbti.mbtiType})`);
      
      const result = await insertUserToDatabase(user, includeTestData);
      insertResults.push(result);
      
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    const mbtiDistribution = MBTI_TYPES.reduce((acc, type) => {
      acc[type] = finalUsers.filter(u => u.mbti.mbtiType === type).length;
      return acc;
    }, {});

    const genderDistribution = {
      male: finalUsers.filter(u => u.gender === 'Male').length,
      female: finalUsers.filter(u => u.gender === 'Female').length
    };

    return NextResponse.json({
      success: true,
      message: `Inserted ${successCount} users successfully, ${failCount} failed`,
      total: finalUsers.length,
      successCount,
      failCount,
      mbtiDistribution,
      genderDistribution,
      includeTestData,
      results: insertResults.slice(0, 10),
    });
  } catch (error) {
    console.error('Error in user generation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate and insert dummy users',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Testing API - Database Insertion with Matching System Compatibility',
    endpoint: '/api/testing',
    methods: {
      POST: 'Create users - { "count": 32, "includeTestData": true }',
      DELETE: 'Delete users - { "startId": 1, "endId": 50 } or { "deleteAll": true }'
    },
    features: [
      '16 MBTI types',
      'Male and Female users',
      'Age range 20-30',
      'Direct database insertion',
      'MBTI quiz completion (QUIZ_SEQUENCES)',
      'Compatibility test progress (TEST_PROGRESS)',
      'Users discoverable in matching system',
      'Complete user profiles',
      'Education and job details',
      'Languages and interests',
      'Matching preferences',
      'Password hashing (bcrypt)',
      'Bulk deletion by ID range',
    ],
    note: 'Users are fully compatible with the matching/filtering system'
  });
}

export async function DELETE(request) {
  try {
    const { startId, endId, deleteAll = false } = await request.json();

    // Validation
    if (!deleteAll && (!startId || !endId)) {
      return NextResponse.json({
        success: false,
        error: 'Please provide startId and endId, or set deleteAll to true'
      }, { status: 400 });
    }

    if (!deleteAll && startId > endId) {
      return NextResponse.json({
        success: false,
        error: 'startId must be less than or equal to endId'
      }, { status: 400 });
    }

    let userIds = [];
    let deletionStats = {
      users: 0,
      mbtiAssessments: 0,
      quizSequences: 0,
      testProgress: 0,
      education: 0,
      jobs: 0,
      languages: 0,
      interests: 0,
      preferences: 0
    };

    // Get user IDs to delete
    if (deleteAll) {
      const users = await db.select({ id: USER.id }).from(USER).execute();
      userIds = users.map(u => u.id);
    } else {
      // Get users in the ID range
      const users = await db
        .select({ id: USER.id })
        .from(USER)
        .where(
          and(
            eq(USER.id, startId) || eq(USER.id, endId) ? 
              or(
                eq(USER.id, startId),
                eq(USER.id, endId)
              ) : 
              and(
                eq(USER.id, startId),
                eq(USER.id, endId)
              )
          )
        )
        .execute();
      
      // For range, we need to filter manually since Drizzle doesn't have BETWEEN
      const allUsers = await db.select({ id: USER.id }).from(USER).execute();
      userIds = allUsers.filter(u => u.id >= startId && u.id <= endId).map(u => u.id);
    }

    if (userIds.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No users found in the specified range',
        deletionStats
      }, { status: 404 });
    }

    console.log(`Deleting ${userIds.length} users...`);

    // Delete in correct order (child tables first, then parent)
    for (const userId of userIds) {
      try {
        // 1. Delete test progress
        const testProgressDeleted = await db
          .delete(TEST_PROGRESS)
          .where(eq(TEST_PROGRESS.user_id, userId))
          .execute();
        deletionStats.testProgress += testProgressDeleted.rowsAffected || 0;

        // 2. Delete quiz sequences
        const quizDeleted = await db
          .delete(QUIZ_SEQUENCES)
          .where(eq(QUIZ_SEQUENCES.user_id, userId))
          .execute();
        deletionStats.quizSequences += quizDeleted.rowsAffected || 0;

        // 3. Delete MBTI assessment
        const mbtiDeleted = await db
          .delete(USER_MBTI_ASSESSMENT)
          .where(eq(USER_MBTI_ASSESSMENT.userId, userId))
          .execute();
        deletionStats.mbtiAssessments += mbtiDeleted.rowsAffected || 0;

        // 4. Delete education
        const educationDeleted = await db
          .delete(USER_EDUCATION)
          .where(eq(USER_EDUCATION.user_id, userId))
          .execute();
        deletionStats.education += educationDeleted.rowsAffected || 0;

        // 5. Delete job
        const jobDeleted = await db
          .delete(USER_JOB)
          .where(eq(USER_JOB.user_id, userId))
          .execute();
        deletionStats.jobs += jobDeleted.rowsAffected || 0;

        // 6. Delete languages
        const languagesDeleted = await db
          .delete(USER_LANGUAGES)
          .where(eq(USER_LANGUAGES.user_id, userId))
          .execute();
        deletionStats.languages += languagesDeleted.rowsAffected || 0;

        // 7. Delete interests
        const interestsDeleted = await db
          .delete(USER_INTERESTS)
          .where(eq(USER_INTERESTS.user_id, userId))
          .execute();
        deletionStats.interests += interestsDeleted.rowsAffected || 0;

        // 8. Delete preferences
        const preferencesDeleted = await db
          .delete(USER_ADVANCED_PREFERENCES)
          .where(eq(USER_ADVANCED_PREFERENCES.userId, userId))
          .execute();
        deletionStats.preferences += preferencesDeleted.rowsAffected || 0;

        // 9. Finally, delete the user
        const userDeleted = await db
          .delete(USER)
          .where(eq(USER.id, userId))
          .execute();
        deletionStats.users += userDeleted.rowsAffected || 0;

      } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletionStats.users} users`,
      range: deleteAll ? 'all users' : `${startId} to ${endId}`,
      deletionStats,
      deletedUserIds: userIds
    }, { status: 200 });

  } catch (error) {
    console.error('Error in bulk deletion:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete users',
      message: error.message
    }, { status: 500 });
  }
}