import { db } from '@/utils';
import { ANSWERS, QUESTIONS, QUIZ_COMPLETION, TEST_PROGRESS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, inArray, sql } from 'drizzle-orm'; // Ensure these imports match your ORM version
import { authenticate } from '@/lib/jwtMiddleware';


export async function GET(req) {

    // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId; 
    const testId = 2 /* 2 is the compatibility test */
    try {

        let totalAnswered = 0;

        // Step 1: Check if isStarted is true in the QUIZ_SEQUENCES table
        const quizStatus = await db
                            .select({
                                isStarted: QUIZ_COMPLETION.isStarted,
                                completed: QUIZ_COMPLETION.completed,
                            })
                            .from(QUIZ_COMPLETION)
                            .where(
                                and(
                                    eq(QUIZ_COMPLETION.user_id, userId),
                                    eq(QUIZ_COMPLETION.test_id, testId)
                                )
                            )
                            .execute();
        console.log("After quiz status");

        if (quizStatus.length > 0 && quizStatus[0].completed === 'yes') {
            return NextResponse.json({quizCompleted: true, message: 'Quiz is already completed' }, { status: 200 });
        }              

        // Proceed only if a sequence exists and isStarted is true
        if (quizStatus.length > 0 && quizStatus[0].isStarted) { 
            // Geting the total no of saved quiz from USER_CAREER_PROGRESS if isStarted is true
            const totalQuestionsAnswered = await db
            .select({
                countQuestionIds: sql`COUNT(${TEST_PROGRESS.question_id})`
            })
            .from(TEST_PROGRESS)
            .where(eq(TEST_PROGRESS.user_id, userId))
            .execute();

            // The total number of questions answered
            totalAnswered = totalQuestionsAnswered[0]?.countQuestionIds || 0;
        }

        console.log("After quiz length");
       
        const questionWithAnswers = await db
            .select({
                questionId: QUESTIONS.id,
                questionText: QUESTIONS.questionText,
                answerId: ANSWERS.id,
                answerText: ANSWERS.answerText,
                points: ANSWERS.points,
            })
            .from(QUESTIONS)
            .leftJoin(ANSWERS, eq(QUESTIONS.id, ANSWERS.question_id)) 
            .where(eq(QUESTIONS.test_id, testId))
            .execute();

        console.log("After questions");
        if (questionWithAnswers.length === 0) {
            return NextResponse.json({ message: 'No questions found for the given Test id' }, { status: 404 });
        } 
        console.log(" questionWithAnswers", questionWithAnswers);

        // Grouping the answers by question
        const result = questionWithAnswers.reduce((acc, curr) => {
            const { questionId, questionText, answerId, answerText, points } = curr;
            if (!acc[questionId]) {
                acc[questionId] = {
                    id: questionId,
                    question: questionText,
                    answers: []
                };
            }
            acc[questionId].answers.push({
                id: answerId,
                text: answerText,
                points: points
            });
            return acc;
        }, {});

        // Step 4: Return the grouped questions with answers and the separate timer
        return NextResponse.json({
            quizProgress: totalAnswered,
            questions: Object.values(result)  // Send the grouped questions and answers
        });

    } catch (error) {
        console.error("Error fetching questions and answers:", error);
        return NextResponse.json({ message: 'Error fetching questions and answers' }, { status: 500 });
    }
}