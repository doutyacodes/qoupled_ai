// import { db } from '@/utils';
// import { USER, USER_LANGUAGES, USER_OCCUPATION } from '@/utils/schema';
// import { NextResponse } from 'next/server';
// import { eq, and } from 'drizzle-orm';

// export async function GET(req, { params }) {
//   try {
//     const userId = parseInt(params.id);
    
//     if (isNaN(userId)) {
//       return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
//     }
    
//     // Fetch user data
//     const userResult = await db
//       .select()
//       .from(USER)
//       .where(eq(USER.id, userId))
//       .limit(1);
    
//     if (!userResult || userResult.length === 0) {
//       return NextResponse.json({ message: 'User not found' }, { status: 404 });
//     }
    
//     const user = userResult[0];
    
//     // Remove sensitive data
//     delete user.password;
    
//     // Fetch user's languages
//     const languagesResult = await db
//       .select({ 
//         id: USER_LANGUAGES.id,
//         languageId: USER_LANGUAGES.language_id 
//       })
//       .from(USER_LANGUAGES)
//       .where(eq(USER_LANGUAGES.user_id, userId));
    
//     // Normally we would join with a languages table to get the language names
//     // Since you didn't provide the LANGUAGES table, we'll mock this data
//     const languages = languagesResult.map(lang => ({
//       id: lang.id,
//       name: `Language ${lang.languageId}` // In a real app, this would be the actual language name
//     }));
    
//     // Fetch user's occupation
//     const occupationResult = await db
//       .select()
//       .from(USER_OCCUPATION)
//       .where(eq(USER_OCCUPATION.user_id, userId))
//       .limit(1);
    
//     const occupation = occupationResult.length > 0 ? occupationResult[0] : null;
    
//     // Combine all data
//     const userData = {
//       ...user,
//       languages,
//       occupation
//     };
    
//     return NextResponse.json(userData);
//   } catch (error) {
//     console.error("Error fetching user profile:", error);
//     return NextResponse.json({ message: 'Error fetching user profile' }, { status: 500 });
//   }
// }


// app/api/users/[id]/route.js
import { db } from '@/utils';
import { USER, USER_EDUCATION, USER_JOB, USER_LANGUAGES, LANGUAGES } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req, { params }) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userId = parseInt(params.id);
  
  if (isNaN(userId)) {
    return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
  }

  try {
    // Get user basic info
    const user = await db.select().from(USER).where(eq(USER.id, userId)).limit(1);

    if (!user || user.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Get user education
    const education = await db.select().from(USER_EDUCATION).where(eq(USER_EDUCATION.user_id, userId));

    // Get user job
    const jobs = await db.select().from(USER_JOB).where(eq(USER_JOB.user_id, userId));

    // Get user languages
    const userLanguages = await db
      .select({
        id: USER_LANGUAGES.id,
        language: LANGUAGES.title
      })
      .from(USER_LANGUAGES)
      .innerJoin(LANGUAGES, eq(USER_LANGUAGES.language_id, LANGUAGES.id))
      .where(eq(USER_LANGUAGES.user_id, userId));

    // Calculate age from birthDate
    const birthDate = new Date(user[0].birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    const userData = {
      ...user[0],
      age,
      education,
      jobs,
      languages: userLanguages.map(lang => lang.language)
    };

    return NextResponse.json({ user: userData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ message: 'Error fetching user profile' }, { status: 500 });
  }
}