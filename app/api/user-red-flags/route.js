// File: /app/api/user-red-flags/route.js
import { db } from '@/utils';
import { USER_RED_FLAGS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

// Add a red flag
export async function POST(req) {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const data = await req.json();
    
    // Validate the request body
    if (!data.answerId) {
        return NextResponse.json({ 
            message: 'Answer ID is required' 
        }, { status: 400 });
    }

    try {
        // Find answer details to identify which question it belongs to
        // This would require joining with the ANSWERS table
        // For simplicity, let's assume we get the question ID from the request
        // or we retrieve it from a database lookup here
        
        // Check if this specific red flag already exists
        const existingSpecificFlag = await db
            .select()
            .from(USER_RED_FLAGS)
            .where(
                and(
                    eq(USER_RED_FLAGS.user_id, userId),
                    eq(USER_RED_FLAGS.answer_id, data.answerId)
                )
            )
            .execute();
            
        if (existingSpecificFlag.length > 0) {
            return NextResponse.json({ 
                message: 'This red flag is already selected'
            }, { status: 200 });
        }
        
        // For one red flag per question logic, we would need:
        // 1. Get the question_id for the answer_id being flagged
        // 2. Check if any existing red flags belong to the same question
        
        // This is a simplified approach - in a real implementation,
        // you would need to add a join with the ANSWERS table to get the question_id
        // and then check for existing red flags for that question
        
        // Insert the red flag
        await db.insert(USER_RED_FLAGS).values({
            user_id: userId,
            answer_id: data.answerId
        });
        
        // Get current count of red flags
        const redFlagCount = await db
            .select()
            .from(USER_RED_FLAGS)
            .where(eq(USER_RED_FLAGS.user_id, userId))
            .execute();
        
        return NextResponse.json({ 
            message: 'Red flag saved successfully',
            currentCount: redFlagCount.length
        }, { status: 201 });
        
    } catch (error) {
        console.error("Error saving red flag:", error);
        return NextResponse.json({ 
            message: 'Error saving red flag' 
        }, { status: 500 });
    }
}

// Remove a red flag
export async function DELETE(req) {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const url = new URL(req.url);
    const answerId = url.searchParams.get('answerId');
    
    if (!answerId) {
        return NextResponse.json({ 
            message: 'Answer ID is required' 
        }, { status: 400 });
    }
    
    try {
        // Delete the red flag
        await db
            .delete(USER_RED_FLAGS)
            .where(
                and(
                    eq(USER_RED_FLAGS.user_id, userId),
                    eq(USER_RED_FLAGS.answer_id, parseInt(answerId))
                )
            )
            .execute();
            
        // Get updated count
        const remainingRedFlags = await db
            .select()
            .from(USER_RED_FLAGS)
            .where(eq(USER_RED_FLAGS.user_id, userId))
            .execute();
            
        return NextResponse.json({ 
            message: 'Red flag removed successfully',
            currentCount: remainingRedFlags.length
        }, { status: 200 });
        
    } catch (error) {
        console.error("Error removing red flag:", error);
        return NextResponse.json({ 
            message: 'Error removing red flag' 
        }, { status: 500 });
    }
}

// Get all red flags for a user
export async function GET(req) {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    
    try {
        const userRedFlags = await db
            .select()
            .from(USER_RED_FLAGS)
            .where(eq(USER_RED_FLAGS.user_id, userId))
            .execute();
            
        return NextResponse.json({ 
            redFlags: userRedFlags,
            count: userRedFlags.length
        }, { status: 200 });
        
    } catch (error) {
        console.error("Error fetching red flags:", error);
        return NextResponse.json({ 
            message: 'Error fetching red flags' 
        }, { status: 500 });
    }
}