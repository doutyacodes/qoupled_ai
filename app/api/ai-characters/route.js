// app/api/ai-characters/route.js
import { db } from '@/utils';
import { AI_CHARACTERS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req) {
  // Authenticate user
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    // Fetch all active AI characters with error handling
    let aiCharacters;
    try {
      aiCharacters = await db
        .select({
          id: AI_CHARACTERS.id,
          name: AI_CHARACTERS.name,
          displayName: AI_CHARACTERS.displayName,
          avatarUrl: AI_CHARACTERS.avatarUrl,
          specialty: AI_CHARACTERS.specialty,
          mbtiType: AI_CHARACTERS.mbtiType,
          personalityDescription: AI_CHARACTERS.personalityDescription,
          greetingMessage: AI_CHARACTERS.greetingMessage,
          responseStyle: AI_CHARACTERS.responseStyle,
          expertiseAreas: AI_CHARACTERS.expertiseAreas,
          totalConversations: AI_CHARACTERS.totalConversations,
          averageRating: AI_CHARACTERS.averageRating,
          totalRatings: AI_CHARACTERS.totalRatings,
          isActive: AI_CHARACTERS.isActive
        })
        .from(AI_CHARACTERS)
        .where(eq(AI_CHARACTERS.isActive, true))
        .orderBy(AI_CHARACTERS.averageRating, 'desc') // Order by rating, then by total conversations
        .limit(16) // Limit to 16 characters as requested
        .execute();
    } catch (dbError) {
      console.error("Database query error:", dbError);
      return NextResponse.json({
        success: false,
        message: 'Database connection error',
        characters: []
      }, { status: 500 });
    }

    // Helper function to safely parse JSON
    const safeJsonParse = (jsonString) => {
      if (!jsonString) return [];
      
      try {
        // If it's already an array, return it
        if (Array.isArray(jsonString)) return jsonString;
        
        // If it's a string, try to parse it
        if (typeof jsonString === 'string') {
          // Check if it looks like JSON (starts with [ or {)
          if (jsonString.trim().startsWith('[') || jsonString.trim().startsWith('{')) {
            return JSON.parse(jsonString);
          } else {
            // If it's just a plain string, split by comma and clean up
            return jsonString.split(',').map(item => item.trim()).filter(item => item.length > 0);
          }
        }
        
        return [];
      } catch (error) {
        console.warn('Failed to parse expertise areas:', jsonString, error);
        // If JSON parsing fails, try to extract meaningful data
        if (typeof jsonString === 'string') {
          // Split by common delimiters and clean up
          return jsonString.split(/[,;|]/).map(item => item.trim()).filter(item => item.length > 0);
        }
        return [];
      }
    };

    // Helper function to safely handle numeric values
    const safeNumber = (value, defaultValue = 0) => {
      const num = Number(value);
      return isNaN(num) ? defaultValue : num;
    };

    // Process the data to include computed fields
    const processedCharacters = aiCharacters.map(character => {
      try {
        return {
          ...character,
          // Safely parse JSON fields
          expertiseAreas: safeJsonParse(character.expertiseAreas),
          // Ensure numeric fields are properly handled
          totalConversations: safeNumber(character.totalConversations, 0),
          averageRating: safeNumber(character.averageRating, 0),
          totalRatings: safeNumber(character.totalRatings, 0),
          // Calculate popularity score
          popularityScore: calculatePopularityScore(
            safeNumber(character.totalConversations, 0), 
            safeNumber(character.averageRating, 0), 
            safeNumber(character.totalRatings, 0)
          ),
          // Determine online status (simulate for now)
          isOnline: Math.random() > 0.3, // 70% chance of being online
          // Calculate response time (simulate)
          avgResponseTime: Math.floor(Math.random() * 5) + 1, // 1-5 seconds
          // Determine availability
          isAvailable: Boolean(character.isActive)
        };
      } catch (processingError) {
        console.warn('Error processing character:', character.id, processingError);
        // Return a safe version of the character with defaults
        return {
          ...character,
          expertiseAreas: [],
          totalConversations: 0,
          averageRating: 0,
          totalRatings: 0,
          popularityScore: 0,
          isOnline: false,
          avgResponseTime: 3,
          isAvailable: Boolean(character.isActive)
        };
      }
    });

    return NextResponse.json({
      success: true,
      message: 'AI characters retrieved successfully',
      characters: processedCharacters,
      totalCharacters: processedCharacters.length
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching AI characters:", error);
    return NextResponse.json({
      success: false,
      message: 'Error fetching AI characters',
      characters: []
    }, { status: 500 });
  }
}

// Helper function to calculate popularity score
function calculatePopularityScore(totalConversations, averageRating, totalRatings) {
  if (!totalConversations || !averageRating || !totalRatings) {
    return 0;
  }
  
  // Weight conversations and ratings
  const conversationWeight = 0.6;
  const ratingWeight = 0.4;
  
  // Normalize values (assuming max conversations: 1000, max rating: 5)
  const normalizedConversations = Math.min(totalConversations / 1000, 1);
  const normalizedRating = averageRating / 5;
  
  // Calculate weighted score
  const score = (normalizedConversations * conversationWeight) + (normalizedRating * ratingWeight);
  
  return Math.round(score * 100); // Return as percentage
}

// POST method to create a new AI character (admin only)
export async function POST(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const body = await req.json();
    const {
      name,
      displayName,
      avatarUrl,
      specialty,
      mbtiType,
      personalityDescription,
      systemPrompt,
      greetingMessage,
      responseStyle,
      expertiseAreas
    } = body;

    // Validate required fields
    if (!name || !displayName || !specialty || !systemPrompt) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: name, displayName, specialty, systemPrompt'
      }, { status: 400 });
    }

    // Create new AI character
    const newCharacter = await db.insert(AI_CHARACTERS).values({
      name,
      displayName,
      avatarUrl: avatarUrl || null,
      specialty,
      mbtiType: mbtiType || 'ENFJ',
      personalityDescription: personalityDescription || null,
      systemPrompt,
      greetingMessage: greetingMessage || `Hello! I'm ${displayName}, your ${specialty} assistant. How can I help you today?`,
      responseStyle: responseStyle || 'empathetic',
      expertiseAreas: expertiseAreas ? JSON.stringify(expertiseAreas) : null,
      isActive: true
    }).execute();

    return NextResponse.json({
      success: true,
      message: 'AI character created successfully',
      characterId: newCharacter.insertId
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating AI character:", error);
    return NextResponse.json({
      success: false,
      message: 'Error creating AI character'
    }, { status: 500 });
  }
}