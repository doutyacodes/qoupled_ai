import { db } from '@/utils';
import { ANALYTICS_QUESTION, ANSWERS, OPTIONS, QUESTIONS, QUIZ_SEQUENCES, TASKS, USER_DETAILS, USER_PROGRESS, USER_TASKS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, inArray, sql } from 'drizzle-orm'; // Ensure these imports match your ORM version
import { authenticate } from '@/lib/jwtMiddleware';


export async function GET(req, { params }) {

    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
      }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;  
    const { quizId } = params;

    if (!quizId) {
        return NextResponse.json({ message: 'Invalid QuizId' }, { status: 400 });
    }
    
    try {
        let totalAnswered = 0;

        // Step 1: Check if isStarted is true in the QUIZ_SEQUENCES table
        const quizSequence = await db
                            .select({
                                isStarted: QUIZ_SEQUENCES.isStarted
                            })
                            .from(QUIZ_SEQUENCES)
                            .where(
                                and(
                                    eq(QUIZ_SEQUENCES.user_id, userId),
                                    eq(QUIZ_SEQUENCES.quiz_id, quizId)
                                )
                            )
                            .execute();
                            
        // Proceed only if a sequence exists and isStarted is true
        if (quizSequence.length > 0 && quizSequence[0].isStarted) { 
            // Geting the total no of saved quiz from USER_PROGRESS if isStarted is true
            const totalQuestionsAnswered = await db
            .select({
                countQuestionIds: sql`COUNT(${USER_PROGRESS.question_id})`
            })
            .from(USER_PROGRESS)
            .where(eq(USER_PROGRESS.user_id, userId))
            .execute();

            // The total number of questions answered
            totalAnswered = totalQuestionsAnswered[0]?.countQuestionIds || 0;
        }

        const quizWithOption = await db
            .select({
                questionId: ANALYTICS_QUESTION.id,
                questionText: ANALYTICS_QUESTION.question_text,
                answerId: OPTIONS.id,
                answerText: OPTIONS.option_text,
                analyticId: OPTIONS.analytic_id

            })
            .from(ANALYTICS_QUESTION)
            .leftJoin(OPTIONS, eq(ANALYTICS_QUESTION.id, OPTIONS.question_id))
            .where(eq(ANALYTICS_QUESTION.quiz_id, quizId))
            .execute();
            
        if (quizWithOption.length === 0) {
            return NextResponse.json({ message: 'No questions found for the given Task id' }, { status: 404 });
        }

        // Grouping the answers by question
        const result = quizWithOption.reduce((acc, curr) => {
            const { questionId, questionText, answerId, answerText, analyticId } = curr;
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
                analyticId: analyticId
            });
            return acc;
        }, {});

        // return NextResponse.json({ questions: Object.values(result) });

        // Step 5: Return the questions and answers along with the highest question ID
        return NextResponse.json({ 
            quizProgress: totalAnswered,
            questions: Object.values(result) 
        });

    } catch (error) {
        console.error("Error fetching questions and answers:", error);
        return NextResponse.json({ message: 'Error fetching questions and answers' }, { status: 500 });
    }
}