// app/api/users/profile/route.js
import { db } from '@/utils';
import { USER, USER_EDUCATION, USER_JOB, USER_LANGUAGES, LANGUAGES, EDUCATION_LEVELS, JOB_TITLES, USER_IMAGES } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    // Fetch user basic info
    const user = await db
      .select()
      .from(USER)
      .where(eq(USER.id, userId))
      .limit(1);

    if (!user || user.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Fetch user images from USER_IMAGES table
    const userImages = await db
      .select({
        id: USER_IMAGES.id,
        image_url: USER_IMAGES.image_url,
        is_profile: USER_IMAGES.is_profile,
        uploaded_at: USER_IMAGES.uploaded_at
      })
      .from(USER_IMAGES)
      .where(eq(USER_IMAGES.user_id, userId))
      .orderBy(USER_IMAGES.uploaded_at);

    // Fetch user education with education level
    const education = await db
      .select({
        id: USER_EDUCATION.id,
        education_level_id: USER_EDUCATION.education_level_id,
        levelName: EDUCATION_LEVELS.levelName,
        degree: USER_EDUCATION.degree,
        graduationYear: USER_EDUCATION.graduationYear
      })
      .from(USER_EDUCATION)
      .innerJoin(EDUCATION_LEVELS, eq(USER_EDUCATION.education_level_id, EDUCATION_LEVELS.id))
      .where(eq(USER_EDUCATION.user_id, userId));

    // Fetch user jobs with job title
    const jobs = await db
      .select({
        id: USER_JOB.id,
        job_title_id: USER_JOB.job_title_id,
        title: JOB_TITLES.title,
        company: USER_JOB.company,
        location: USER_JOB.location
      })
      .from(USER_JOB)
      .innerJoin(JOB_TITLES, eq(USER_JOB.job_title_id, JOB_TITLES.id))
      .where(eq(USER_JOB.user_id, userId));

    // Fetch user languages with their names
    const userLanguages = await db
      .select({
        id: LANGUAGES.id,
        name: LANGUAGES.title,
        created_at: USER_LANGUAGES.created_at
      })
      .from(USER_LANGUAGES)
      .innerJoin(LANGUAGES, eq(USER_LANGUAGES.language_id, LANGUAGES.id))
      .where(eq(USER_LANGUAGES.user_id, userId));

    // Prepare response object
    const profileData = {
      ...user[0],
      profileImages: userImages || [],
      education: education || [],
      jobs: jobs || [],
      languages: userLanguages || []
    };

    return NextResponse.json(profileData, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ message: 'Error fetching user profile' }, { status: 500 });
  }
}

  export async function PUT(req) {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    try {
      const requestData = await req.json();
      
      // Transaction for handling multiple tables update
      await db.transaction(async (tx) => {
        // 1. Update basic user information
        const { education, jobs, languages, profileImages, ...userInfo } = requestData;
        
        await tx
          .update(USER)
          .set({
            username: userInfo.username,
            birthDate: userInfo.birthDate ? new Date(userInfo.birthDate) : null,
            gender: userInfo.gender,
            phone: userInfo.phone,
            email: userInfo.email,
            country: userInfo.country,
            state: userInfo.state,
            city: userInfo.city,
            religion: userInfo.religion,
            caste: userInfo.caste,
            height: userInfo.height ? parseFloat(userInfo.height) : null,
            weight: userInfo.weight ? parseFloat(userInfo.weight) : null,
            income: userInfo.income,
            isProfileComplete: userInfo.username && userInfo.birthDate && userInfo.gender && 
                              userInfo.phone && userInfo.email ? true : false
          })
          .where(eq(USER.id, userId));
        
        // 2. Handle profile images
        if (profileImages !== undefined) {
          // Delete existing images
          await tx
            .delete(USER_IMAGES)
            .where(eq(USER_IMAGES.user_id, userId));
          
          // Insert new images
          if (profileImages.length > 0) {
            const imagesData = profileImages.map(img => ({
              user_id: userId,
              image_url: img.image_url,
              is_profile: img.is_profile || false
            }));
            
            await tx.insert(USER_IMAGES).values(imagesData);
          }
        }
        
        // 3. Handle education records
        if (education) {
          await tx
            .delete(USER_EDUCATION)
            .where(eq(USER_EDUCATION.user_id, userId));
          
          if (education.length > 0) {
            const educationData = education.map(edu => ({
              user_id: userId,
              education_level_id: edu.education_level_id,
              degree: edu.degree,
              graduationYear: edu.graduationYear ? parseInt(edu.graduationYear) : null
            }));
            
            await tx.insert(USER_EDUCATION).values(educationData);
          }
        }
        
        // 4. Handle job records
        if (jobs) {
          await tx
            .delete(USER_JOB)
            .where(eq(USER_JOB.user_id, userId));
          
          if (jobs.length > 0) {
            const jobsData = jobs.map(job => ({
              user_id: userId,
              job_title_id: job.job_title_id,
              company: job.company,
              location: job.location
            }));
            
            await tx.insert(USER_JOB).values(jobsData);
          }
        }
        
        // 5. Handle language records
        if (languages) {
          await tx
            .delete(USER_LANGUAGES)
            .where(eq(USER_LANGUAGES.user_id, userId));
          
          if (languages.length > 0) {
            const languagesData = languages.map(lang => ({
              user_id: userId,
              language_id: lang.id
            }));
            
            await tx.insert(USER_LANGUAGES).values(languagesData);
          }
        }
      });

      // Fetch updated data with images
      const updatedUser = await db
        .select()
        .from(USER)
        .where(eq(USER.id, userId))
        .limit(1);

      const userImages = await db
        .select({
          id: USER_IMAGES.id,
          image_url: USER_IMAGES.image_url,
          is_profile: USER_IMAGES.is_profile,
          uploaded_at: USER_IMAGES.uploaded_at
        })
        .from(USER_IMAGES)
        .where(eq(USER_IMAGES.user_id, userId))
        .orderBy(USER_IMAGES.uploaded_at);

      const education = await db
        .select({
          id: USER_EDUCATION.id,
          education_level_id: USER_EDUCATION.education_level_id,
          levelName: EDUCATION_LEVELS.levelName,
          degree: USER_EDUCATION.degree,
          graduationYear: USER_EDUCATION.graduationYear
        })
        .from(USER_EDUCATION)
        .innerJoin(EDUCATION_LEVELS, eq(USER_EDUCATION.education_level_id, EDUCATION_LEVELS.id))
        .where(eq(USER_EDUCATION.user_id, userId));

      const jobs = await db
        .select({
          id: USER_JOB.id,
          job_title_id: USER_JOB.job_title_id,
          title: JOB_TITLES.title,
          company: USER_JOB.company,
          location: USER_JOB.location
        })
        .from(USER_JOB)
        .innerJoin(JOB_TITLES, eq(USER_JOB.job_title_id, JOB_TITLES.id))
        .where(eq(USER_JOB.user_id, userId));

      const userLanguages = await db
        .select({
          id: LANGUAGES.id,
          name: LANGUAGES.title,
          created_at: USER_LANGUAGES.created_at
        })
        .from(USER_LANGUAGES)
        .innerJoin(LANGUAGES, eq(USER_LANGUAGES.language_id, LANGUAGES.id))
        .where(eq(USER_LANGUAGES.user_id, userId));

      const profileData = {
        ...updatedUser[0],
        profileImages: userImages || [],
        education: education || [],
        jobs: jobs || [],
        languages: userLanguages || []
      };

      return NextResponse.json(profileData, { status: 200 });
    } catch (error) {
      console.error("Error updating user profile:", error);
      return NextResponse.json({ message: 'Error updating user profile' }, { status: 500 });
    }
  }