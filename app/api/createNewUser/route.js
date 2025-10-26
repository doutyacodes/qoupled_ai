import { db } from "@/utils";
import { 
  USER, 
  USER_LANGUAGES, 
  LANGUAGES, 
  USER_EDUCATION, 
  EDUCATION_LEVELS, 
  USER_JOB, 
  JOB_TITLES, 
  USER_PREFERENCE_VALUES, 
  PREFERENCE_CATEGORIES, 
  PREFERENCE_OPTIONS, 
  USER_IMAGES,
  RELIGIONS,
  CASTES_OR_DENOMINATIONS
} from "@/utils/schema";
import { eq, and } from "drizzle-orm";
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
      lookingFor,
      phone,
      email,
      country,
      state,
      city,
      religion,
      caste,
      height,
      weight,
      income,
      educationLevel,
      occupation,
      company,
      bio,
      languages,
      profileImageUrl,
      images 
    } = data;

    // ====================================
    // VALIDATE REQUIRED FIELDS
    // ====================================
    if (!username || !password || !birthDate || !gender) {
      return NextResponse.json(
        { message: "Username, password, birth date, and gender are required", success: false },
        { status: 400 }
      );
    }

    if (!lookingFor) {
      return NextResponse.json(
        { message: "Please specify who you're looking for", success: false },
        { status: 400 }
      );
    }

    // ====================================
    // CHECK EXISTING USER
    // ====================================
    const [existingUser] = await db
      .select()
      .from(USER)
      .where(eq(USER.username, username));

    if (existingUser) {
      return NextResponse.json(
        { message: "Username already exists. Please choose a different username.", success: false },
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
          { message: "Email already registered. Please use a different email.", success: false },
          { status: 400 }
        );
      }
    }

    // ====================================
    // VALIDATE AGE (18+)
    // ====================================
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    
    if (age < 18 || (age === 18 && monthDiff < 0) || 
        (age === 18 && monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      return NextResponse.json(
        { message: "You must be at least 18 years old to register", success: false },
        { status: 400 }
      );
    }

    // ====================================
    // VALIDATE EMAIL & PHONE FORMATS
    // ====================================
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address", success: false },
        { status: 400 }
      );
    }

    if (phone && !/^\+?[\d\s-()]{10,}$/.test(phone)) {
      return NextResponse.json(
        { message: "Please enter a valid phone number", success: false },
        { status: 400 }
      );
    }

    // ====================================
    // VALIDATE HEIGHT & WEIGHT
    // ====================================
    if (height && (isNaN(height) || height < 50 || height > 300)) {
      return NextResponse.json(
        { message: "Please enter a valid height between 50-300 cm", success: false },
        { status: 400 }
      );
    }

    if (weight && (isNaN(weight) || weight < 20 || weight > 300)) {
      return NextResponse.json(
        { message: "Please enter a valid weight between 20-300 kg", success: false },
        { status: 400 }
      );
    }

    // ====================================
    // VALIDATE BIO LENGTH
    // ====================================
    if (bio && bio.length < 20) {
      return NextResponse.json(
        { message: "Bio must be at least 20 characters", success: false },
        { status: 400 }
      );
    }

    if (bio && bio.length > 500) {
      return NextResponse.json(
        { message: "Bio cannot exceed 500 characters", success: false },
        { status: 400 }
      );
    }

    // ====================================
    // VALIDATE IMAGES
    // ====================================
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { message: "At least one profile image is required", success: false },
        { status: 400 }
      );
    }

    if (images.length > 3) {
      return NextResponse.json(
        { message: "Maximum 3 images allowed", success: false },
        { status: 400 }
      );
    }

    const hasProfileImage = images.some(img => img.isProfile === true);
    if (!hasProfileImage) {
      return NextResponse.json(
        { message: "Please select a profile image", success: false },
        { status: 400 }
      );
    }

    // Validate image URLs
    for (const image of images) {
      if (!image.url || typeof image.url !== 'string') {
        return NextResponse.json(
          { message: "Invalid image URL format", success: false },
          { status: 400 }
        );
      }
    }

    // ====================================
    // VALIDATE LOOKING FOR
    // ====================================
    const validLookingForValues = ['Male', 'Female', 'Both', 'Any'];
    if (!validLookingForValues.includes(lookingFor)) {
      return NextResponse.json(
        { message: "Invalid lookingFor value. Must be Male, Female, Both, or Any", success: false },
        { status: 400 }
      );
    }

    try {
      // ====================================
      // PREPARE USER DATA
      // ====================================
      const userData = {
        username: username.trim(),
        password: password, // Already encrypted from frontend
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
        
        // Set default values for subscription fields
        currentPlan: 'free',
        isVerified: false,
        profileBoostActive: false,
        subscriptionStatus: 'trial',
        isPhoneVerified: false,
        isEmailVerified: false,
        isProfileVerified: false,
        isProfileComplete: true
      };

      // ====================================
      // INSERT USER INTO DATABASE
      // ====================================
      const [result] = await db.insert(USER).values(userData);

      if (!result || !result.insertId) {
        throw new Error("User registration failed");
      }

      const userId = result.insertId;

      // Handle religion - find existing or create new
      let religionId = null;
      if (religion && religion.trim()) {
        // Check if religion exists
        const existingReligion = await db
          .select()
          .from(RELIGIONS)
          .where(eq(RELIGIONS.name, religion.trim()))
          .limit(1);

        if (existingReligion.length > 0) {
          religionId = existingReligion[0].id;
        } else {
          // Create new religion (needs admin approval)
          const [newReligion] = await db.insert(RELIGIONS).values({
            name: religion.trim(),
            is_user_added: true,
            is_approved: false // Needs admin approval
          });
          religionId = newReligion.insertId;
        }
      }

      // Handle caste - find existing or create new
      let casteId = null;
      if (caste && caste.trim() && religionId) {
        // Check if caste exists for this religion
        const existingCaste = await db
          .select()
          .from(CASTES_OR_DENOMINATIONS)
          .where(
            and(
              eq(CASTES_OR_DENOMINATIONS.name, caste.trim()),
              eq(CASTES_OR_DENOMINATIONS.religion_id, religionId)
            )
          )
          .limit(1);

        if (existingCaste.length > 0) {
          casteId = existingCaste[0].id;
        } else {
          // Create new caste (needs admin approval)
          const [newCaste] = await db.insert(CASTES_OR_DENOMINATIONS).values({
            religion_id: religionId,
            name: caste.trim(),
            is_user_added: true,
            is_approved: false // Needs admin approval
          });
          casteId = newCaste.insertId;
        }
      }

      // Update the user with religion_id and caste_id
      if (religionId || casteId) {
        await db
          .update(USER)
          .set({
            ...(religionId && { religion_id: religionId }),
            ...(casteId && { caste_id: casteId })
          })
          .where(eq(USER.id, userId));
      }

      // ====================================
      // INSERT USER IMAGES
      // ====================================
      if (images && Array.isArray(images) && images.length > 0) {
        try {
          const imageInserts = images.map(image => ({
            user_id: userId,
            image_url: image.url,
            is_profile: image.isProfile || false
          }));

          await db.insert(USER_IMAGES).values(imageInserts);
          
          console.log(`Inserted ${images.length} images for user ${userId}`);
        } catch (imageError) {
          console.error("Error storing user images:", imageError);
          // Don't fail the entire signup if image storage fails
          // User already created, just log the error
        }
      }

      // ====================================
      // FETCH NEWLY CREATED USER
      // ====================================
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
        .where(eq(USER.id, userId));

      if (!newUser) {
        throw new Error("User not found after registration");
      }

      // ====================================
      // STORE LOOKING FOR PREFERENCE
      // ====================================
      try {
        // Find or create "looking_for" category
        let lookingForCategory = await db
          .select()
          .from(PREFERENCE_CATEGORIES)
          .where(eq(PREFERENCE_CATEGORIES.name, 'looking_for'))
          .limit(1);

        if (!lookingForCategory || lookingForCategory.length === 0) {
          // Create the category if it doesn't exist
          const [newCategory] = await db
            .insert(PREFERENCE_CATEGORIES)
            .values({
              name: 'looking_for',
              displayName: 'Looking For',
              categoryType: 'single',
              isActive: true
            });
          
          lookingForCategory = [{ id: newCategory.insertId }];
        }

        const categoryId = lookingForCategory[0].id;

        // Find or create the option
        let lookingForOption = await db
          .select()
          .from(PREFERENCE_OPTIONS)
          .where(
            and(
              eq(PREFERENCE_OPTIONS.categoryId, categoryId),
              eq(PREFERENCE_OPTIONS.value, lookingFor)
            )
          )
          .limit(1);

        if (!lookingForOption || lookingForOption.length === 0) {
          const [newOption] = await db
            .insert(PREFERENCE_OPTIONS)
            .values({
              categoryId: categoryId,
              value: lookingFor,
              displayValue: lookingFor,
              isActive: true
            });
          
          lookingForOption = [{ id: newOption.insertId }];
        }

        // Store user's preference
        await db.insert(USER_PREFERENCE_VALUES).values({
          userId: userId,
          categoryId: categoryId,
          optionId: lookingForOption[0].id,
          importance: 'must_have'
        });
      } catch (prefError) {
        console.error("Error storing looking_for preference:", prefError);
        // Don't fail the entire signup if preference storage fails
      }

      // ====================================
      // STORE EDUCATION (if provided)
      // ====================================
      if (educationLevel) {
        try {
          // Find or create education level
          let eduLevel = await db
            .select()
            .from(EDUCATION_LEVELS)
            .where(eq(EDUCATION_LEVELS.levelName, educationLevel))
            .limit(1);

          if (!eduLevel || eduLevel.length === 0) {
            const [newEduLevel] = await db
              .insert(EDUCATION_LEVELS)
              .values({ levelName: educationLevel });
            
            eduLevel = [{ id: newEduLevel.insertId }];
          }

          // Insert user education
          await db.insert(USER_EDUCATION).values({
            user_id: userId,
            education_level_id: eduLevel[0].id,
            degree: educationLevel,
            graduationYear: null
          });
        } catch (eduError) {
          console.error("Error storing education:", eduError);
        }
      }

      // ====================================
      // STORE JOB (if provided)
      // ====================================
      if (occupation) {
        try {
          // Find or create job title
          let jobTitle = await db
            .select()
            .from(JOB_TITLES)
            .where(eq(JOB_TITLES.title, occupation))
            .limit(1);

          if (!jobTitle || jobTitle.length === 0) {
            const [newJobTitle] = await db
              .insert(JOB_TITLES)
              .values({ title: occupation });
            
            jobTitle = [{ id: newJobTitle.insertId }];
          }

          // Insert user job
          await db.insert(USER_JOB).values({
            user_id: userId,
            job_title_id: jobTitle[0].id,
            company: company?.trim() || null,
            location: [city, state, country].filter(Boolean).join(', ') || null
          });
        } catch (jobError) {
          console.error("Error storing job:", jobError);
        }
      }

      // ====================================
      // STORE LANGUAGES (if provided)
      // ====================================
      if (languages && Array.isArray(languages) && languages.length > 0) {
        try {
          for (const langName of languages) {
            // Find or create language
            let language = await db
              .select()
              .from(LANGUAGES)
              .where(eq(LANGUAGES.title, langName))
              .limit(1);

            if (!language || language.length === 0) {
              const [newLang] = await db
                .insert(LANGUAGES)
                .values({ title: langName });
              
              language = [{ id: newLang.insertId }];
            }

            // Insert user language
            await db.insert(USER_LANGUAGES).values({
              user_id: userId,
              language_id: language[0].id
            });
          }
        } catch (langError) {
          console.error("Error storing languages:", langError);
        }
      }

      // ====================================
      // GENERATE JWT TOKEN
      // ====================================
      const token = jwt.sign(
        { 
          userId: newUser.id,
          username: newUser.username 
        }, 
        process.env.JWT_SECRET_KEY,
        { expiresIn: '30d' }
      );

      // Calculate age for response
      const userAge = today.getFullYear() - birthDateObj.getFullYear();

      // ====================================
      // PREPARE RESPONSE DATA
      // ====================================
      const responseUser = {
        id: newUser.id,
        username: newUser.username,
        gender: newUser.gender,
        age: userAge,
        email: newUser.email,
        phone: newUser.phone,
        location: [newUser.city, newUser.state, newUser.country].filter(Boolean).join(', '),
        currentPlan: newUser.currentPlan,
        isProfileComplete: newUser.isProfileComplete,
        lookingFor: lookingFor,
        hasEducation: !!educationLevel,
        hasJob: !!occupation,
        languageCount: languages?.length || 0,
        imageCount: images?.length || 0 
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
      return NextResponse.json(
        { 
          message: "Database error occurred during registration. Please try again.",
          success: false 
        },
        { status: 500 }
      );
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

// ====================================
// HEALTH CHECK ENDPOINT
// ====================================
export async function GET(req) {
  return NextResponse.json(
    {
      message: "Enhanced Signup API is working",
      timestamp: new Date().toISOString(),
      version: "2.0",
      features: [
        "lookingFor preference",
        "education tracking",
        "job/occupation tracking", 
        "multi-language support",
        "profile image upload",
        "bio support (requires schema update)"
      ],
      success: true
    },
    { status: 200 }
  );
}