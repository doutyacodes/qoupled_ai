import { db } from "@/utils";
import { USER, USER_PREFERENCES, PREFERENCE_CATEGORIES, PREFERENCE_OPTIONS } from "@/utils/schema";
import { eq } from "drizzle-orm/expressions";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const data = await req.json();
    const { username, password, birthDate, gender, preferences, inviteUserId } = data;

    // Validate required fields
    if (!username || !password || !birthDate || !gender) {
      return NextResponse.json(
        { message: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Check if the user already exists
    const [existingUser] = await db
      .select()
      .from(USER)
      .where(eq(USER.username, username));

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Validate age (must be 18+)
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    
    if (age < 18 || (age === 18 && monthDiff < 0) || 
        (age === 18 && monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      return NextResponse.json(
        { message: "You must be at least 18 years old to register" },
        { status: 400 }
      );
    }

    // Start transaction
    let newUser;
    let userPreferencesCount = 0;
    
    try {
      // Insert user details into the database
      const result = await db.insert(USER).values({
        username: username,
        gender: gender,
        birthDate: birthDateObj,
        password: password, // Should be encrypted before this point
      });

      if (!result) {
        throw new Error("User registration failed");
      }

      // Fetch the newly created user
      [newUser] = await db
        .select()
        .from(USER)
        .where(eq(USER.username, username));

      if (!newUser) {
        throw new Error("User not found after registration");
      }

      // Save user preferences if provided
      if (preferences && Object.keys(preferences).length > 0) {
        const preferencePromises = [];
        
        for (const [categoryId, optionId] of Object.entries(preferences)) {
          // Validate that the category and option exist
          const [category] = await db
            .select()
            .from(PREFERENCE_CATEGORIES)
            .where(eq(PREFERENCE_CATEGORIES.id, parseInt(categoryId)));
            
          const [option] = await db
            .select()
            .from(PREFERENCE_OPTIONS)
            .where(eq(PREFERENCE_OPTIONS.id, parseInt(optionId)));

          if (category && option) {
            preferencePromises.push(
              db.insert(USER_PREFERENCES).values({
                user_id: newUser.id,
                category_id: parseInt(categoryId),
                option_id: parseInt(optionId),
              })
            );
          }
        }

        // Execute all preference insertions
        if (preferencePromises.length > 0) {
          await Promise.all(preferencePromises);
          userPreferencesCount = preferencePromises.length;
        }
      }

      // Check if profile should be marked as complete
      const totalRequiredCategories = await db
        .select()
        .from(PREFERENCE_CATEGORIES)
        .where(eq(PREFERENCE_CATEGORIES.is_active, true));

      const isProfileComplete = userPreferencesCount >= totalRequiredCategories.length;

      // Update user profile completion status
      if (isProfileComplete) {
        await db
          .update(USER)
          .set({ isProfileComplete: true })
          .where(eq(USER.id, newUser.id));
      }

      // Handle invitation if provided
      if (inviteUserId) {
        try {
          // Save invitation relationship
          // You would implement this based on your INVITATIONS table structure
          // await db.insert(INVITATIONS).values({
          //   user_id: newUser.id,
          //   inviter_id: parseInt(inviteUserId),
          //   compatibility_checked: false
          // });
        } catch (inviteError) {
          console.warn("Failed to save invitation:", inviteError);
          // Don't fail the entire registration for invitation errors
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: newUser.id,
          username: newUser.username 
        }, 
        process.env.JWT_SECRET_KEY,
        { expiresIn: '30d' } // Token expires in 30 days
      );

      // Prepare response data (exclude sensitive information)
      const responseUser = {
        id: newUser.id,
        username: newUser.username,
        gender: newUser.gender,
        birthDate: newUser.birthDate,
        isProfileComplete: isProfileComplete,
        preferencesCount: userPreferencesCount
      };

      return NextResponse.json(
        {
          data: { 
            user: responseUser, 
            token,
            message: "User registered successfully"
          },
          success: true
        },
        { status: 201 }
      );

    } catch (transactionError) {
      // If any part of the transaction fails, we should clean up
      // In a real application, you'd use proper database transactions
      
      // Try to delete the user if it was created but preferences failed
      if (newUser) {
        try {
          await db.delete(USER).where(eq(USER.id, newUser.id));
        } catch (cleanupError) {
          console.error("Failed to cleanup user after error:", cleanupError);
        }
      }
      
      throw transactionError;
    }

  } catch (error) {
    console.error("Registration error:", error);
    
    return NextResponse.json(
      { 
        message: error.message || "An unexpected error occurred during registration",
        success: false 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch preference categories and options for the signup form
export async function GET(req) {
  try {
    // Fetch all active preference categories
    const categories = await db
      .select()
      .from(PREFERENCE_CATEGORIES)
      .where(eq(PREFERENCE_CATEGORIES.is_active, true))
      .orderBy(PREFERENCE_CATEGORIES.id);

    // Fetch all active preference options
    const options = await db
      .select()
      .from(PREFERENCE_OPTIONS)
      .where(eq(PREFERENCE_OPTIONS.is_active, true))
      .orderBy(PREFERENCE_OPTIONS.category_id, PREFERENCE_OPTIONS.id);

    // Group options by category
    const optionsByCategory = {};
    options.forEach(option => {
      if (!optionsByCategory[option.category_id]) {
        optionsByCategory[option.category_id] = [];
      }
      optionsByCategory[option.category_id].push(option);
    });

    return NextResponse.json(
      {
        categories,
        optionsByCategory,
        success: true
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching preference data:", error);
    
    return NextResponse.json(
      { 
        message: "Failed to fetch preference data",
        success: false 
      },
      { status: 500 }
    );
  }
}