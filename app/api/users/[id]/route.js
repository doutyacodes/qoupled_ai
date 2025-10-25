// app/api/users/[id]/route.js
import { db } from '@/utils';
import { 
  USER, 
  USER_EDUCATION, 
  EDUCATION_LEVELS,
  USER_JOB, 
  JOB_TITLES,
  USER_LANGUAGES, 
  LANGUAGES,
  USER_PREFERENCE_VALUES,
  PREFERENCE_CATEGORIES,
  PREFERENCE_OPTIONS,
  USER_IMAGES
} from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, and, sql } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req, { params }) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userId = parseInt(params.id);
  
  if (isNaN(userId)) {
    return NextResponse.json({ 
      message: 'Invalid user ID',
      success: false 
    }, { status: 400 });
  }

  try {
    // ====================================
    // GET USER BASIC INFO WITH PROFILE IMAGE
    // ====================================
    const user = await db
      .select({
        id: USER.id,
        username: USER.username,
        birthDate: USER.birthDate,
        gender: USER.gender,
        
        // NEW PRICING FIELDS
        currentPlan: USER.currentPlan,
        isVerified: USER.isVerified,
        verificationDate: USER.verificationDate,
        profileBoostActive: USER.profileBoostActive,
        profileBoostEnds: USER.profileBoostEnds,
        subscriptionStatus: USER.subscriptionStatus,
        subscriptionEnds: USER.subscriptionEnds,

        // Contact and verification fields
        phone: USER.phone,
        isPhoneVerified: USER.isPhoneVerified,
        email: USER.email,
        isEmailVerified: USER.isEmailVerified,
        
        // Location and personal details
        country: USER.country,
        state: USER.state,
        city: USER.city,
        religion: USER.religion,
        caste: USER.caste,
        
        // Physical attributes
        height: USER.height,
        weight: USER.weight,
        income: USER.income,
        
        // Profile status
        isProfileVerified: USER.isProfileVerified,
        isProfileComplete: USER.isProfileComplete,
        
        // Profile image from USER_IMAGES (not USER table)
        profileImageUrl: sql`COALESCE(${USER_IMAGES.image_url}, '')`.as('profileImageUrl')

      })
      .from(USER)
      .leftJoin(USER_IMAGES, and(
        eq(USER_IMAGES.user_id, USER.id),
        eq(USER_IMAGES.is_profile, true)
      ))
      .where(eq(USER.id, userId))
      .limit(1);

    if (!user || user.length === 0) {
      return NextResponse.json({ 
        message: 'User not found',
        success: false 
      }, { status: 404 });
    }

    // ====================================
    // GET USER'S LOOKING FOR PREFERENCE
    // ====================================
    let lookingFor = null;
    try {
      // Find the looking_for category
      const [category] = await db
        .select({ id: PREFERENCE_CATEGORIES.id })
        .from(PREFERENCE_CATEGORIES)
        .where(eq(PREFERENCE_CATEGORIES.name, 'looking_for'))
        .limit(1);

      if (category) {
        // Get user's preference
        const [preference] = await db
          .select({
            value: PREFERENCE_OPTIONS.value
          })
          .from(USER_PREFERENCE_VALUES)
          .leftJoin(PREFERENCE_OPTIONS, eq(USER_PREFERENCE_VALUES.optionId, PREFERENCE_OPTIONS.id))
          .where(
            and(
              eq(USER_PREFERENCE_VALUES.userId, userId),
              eq(USER_PREFERENCE_VALUES.categoryId, category.id)
            )
          )
          .limit(1);

        lookingFor = preference?.value || null;
      }
    } catch (prefError) {
      console.error('Error fetching lookingFor preference:', prefError);
    }

    // ====================================
    // GET USER EDUCATION WITH DETAILS
    // ====================================
    const education = await db
      .select({
        id: USER_EDUCATION.id,
        degree: USER_EDUCATION.degree,
        levelName: EDUCATION_LEVELS.levelName,
        graduationYear: USER_EDUCATION.graduationYear
      })
      .from(USER_EDUCATION)
      .leftJoin(EDUCATION_LEVELS, eq(USER_EDUCATION.education_level_id, EDUCATION_LEVELS.id))
      .where(eq(USER_EDUCATION.user_id, userId));

    // ====================================
    // GET USER JOB WITH DETAILS
    // ====================================
    const jobs = await db
      .select({
        id: USER_JOB.id,
        title: JOB_TITLES.title,
        company: USER_JOB.company,
        location: USER_JOB.location
      })
      .from(USER_JOB)
      .leftJoin(JOB_TITLES, eq(USER_JOB.job_title_id, JOB_TITLES.id))
      .where(eq(USER_JOB.user_id, userId));

    // ====================================
    // GET USER LANGUAGES
    // ====================================
    const userLanguages = await db
      .select({
        id: USER_LANGUAGES.id,
        language: LANGUAGES.title
      })
      .from(USER_LANGUAGES)
      .innerJoin(LANGUAGES, eq(USER_LANGUAGES.language_id, LANGUAGES.id))
      .where(eq(USER_LANGUAGES.user_id, userId));

    // ====================================
    // CALCULATE AGE FROM BIRTHDATE
    // ====================================
    const birthDate = new Date(user[0].birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // ====================================
    // PREPARE USER DATA RESPONSE
    // ====================================
    const userData = {
      ...user[0],
      age,
      lookingFor, // Add lookingFor preference
      education,
      jobs,
      languages: userLanguages.map(lang => lang.language)
    };

    return NextResponse.json({ 
      user: userData,
      success: true 
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ 
      message: 'Error fetching user profile',
      error: error.message,
      success: false 
    }, { status: 500 });
  }
}