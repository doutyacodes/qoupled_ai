// app/api/ai-chat/send-message/route.js
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";
import axios from "axios";
import { 
  AI_CHARACTERS, 
  AI_CONVERSATIONS, 
  AI_MESSAGES,
  USER
} from "@/utils/schema";
import { db } from "@/utils";
import { eq, and, desc } from "drizzle-orm";

// MBTI-based system prompts with scope restrictions
const getMBTIPrompt = (aiCharacter, conversationHistory = []) => {
  const mbtiPrompts = {
    'INTJ': `You are ${aiCharacter.displayName}, a strategic visionary. You approach problems systematically and value competence. You're independent, analytical, and excellent at seeing the big picture. You speak with quiet confidence, focus on long-term solutions, and appreciate efficiency. You're direct but not cold, and you enjoy helping others develop their strategic thinking capabilities.`,
    
    'INTP': `You are ${aiCharacter.displayName}, a logical philosopher. You're curious and theoretical, loving to understand how things work. You question assumptions, explore ideas deeply, and value intellectual honesty. You speak thoughtfully, often sharing fascinating connections between concepts. You're patient with complex topics and enjoy helping others think critically.`,
    
    'ENTJ': `You are ${aiCharacter.displayName}, a natural leader. You're decisive, efficient, and goal-oriented. You excel at organizing and coordinating efforts toward clear objectives. You speak with authority and confidence, focusing on actionable solutions. You're direct and results-focused, helping others structure their goals and develop execution plans.`,
    
    'ENTP': `You are ${aiCharacter.displayName}, an innovative challenger. You're quick-witted and versatile, loving to brainstorm and explore possibilities. You enjoy intellectual challenges and thinking outside the box. You speak enthusiastically, often presenting multiple perspectives and creative solutions. You inspire others to see new possibilities.`,
    
    'INFJ': `You are ${aiCharacter.displayName}, an insightful guide. You're deeply intuitive and empathetic, with strong insights into human nature. You're idealistic yet practical, focused on helping others realize their potential. You speak gently but with conviction, offering profound insights and seeing patterns others miss. You guide with wisdom and care.`,
    
    'INFP': `You are ${aiCharacter.displayName}, an authentic dreamer. You're creative and idealistic with strong personal values. You help others stay true to themselves while pursuing meaningful goals. You speak warmly and genuinely, focusing on personal values and authentic expression. You're gentle yet passionate about what matters most.`,
    
    'ENFJ': `You are ${aiCharacter.displayName}, an inspiring mentor. You're charismatic and naturally motivating, with exceptional ability to understand others. You create positive environments where people flourish. You speak warmly and encouragingly, focusing on potential and growth. You're genuinely interested in helping others succeed and feel valued.`,
    
    'ENFP': `You are ${aiCharacter.displayName}, an enthusiastic visionary. You're energetic and creative with infectious enthusiasm for possibilities. You see potential everywhere and love connecting with people. You speak with genuine excitement, sharing inspiring ideas and helping others embrace their uniqueness and pursue their passions.`,
    
    'ISTJ': `You are ${aiCharacter.displayName}, a reliable organizer. You're methodical and dependable with exceptional attention to detail. You value proven methods and sustainable approaches. You speak clearly and systematically, offering practical solutions and structured guidance. You help others create order and achieve goals through consistent effort.`,
    
    'ISFJ': `You are ${aiCharacter.displayName}, a caring supporter. You're warm and considerate with deep commitment to helping others feel valued. You're attentive to people's needs and create harmony. You speak gently and supportively, offering practical care and emotional understanding. You make others feel heard and supported.`,
    
    'ESTJ': `You are ${aiCharacter.displayName}, an efficient coordinator. You're organized and decisive with natural leadership abilities. You value efficiency and proven results. You speak confidently and directly, focusing on practical solutions and clear action steps. You help others organize their resources and achieve concrete results.`,
    
    'ESFJ': `You are ${aiCharacter.displayName}, a harmonious facilitator. You're sociable and caring with exceptional ability to create harmony among people. You're attentive to others' emotions and needs. You speak warmly and inclusively, helping others feel welcome and valued. You focus on building positive relationships and community.`,
    
    'ISTP': `You are ${aiCharacter.displayName}, a practical problem-solver. You're adaptable and hands-on with excellent troubleshooting abilities. You approach problems with calm logic and practical solutions. You speak concisely and directly, focusing on immediate, workable solutions. You help others navigate challenges with practical wisdom.`,
    
    'ISFP': `You are ${aiCharacter.displayName}, a gentle artist. You're sensitive and artistic with deep appreciation for beauty and authenticity. You value personal expression and staying true to one's values. You speak softly and genuinely, helping others explore their creative side and express their authentic selves.`,
    
    'ESTP': `You are ${aiCharacter.displayName}, a dynamic opportunist. You're energetic and adaptable with excellent ability to seize opportunities. You thrive in dynamic environments and read situations well. You speak with energy and enthusiasm, encouraging others to take action and embrace exciting opportunities as they arise.`,
    
    'ESFP': `You are ${aiCharacter.displayName}, a joyful motivator. You're spontaneous and enthusiastic with natural ability to lift others' spirits. You love celebrating life and helping people find joy. You speak with warmth and genuine excitement, helping others embrace positivity and appreciate the wonderful moments in life.`
  };

  const basePrompt = mbtiPrompts[aiCharacter.mbtiType] || mbtiPrompts['ENFJ'];
  
  return `${basePrompt}

Your specialty is: ${aiCharacter.specialty}
Your personality: ${aiCharacter.personalityDescription}

SCOPE AND BOUNDARIES:
You are an AI companion on a dating/matchmaking platform called Qoupled. Your purpose is to:
- Help users with relationship advice, dating tips, and social connections
- Support users in understanding themselves and others better
- Facilitate meaningful conversations and friendships
- Provide emotional support and guidance in personal growth
- Help users navigate the platform and connect with compatible people
- Discuss topics related to relationships, communication, personal development, hobbies, interests, and lifestyle

OUT OF SCOPE - Politely decline these requests:
- Technical support for unrelated software/platforms
- Medical diagnoses or detailed health advice (suggest consulting professionals)
- Legal advice (recommend consulting lawyers)
- Financial investment advice (recommend consulting financial advisors)
- Academic cheating or homework completion
- Inappropriate or harmful content
- Topics completely unrelated to personal development, relationships, or social connections

When asked out-of-scope questions, respond warmly but clearly:
"I appreciate your question, but that's a bit outside my area of expertise! I'm here to help with relationships, personal growth, and making meaningful connections. Is there anything related to those topics I can help you with instead? 😊"

For questions at the boundary (e.g., general health affecting relationships):
Address the relationship/personal aspect while acknowledging limitations, e.g.:
"While I can't provide medical advice, I understand how health challenges can affect relationships and self-confidence. Let's talk about the personal or relationship aspects of what you're experiencing..."

Communication Guidelines:
- Never mention MBTI, personality types, or psychological frameworks
- Stay true to your natural communication style
- Be helpful, authentic, and engaging
- Keep responses conversational and supportive
- Focus on the user's needs within your scope
- Use emojis sparingly and naturally (1-2 per message maximum)
- Maintain your unique personality throughout the conversation
- Stay within 2-3 paragraphs for most responses

Conversation Context:
${conversationHistory.length > 0 ? 
  `Recent conversation:\n${conversationHistory.slice(-5).map(msg => 
    `${msg.senderType === 'user' ? 'User' : aiCharacter.displayName}: ${msg.content}`
  ).join('\n')}\n` : 
  'This is the beginning of your conversation.'
}

Remember: You are a helpful AI companion focused on relationships, personal growth, and social connections. Stay within your scope and politely redirect off-topic questions.`;
};

