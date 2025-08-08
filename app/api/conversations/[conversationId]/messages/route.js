// app/api/conversations/[conversationId]/messages/route.js
import { db } from '@/utils';
import { CONVERSATIONS, CONVERSATION_PARTICIPANTS, MESSAGES, USER, MESSAGE_READS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, desc, asc, isNull } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req, { params }) {
    // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const conversationId = parseInt(params.conversationId, 10);

    try {
        // Verify user is a participant in this conversation
        const isParticipant = await db
            .select({ id: CONVERSATION_PARTICIPANTS.id })
            .from(CONVERSATION_PARTICIPANTS)
            .where(
                and(
                    eq(CONVERSATION_PARTICIPANTS.conversation_id, conversationId),
                    eq(CONVERSATION_PARTICIPANTS.user_id, userId),
                    isNull(CONVERSATION_PARTICIPANTS.left_at)
                )
            )
            .execute();

        console.log('Checking participant status:', { userId, conversationId, isParticipant });

        if (isParticipant.length === 0) {
            return NextResponse.json({ message: 'Unauthorized access to conversation' }, { status: 403 });
        }

        // Get messages with sender information
        const messages = await db
            .select({
                id: MESSAGES.id,
                content: MESSAGES.content,
                created_at: MESSAGES.created_at,
                updated_at: MESSAGES.updated_at,
                is_edited: MESSAGES.is_edited,
                is_deleted: MESSAGES.is_deleted,
                reply_to_id: MESSAGES.reply_to_id,
                message_type: MESSAGES.message_type,
                sender: {
                    id: USER.id,
                    username: USER.username,
                    profileImageUrl: USER.profileImageUrl,
                }
            })
            .from(MESSAGES)
            .leftJoin(USER, eq(MESSAGES.sender_id, USER.id))
            .where(eq(MESSAGES.conversation_id, conversationId))
            .orderBy(asc(MESSAGES.created_at))
            .execute();

        // Mark messages as read
        const unreadMessages = messages
            .filter(msg => msg.sender.id !== userId)
            .map(msg => ({
                message_id: msg.id,
                user_id: userId,
                read_at: new Date()
            }));

        if (unreadMessages.length > 0) {
            try {
                // Using insert without onConflictDoNothing if not supported
                await db
                    .insert(MESSAGE_READS)
                    .values(unreadMessages)
                    .execute();
            } catch (error) {
                // Ignore duplicate key errors
                console.log('Error marking messages as read (possibly duplicates):', error.message);
            }

            // Update last_read_at in conversation participants
            await db
                .update(CONVERSATION_PARTICIPANTS)
                .set({ last_read_at: new Date() })
                .where(
                    and(
                        eq(CONVERSATION_PARTICIPANTS.conversation_id, conversationId),
                        eq(CONVERSATION_PARTICIPANTS.user_id, userId)
                    )
                )
                .execute();
        }

        return NextResponse.json({
            messages: messages
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({ message: 'Error fetching messages', error: error.message }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const conversationId = parseInt(params.conversationId, 10);

    try {
        const { content, messageType = 'text', replyToId = null } = await req.json();

        if (!content || content.trim() === '') {
            return NextResponse.json({ message: 'Message content is required' }, { status: 400 });
        }

        // Verify user is a participant in this conversation
        const isParticipant = await db
            .select({ id: CONVERSATION_PARTICIPANTS.id })
            .from(CONVERSATION_PARTICIPANTS)
            .where(
                and(
                    eq(CONVERSATION_PARTICIPANTS.conversation_id, conversationId),
                    eq(CONVERSATION_PARTICIPANTS.user_id, userId),
                    isNull(CONVERSATION_PARTICIPANTS.left_at)
                )
            )
            .execute();

        console.log('Checking participant status for POST:', { userId, conversationId, isParticipant });

        if (isParticipant.length === 0) {
            return NextResponse.json({ message: 'Unauthorized access to conversation' }, { status: 403 });
        }

        // Validate reply_to_id if provided
        if (replyToId) {
            const replyMessage = await db
                .select({ id: MESSAGES.id })
                .from(MESSAGES)
                .where(
                    and(
                        eq(MESSAGES.id, replyToId),
                        eq(MESSAGES.conversation_id, conversationId)
                    )
                )
                .execute();

            if (replyMessage.length === 0) {
                return NextResponse.json({ message: 'Invalid reply message ID' }, { status: 400 });
            }
        }

        // Create the message without returning
        await db
            .insert(MESSAGES)
            .values({
                conversation_id: conversationId,
                sender_id: userId,
                content: content,
                created_at: new Date(),
                updated_at: new Date(),
                message_type: messageType,
                reply_to_id: replyToId,
            })
            .execute();

        // Get the newly created message
        const newMessage = await db
            .select({ id: MESSAGES.id })
            .from(MESSAGES)
            .where(
                and(
                    eq(MESSAGES.conversation_id, conversationId),
                    eq(MESSAGES.sender_id, userId),
                    eq(MESSAGES.content, content)
                )
            )
            .orderBy(desc(MESSAGES.created_at))
            .limit(1)
            .execute();

        if (newMessage.length === 0) {
            throw new Error('Failed to create message');
        }

        const messageId = newMessage[0].id;

        // Update conversation last_message_at
        await db
            .update(CONVERSATIONS)
            .set({
                last_message_at: new Date(),
                updated_at: new Date()
            })
            .where(eq(CONVERSATIONS.id, conversationId))
            .execute();

        // Get the complete message with sender info
        const completeMessage = await db
            .select({
                id: MESSAGES.id,
                content: MESSAGES.content,
                created_at: MESSAGES.created_at,
                updated_at: MESSAGES.updated_at,
                is_edited: MESSAGES.is_edited,
                is_deleted: MESSAGES.is_deleted,
                reply_to_id: MESSAGES.reply_to_id,
                message_type: MESSAGES.message_type,
                conversation_id: MESSAGES.conversation_id,
                sender: {
                    id: USER.id,
                    username: USER.username,
                    profileImageUrl: USER.profileImageUrl,
                }
            })
            .from(MESSAGES)
            .leftJoin(USER, eq(MESSAGES.sender_id, USER.id))
            .where(eq(MESSAGES.id, messageId))
            .execute();

        return NextResponse.json(completeMessage[0]);
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json({ message: 'Error sending message', error: error.message }, { status: 500 });
    }
}