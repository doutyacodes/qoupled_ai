// app/api/matches/filter-options/route.js
import { db } from '@/utils';
import { 
  USER,
  EDUCATION_LEVELS,
  JOB_TITLES,
  LANGUAGES,
  PREFERENCE_CATEGORIES,
  PREFERENCE_OPTIONS
} from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, isNotNull, sql } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req) {
  // Authenticate user
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    // ====================================
    // GET UNIQUE COUNTRIES
    // ====================================
    const countries = await db
      .selectDistinct({ country: USER.country })
      .from(USER)
      .where(isNotNull(USER.country))
      .execute();

    // ====================================
    // GET UNIQUE STATES
    // ====================================
    const states = await db
      .selectDistinct({ state: USER.state })
      .from(USER)
      .where(isNotNull(USER.state))
      .execute();

    // ====================================
    // GET UNIQUE CITIES
    // ====================================
    const cities = await db
      .selectDistinct({ city: USER.city })
      .from(USER)
      .where(isNotNull(USER.city))
      .execute();

    // ====================================
    // GET UNIQUE RELIGIONS
    // ====================================
    const religions = await db
      .selectDistinct({ religion: USER.religion })
      .from(USER)
      .where(isNotNull(USER.religion))
      .execute();

    // ====================================
    // GET UNIQUE CASTES
    // ====================================
    const castes = await db
      .selectDistinct({ caste: USER.caste })
      .from(USER)
      .where(isNotNull(USER.caste))
      .execute();

    // ====================================
    // GET ALL EDUCATION LEVELS
    // ====================================
    const educationLevels = await db
      .select({
        id: EDUCATION_LEVELS.id,
        levelName: EDUCATION_LEVELS.levelName
      })
      .from(EDUCATION_LEVELS)
      .execute();

    // ====================================
    // GET ALL JOB TITLES
    // ====================================
    const jobTitles = await db
      .select({
        id: JOB_TITLES.id,
        title: JOB_TITLES.title
      })
      .from(JOB_TITLES)
      .execute();

    // ====================================
    // GET ALL LANGUAGES
    // ====================================
    const languages = await db
      .select({
        id: LANGUAGES.id,
        title: LANGUAGES.title
      })
      .from(LANGUAGES)
      .execute();

    // ====================================
    // GET AGE RANGE (MIN AND MAX AGES)
    // ====================================
    const ageStats = await db
      .select({
        minBirthDate: sql`MAX(${USER.birthDate})`,
        maxBirthDate: sql`MIN(${USER.birthDate})`
      })
      .from(USER)
      .where(isNotNull(USER.birthDate))
      .execute();

    let minAge = 18;
    let maxAge = 60;

    if (ageStats.length > 0 && ageStats[0].minBirthDate && ageStats[0].maxBirthDate) {
      const today = new Date();
      
      // Calculate max age (from oldest birthdate)
      const oldestBirth = new Date(ageStats[0].minBirthDate);
      maxAge = today.getFullYear() - oldestBirth.getFullYear();
      
      // Calculate min age (from youngest birthdate)
      const youngestBirth = new Date(ageStats[0].maxBirthDate);
      minAge = today.getFullYear() - youngestBirth.getFullYear();
    }

    // ====================================
    // GET HEIGHT RANGE
    // ====================================
    const heightStats = await db
      .select({
        minHeight: sql`MIN(${USER.height})`,
        maxHeight: sql`MAX(${USER.height})`
      })
      .from(USER)
      .where(isNotNull(USER.height))
      .execute();

    // ====================================
    // GET WEIGHT RANGE
    // ====================================
    const weightStats = await db
      .select({
        minWeight: sql`MIN(${USER.weight})`,
        maxWeight: sql`MAX(${USER.weight})`
      })
      .from(USER)
      .where(isNotNull(USER.weight))
      .execute();

    // ====================================
    // GET INCOME RANGES
    // ====================================
    const incomeRanges = await db
      .selectDistinct({ income: USER.income })
      .from(USER)
      .where(isNotNull(USER.income))
      .execute();

    // ====================================
    // GET LOOKING FOR OPTIONS
    // ====================================
    let lookingForOptions = ['Male', 'Female', 'Both', 'Any'];
    try {
      const [category] = await db
        .select({ id: PREFERENCE_CATEGORIES.id })
        .from(PREFERENCE_CATEGORIES)
        .where(eq(PREFERENCE_CATEGORIES.name, 'looking_for'))
        .limit(1);

      if (category) {
        const options = await db
          .select({ value: PREFERENCE_OPTIONS.value })
          .from(PREFERENCE_OPTIONS)
          .where(eq(PREFERENCE_OPTIONS.categoryId, category.id))
          .execute();
        
        if (options.length > 0) {
          lookingForOptions = options.map(opt => opt.value);
        }
      }
    } catch (error) {
      console.error('Error fetching lookingFor options:', error);
    }

    // ====================================
    // PREPARE RESPONSE
    // ====================================
    const filterOptions = {
      locations: {
        countries: countries.map(c => c.country).filter(Boolean).sort(),
        states: states.map(s => s.state).filter(Boolean).sort(),
        cities: cities.map(c => c.city).filter(Boolean).sort()
      },
      demographics: {
        religions: religions.map(r => r.religion).filter(Boolean).sort(),
        castes: castes.map(c => c.caste).filter(Boolean).sort(),
        lookingFor: lookingForOptions
      },
      education: {
        levels: educationLevels.map(e => ({ id: e.id, name: e.levelName }))
      },
      career: {
        jobTitles: jobTitles.map(j => ({ id: j.id, title: j.title }))
      },
      languages: languages.map(l => ({ id: l.id, name: l.title })),
      ranges: {
        age: {
          min: minAge,
          max: maxAge,
          default: { min: 18, max: 40 }
        },
        height: {
          min: heightStats[0]?.minHeight || 140,
          max: heightStats[0]?.maxHeight || 200,
          default: { min: 150, max: 185 }
        },
        weight: {
          min: weightStats[0]?.minWeight || 40,
          max: weightStats[0]?.maxWeight || 120,
          default: { min: 50, max: 90 }
        }
      },
      income: {
        ranges: incomeRanges.map(i => i.income).filter(Boolean).sort()
      },
      matchQuality: [
        { value: 'exceptional', label: 'Perfect Match (80%+)', color: 'emerald' },
        { value: 'great', label: 'Great Match (60-79%)', color: 'blue' },
        { value: 'good', label: 'Good Match (<60%)', color: 'amber' }
      ],
      verificationStatus: [
        { value: 'verified', label: 'Verified Profiles Only' },
        { value: 'unverified', label: 'Include Unverified' }
      ]
    };

    return NextResponse.json({
      success: true,
      filterOptions
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching filter options:", error);
    return NextResponse.json({
      success: false,
      message: 'Error fetching filter options',
      error: error.message
    }, { status: 500 });
  }
}