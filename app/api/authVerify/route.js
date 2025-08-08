import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { QUIZ_COMPLETION } from '@/utils/schema';
import { db } from '@/utils';
import { and, eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';


export async function POST(req) {

  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
      return NextResponse.json({ user: null, error: 'No token provided' }, { status: 200 }); // Return user as null with a 200 status
  }

  const token = authHeader.split(' ')[1];
    if(token){
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decoded) {
            return NextResponse.json({ user: null, error: 'Invalid token' }, { status: 200 }); // Return user as null with a 200 status
        }
    } catch (error) {
        console.error("Token verification error:", error);
        return NextResponse.json({ user: null, error: 'Token verification failed' }, { status: 200 }); // Return user as null with a 200 status
    }
  }


  // After verifying the token, proceed to fetch user data
  try {

      const authResult = await authenticate(req);
      if (!authResult.authenticated) {
          return authResult.response;
        }

      const userData = authResult.decoded_Data;
      const userId = userData.userId;
      console.log("userId", userId);

      const testId = 2; // Adjust test ID as needed

      const quizCompletion = await db
          .select({
              completed: QUIZ_COMPLETION.completed,
          })
          .from(QUIZ_COMPLETION)
          .where(
              and(
                  eq(QUIZ_COMPLETION.user_id, userId),
                  eq(QUIZ_COMPLETION.test_id, testId) // Assuming quizId is the test ID
              )
          )
          .execute();
      console.log("quizCompletion", quizCompletion);

      const completedStatus = quizCompletion && quizCompletion.length > 0 && quizCompletion[0].completed === 'yes' ? quizCompletion[0].completed : 'no';
      console.log({ user: userData, quizCompleted: completedStatus });
      
      return NextResponse.json(
          { user: userData, quizCompleted: completedStatus },
          { status: 200 } // Successful response
      );
  } catch (error) {
      console.error("Error processing request:", error);
      return NextResponse.json({ message: 'Error processing request' }, { status: 200 }); // Return 200 for error handling
  }

}