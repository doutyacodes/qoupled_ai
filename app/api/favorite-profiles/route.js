// File: /app/api/favorite-profiles/route.js
import { db } from '@/utils';
import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';
import { mysqlTable, int, primaryKey, timestamp } from 'drizzle-orm/mysql-core';

// Create a new table for favorite profiles if it doesn't exist in your schema
export const FAVORITE_PROFILES = mysqlTable('favorite_profiles', {
  id: int('id').autoincrement().primaryKey(),
  user_id: int('user_id').notNull(), // The user who favorited
  favorited_user_id: int('favorited_user_id').notNull(), // The user who was favorited
  created_at: timestamp('created_at').defaultNow()
}, (table) => {
  return {
    // Prevent duplicate favorites
    uniqueFavorite: primaryKey(table.user_id, table.favorited_user_id)
  }
});

// Add a favorite profile
export async function POST(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;
  
  const { userId: favoriteUserId, action } = await req.json();
  
  if (!favoriteUserId) {
    return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
  }
  
  if (userId === favoriteUserId) {
    return NextResponse.json({ message: 'Cannot favorite yourself' }, { status: 400 });
  }
  
  try {
    if (action === 'remove') {
      // Remove from favorites
      await db
        .delete(FAVORITE_PROFILES)
        .where(
          and(
            eq(FAVORITE_PROFILES.user_id, userId),
            eq(FAVORITE_PROFILES.favorited_user_id, favoriteUserId)
          )
        )
        .execute();
        
      return NextResponse.json({ 
        message: 'Profile removed from favorites',
        userId: favoriteUserId
      }, { status: 200 });
    } else {
      // Check if already favorited
      const existingFavorite = await db
        .select()
        .from(FAVORITE_PROFILES)
        .where(
          and(
            eq(FAVORITE_PROFILES.user_id, userId),
            eq(FAVORITE_PROFILES.favorited_user_id, favoriteUserId)
          )
        )
        .execute();
        
      if (existingFavorite.length > 0) {
        return NextResponse.json({ 
          message: 'Profile is already in favorites',
          userId: favoriteUserId 
        }, { status: 200 });
      }
      
      // Add to favorites
      await db.insert(FAVORITE_PROFILES).values({
        user_id: userId,
        favorited_user_id: favoriteUserId
      }).execute();
      
      return NextResponse.json({ 
        message: 'Profile added to favorites',
        userId: favoriteUserId
      }, { status: 201 });
    }
  } catch (error) {
    console.error("Error managing favorite profile:", error);
    return NextResponse.json({ 
      message: 'Error managing favorite profile',
      error: error.message
    }, { status: 500 });
  }
}

// Get all favorite profiles
export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;
  
  try {
    // Get all favorited user IDs
    const favorites = await db
      .select({
        favoriteId: FAVORITE_PROFILES.favorited_user_id
      })
      .from(FAVORITE_PROFILES)
      .where(eq(FAVORITE_PROFILES.user_id, userId))
      .execute();
      
    const favoriteIds = favorites.map(fav => fav.favoriteId);
    
    return NextResponse.json({
      favoriteProfiles: favoriteIds,
      count: favoriteIds.length
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching favorite profiles:", error);
    return NextResponse.json({ 
      message: 'Error fetching favorite profiles',
      error: error.message
    }, { status: 500 });
  }
}