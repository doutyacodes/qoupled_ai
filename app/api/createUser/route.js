import { NextResponse } from "next/server";
import { db } from "@/utils";
import { USER_DETAILS, USER_LANGUAGES, USER_OCCUPATION } from "@/utils/schema";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const data = await req.json();

    const userResult = await db.insert(USER_DETAILS).values({
      name: data?.name,
      gender: data?.gender,
      dob: new Date(data?.dob),
      age: data?.age,
      height: data?.height,
      weight: data?.weight,
      location: data?.location,
      education: data?.education,
      religion: data?.religion,
      citizenship: data?.citizenship,
      university: data?.university,
    }).returning(); // Assuming the user ID is returned

    const userId = userResult[0]?.id;
    
    if (!userId) {
      return NextResponse.json(
        { message: "User registration failed" },
        { status: 500 }
      );
    }

    // Insert selected languages into USER_LANGUAGES table
    const languages = data?.language_ids || []; 
    const currentTimestamp = new Date();
    const languageInserts = languages.map((languageId) => ({
      user_id: userId,
      language_id: languageId,
      created_at: currentTimestamp,
    }));
    
    await db.insert(USER_LANGUAGES).values(languageInserts);

    // Insert occupation details into USER_OCCUPATION table
    await db.insert(USER_OCCUPATION).values({
      user_id: userId,
      place: data?.place,
      emp_type: data?.emp_type,
      emp_name: data?.emp_name,
      emp_nature: data?.emp_nature,
      salary: data?.income,
    });

    // Create JWT token for the user
    const token = jwt.sign(
      { userId: userId, birth_date: data?.dob },
      process.env.JWT_SECRET_KEY
    );

    console.log("token", token);
    return NextResponse.json(
      {
        data: { userId, token },
        message: "User registered and authenticated successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
