// app/api/conversations/route.js
import { db } from '@/utils';
import { CONVERSATIONS, CONVERSATION_PARTICIPANTS, MESSAGES, USER, USER_IMAGES } from '@/utils/schema'; // ADDED: USER_IMAGES import
import { NextResponse } from 'next/server';
import { and, eq, or, sql, desc, not, inArray, is, isNull } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

// GET: Fetch all conversations for the current user
export async function GET(req) {
    // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    try {
        // Get all conversations where the user is a participant
        const conversationsQuery = await db
            .select({
                conversation: {
                    id: CONVERSATIONS.id,
                    created_at: CONVERSATIONS.created_at,
                    updated_at: CONVERSATIONS.updated_at,
                    last_message_at: CONVERSATIONS.last_message_at,
                    is_group: CONVERSATIONS.is_group,
                    name: CONVERSATIONS.name,
                },
                participant: {
                    joined_at: CONVERSATION_PARTICIPANTS.joined_at,
                    is_muted: CONVERSATION_PARTICIPANTS.is_muted,
                    last_read_at: CONVERSATION_PARTICIPANTS.last_read_at,
                }
            })
            .from(CONVERSATIONS)
            .innerJoin(
                CONVERSATION_PARTICIPANTS,
                and(
                    eq(CONVERSATIONS.id, CONVERSATION_PARTICIPANTS.conversation_id),
                    eq(CONVERSATION_PARTICIPANTS.user_id, userId),
                    isNull(CONVERSATION_PARTICIPANTS.left_at)
                )
            )
            .orderBy(desc(CONVERSATIONS.last_message_at))
            .execute();

        // Get the last message and other participant for each conversation
        const conversationsWithDetails = await Promise.all(
            conversationsQuery.map(async (conv) => {
                // Get the last message
                const lastMessage = await db
                    .select({
                        id: MESSAGES.id,
                        content: MESSAGES.content,
                        created_at: MESSAGES.created_at,
                        sender_id: MESSAGES.sender_id,
                    })
                    .from(MESSAGES)
                    .where(eq(MESSAGES.conversation_id, conv.conversation.id))
                    .orderBy(desc(MESSAGES.created_at))
                    .limit(1)
                    .execute();

                // For non-group chats, get the other participant with profile image
                let otherUser = null;
                if (!conv.conversation.is_group) {
                    const otherParticipant = await db
                        .select({
                            user_id: CONVERSATION_PARTICIPANTS.user_id,
                        })
                        .from(CONVERSATION_PARTICIPANTS)
                        .where(
                            and(
                                eq(CONVERSATION_PARTICIPANTS.conversation_id, conv.conversation.id),
                                not(eq(CONVERSATION_PARTICIPANTS.user_id, userId)),
                                isNull(CONVERSATION_PARTICIPANTS.left_at)
                            )
                        )
                        .limit(1)
                        .execute();

                    if (otherParticipant.length > 0) {
                        const otherUserId = otherParticipant[0].user_id;
                        const userData = await db
                            .select({
                                id: USER.id,
                                username: USER.username,
                                // REMOVED: profileImageUrl from USER table
                                country: USER.country,
                                state: USER.state,
                                city: USER.city,
                                // ADDED: profile image from USER_IMAGES
                                profileImageUrl: USER_IMAGES.image_url
                            })
                            .from(USER)
                            .leftJoin(USER_IMAGES, and( // ADDED: Join with USER_IMAGES table
                                eq(USER_IMAGES.user_id, USER.id),
                                eq(USER_IMAGES.is_profile, true)
                            ))
                            .where(eq(USER.id, otherUserId))
                            .limit(1)
                            .execute();

                        if (userData.length > 0) {
                            otherUser = userData[0];
                        }
                    }
                }

                return {
                    conversation: conv.conversation,
                    participant: conv.participant,
                    lastMessage: lastMessage.length > 0 ? {
                        id: lastMessage[0].id,
                        content: lastMessage[0].content,
                        createdAt: lastMessage[0].created_at,
                        senderId: lastMessage[0].sender_id,
                    } : null,
                    otherUser: otherUser,
                };
            })
        );

        return NextResponse.json({
            conversations: conversationsWithDetails
        });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return NextResponse.json({ message: 'Error fetching conversations' }, { status: 500 });
    }
}

// POST: Create a new conversation
export async function POST(req) {
    // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    try {
        const { otherUserId } = await req.json();

        if (!otherUserId) {
            return NextResponse.json({ message: 'otherUserId is required' }, { status: 400 });
        }

        // Check if conversation already exists between these users
        // Alternative approach without using .as()
        const userConversationIds = await db
            .select({ conversationId: CONVERSATION_PARTICIPANTS.conversation_id })
            .from(CONVERSATION_PARTICIPANTS)
            .where(
                and(
                    eq(CONVERSATION_PARTICIPANTS.user_id, userId),
                    isNull(CONVERSATION_PARTICIPANTS.left_at)
                )
            )
            .execute();
        
        const userConversationIdList = userConversationIds.map(c => c.conversationId);
        
        // If the user has no conversations, we can skip the next query
        if (userConversationIdList.length > 0) {
            // Check which of these conversations also include the other user
            const existingConversation = await db
                .select({ conversationId: CONVERSATION_PARTICIPANTS.conversation_id })
                .from(CONVERSATION_PARTICIPANTS)
                .where(
                    and(
                        eq(CONVERSATION_PARTICIPANTS.user_id, otherUserId),
                        isNull(CONVERSATION_PARTICIPANTS.left_at),
                        inArray(CONVERSATION_PARTICIPANTS.conversation_id, userConversationIdList)
                    )
                )
                .innerJoin(
                    CONVERSATIONS,
                    and(
                        eq(CONVERSATIONS.id, CONVERSATION_PARTICIPANTS.conversation_id),
                        not(eq(CONVERSATIONS.is_group, true))
                    )
                )
                .limit(1)
                .execute();

            // If conversation exists, return it
            if (existingConversation.length > 0) {
                return NextResponse.json({
                    conversationId: existingConversation[0].conversationId,
                    message: 'Existing conversation found'
                });
            }
        }

        // Create new conversation - without using .returning()
        await db
            .insert(CONVERSATIONS)
            .values({
                created_at: new Date(),
                updated_at: new Date(),
                last_message_at: new Date(),
                is_group: false,
                created_by: userId,
            })
            .execute();
            
        // Get the ID of the newly created conversation
        const newConversation = await db
            .select({ id: CONVERSATIONS.id })
            .from(CONVERSATIONS)
            .where(
                and(
                    eq(CONVERSATIONS.created_by, userId),
                    eq(CONVERSATIONS.is_group, false)
                )
            )
            .orderBy(desc(CONVERSATIONS.created_at))
            .limit(1)
            .execute();
            
        if (newConversation.length === 0) {
            throw new Error('Failed to create conversation');
        }

        const conversationId = newConversation[0].id;

        // Add both users as participants
        await db
            .insert(CONVERSATION_PARTICIPANTS)
            .values([
                {
                    conversation_id: conversationId,
                    user_id: userId,
                    joined_at: new Date(),
                    is_admin: true,
                },
                {
                    conversation_id: conversationId,
                    user_id: otherUserId,
                    joined_at: new Date(),
                    is_admin: false,
                }
            ])
            .execute();

        return NextResponse.json({
            conversationId: conversationId,
            message: 'Conversation created successfully'
        });
    } catch (error) {
        console.error("Error creating conversation:", error);
        return NextResponse.json({ message: 'Error creating conversation' }, { status: 500 });
    }
}