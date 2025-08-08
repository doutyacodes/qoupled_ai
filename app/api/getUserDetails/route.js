import { db } from '@/utils';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm'; 
import { authenticate } from '@/lib/jwtMiddleware';
import { USER_DETAILS, USER_LANGUAGES, USER_OCCUPATION, LANGUAGES } from '@/utils/schema';

export async function GET(req) {
    console.log('got')
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }
    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    console.log(userId)
    
    try {
        // Fetch user details
        const [user] = await db
            .select()
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId));

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 } // Not Found
            );
        }

        // Fetch occupation details
        const [occupation] = await db
            .select()
            .from(USER_OCCUPATION)
            .where(eq(USER_OCCUPATION.user_id, userId));

        // Fetch languages
        const languages = await db
            .select({
                languageId: LANGUAGES.id,
                languageName: LANGUAGES.title 
            })
            .from(USER_LANGUAGES)
            .innerJoin(LANGUAGES, eq(USER_LANGUAGES.language_id, LANGUAGES.id))
            .where(eq(USER_LANGUAGES.user_id, userId)); 

        // Return combined data
        return NextResponse.json({ user, occupation, languages }, { status: 200 }); // Use status 200 for success
    } catch (error) {
        console.error("Error fetching user data", error);
        return NextResponse.json({ message: 'Error fetching user data' }, { status: 500 });
    }
}