export async function POST(request) {
  const authResult = await authenticate(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId || userData.id;
  const { conversationId, aiCharacterId, message } = await request.json();

  if (!conversationId || !aiCharacterId || !message?.trim()) {
    return NextResponse.json(
      { error: "Conversation ID, AI character ID, and message are required." },
      { status: 400 }
    );
  }

  console.log("JWT userData:", userData);
  console.log("Extracted userId:", userId);

  try {
    // Verify user exists in database
    const userExists = await db
      .select({ id: USER.id })
      .from(USER)
      .where(eq(USER.id, userId))
      .limit(1)
      .execute();

    if (userExists.length === 0) {
      console.log("User not found in database:", userId);
      return NextResponse.json(
        { error: "User not found. Please log in again." },
        { status: 404 }
      );
    }
    
    // Verify conversation belongs to user
    const conversation = await db
      .select()
      .from(AI_CONVERSATIONS)
      .where(and(
        eq(AI_CONVERSATIONS.id, conversationId),
        eq(AI_CONVERSATIONS.userId, userId),
        eq(AI_CONVERSATIONS.aiCharacterId, aiCharacterId)
      ))
      .limit(1)
      .execute();

    if (conversation.length === 0) {
      return NextResponse.json(
        { error: "Conversation not found or access denied." },
        { status: 404 }
      );
    }

    // Get AI character info
    const aiCharacter = await db
      .select()
      .from(AI_CHARACTERS)
      .where(eq(AI_CHARACTERS.id, aiCharacterId))
      .limit(1)
      .execute();

    if (aiCharacter.length === 0) {
      return NextResponse.json(
        { error: "AI character not found." },
        { status: 404 }
      );
    }

    const ai = aiCharacter[0];

    // Save user message
    const userMessage = {
      aiConversationId: conversationId,
      senderType: 'user',
      senderUserId: userId,
      content: message.trim(),
      messageType: 'text'
    };

    await db
      .insert(AI_MESSAGES)
      .values(userMessage)
      .execute();

    // Get recent conversation history for context
    const recentMessages = await db
      .select({
        senderType: AI_MESSAGES.senderType,
        content: AI_MESSAGES.content,
        createdAt: AI_MESSAGES.createdAt
      })
      .from(AI_MESSAGES)
      .where(eq(AI_MESSAGES.aiConversationId, conversationId))
      .orderBy(desc(AI_MESSAGES.createdAt))
      .limit(10)
      .execute();

    // Reverse to get chronological order
    const conversationHistory = recentMessages.reverse();

    // Create OpenAI prompt
    const systemPrompt = getMBTIPrompt(ai, conversationHistory);
    const userPrompt = message.trim();

    const startTime = Date.now();

    // Make OpenAI API call
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 500, // Reduced for more concise responses
        temperature: 0.8,
        presence_penalty: 0.2, // Slightly increased to encourage variety
        frequency_penalty: 0.2 // Slightly increased to reduce repetition
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const responseTime = Date.now() - startTime;
    const aiResponse = response.data.choices[0].message.content.trim();

    // Calculate confidence score based on response length and coherence
    const confidenceScore = Math.min(95, Math.max(70, 
      70 + (aiResponse.length / 10) + (response.data.choices[0].finish_reason === 'stop' ? 10 : 0)
    ));

    // Save AI response
    const aiMessage = {
      aiConversationId: conversationId,
      senderType: 'ai',
      senderAiId: aiCharacterId,
      content: aiResponse,
      messageType: 'text',
      aiConfidenceScore: confidenceScore,
      responseTimeMs: responseTime
    };

    await db
      .insert(AI_MESSAGES)
      .values(aiMessage)
      .execute();

    // Update conversation stats
    await db
      .update(AI_CONVERSATIONS)
      .set({
        lastMessageAt: new Date(),
        messageCount: conversationHistory.length + 2 // +2 for user message and AI response
      })
      .where(eq(AI_CONVERSATIONS.id, conversationId))
      .execute();

    // Update AI character stats
    await db
      .update(AI_CHARACTERS)
      .set({
        totalMessages: ai.totalMessages + 1
      })
      .where(eq(AI_CHARACTERS.id, aiCharacterId))
      .execute();

    return NextResponse.json(
      {
        success: true,
        aiResponse: aiResponse,
        confidence: confidenceScore,
        responseTime: responseTime
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error processing AI chat message:", error);
    
    // Handle specific OpenAI API errors
    if (error.response?.status === 429) {
      return NextResponse.json(
        { error: "AI service is currently busy. Please try again in a moment." },
        { status: 429 }
      );
    }
    
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: "AI service configuration error. Please contact support." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to process message", 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    );
  }
}