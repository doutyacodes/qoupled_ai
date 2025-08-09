import { db } from "@/utils";
import { USER } from "@/utils/schema";
import { eq } from "drizzle-orm/expressions";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const data = await req.json();
    const { 
      username, 
      password, 
      birthDate, 
      gender,
      phone,
      email,
      country,
      state,
      city,
      religion,
      caste,
      height,
      weight,
      income
    } = data;

    // Validate required fields
    if (!username || !password || !birthDate || !gender) {
      return NextResponse.json(
        { message: "Username, password, birth date, and gender are required" },
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
        { message: "Username already exists. Please choose a different username." },
        { status: 400 }
      );
    }

    // Check if email already exists (if provided)
    if (email) {
      const [existingEmail] = await db
        .select()
        .from(USER)
        .where(eq(USER.email, email));

      if (existingEmail) {
        return NextResponse.json(
          { message: "Email already registered. Please use a different email." },
          { status: 400 }
        );
      }
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

    // Validate email format (if provided)
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Validate phone format (if provided)
    if (phone && !/^\+?[\d\s-()]{10,}$/.test(phone)) {
      return NextResponse.json(
        { message: "Please enter a valid phone number" },
        { status: 400 }
      );
    }

    // Validate height and weight (if provided)
    if (height && (isNaN(height) || height < 50 || height > 300)) {
      return NextResponse.json(
        { message: "Please enter a valid height between 50-300 cm" },
        { status: 400 }
      );
    }

    if (weight && (isNaN(weight) || weight < 20 || weight > 300)) {
      return NextResponse.json(
        { message: "Please enter a valid weight between 20-300 kg" },
        { status: 400 }
      );
    }

    try {
      // Prepare user data for insertion
      const userData = {
        username: username.trim(),
        password: password, // Should be encrypted before this point
        birthDate: birthDateObj,
        gender: gender,
        phone: phone?.trim() || null,
        email: email?.trim()?.toLowerCase() || null,
        country: country?.trim() || null,
        state: state?.trim() || null,
        city: city?.trim() || null,
        religion: religion?.trim() || null,
        caste: caste?.trim() || null,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        income: income?.trim() || null,
        // Set default values for other fields
        currentPlan: 'free',
        isVerified: false,
        profileBoostActive: false,
        subscriptionStatus: 'trial',
        isPhoneVerified: false,
        isEmailVerified: false,
        isProfileVerified: false,
        isProfileComplete: true // Mark as complete since we collected all basic info
      };

      // Insert user into the database
      const result = await db.insert(USER).values(userData);

      if (!result) {
        throw new Error("User registration failed");
      }

      // Fetch the newly created user
      const [newUser] = await db
        .select({
          id: USER.id,
          username: USER.username,
          gender: USER.gender,
          birthDate: USER.birthDate,
          email: USER.email,
          phone: USER.phone,
          country: USER.country,
          state: USER.state,
          city: USER.city,
          currentPlan: USER.currentPlan,
          isProfileComplete: USER.isProfileComplete
        })
        .from(USER)
        .where(eq(USER.username, username));

      if (!newUser) {
        throw new Error("User not found after registration");
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

      // Calculate age for response
      const userAge = today.getFullYear() - birthDateObj.getFullYear();

      // Prepare response data (exclude sensitive information)
      const responseUser = {
        id: newUser.id,
        username: newUser.username,
        gender: newUser.gender,
        age: userAge,
        email: newUser.email,
        phone: newUser.phone,
        location: [newUser.city, newUser.state, newUser.country].filter(Boolean).join(', '),
        currentPlan: newUser.currentPlan,
        isProfileComplete: newUser.isProfileComplete
      };

      return NextResponse.json(
        {
          data: { 
            user: responseUser, 
            token,
            message: "Account created successfully! Welcome to Qoupled!"
          },
          success: true
        },
        { status: 201 }
      );

    } catch (transactionError) {
      console.error("Database transaction error:", transactionError);
      throw transactionError;
    }

  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle specific database errors
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { 
          message: "Username or email already exists. Please choose different credentials.",
          success: false 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        message: error.message || "An unexpected error occurred during registration. Please try again.",
        success: false 
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET(req) {
  return NextResponse.json(
    {
      message: "Signup API is working",
      timestamp: new Date().toISOString(),
      success: true
    },
    { status: 200 }
  );
}