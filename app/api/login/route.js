import { db } from '@/utils';
import { USER} from '@/utils/schema';
import { decryptText } from '@/utils/encryption';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    console.log('got')
    const data = await req.json();
    const username=data.username;
    const [existingUser] = await db
      .select()
      .from(USER)
      .where(eq(USER.username, username))
      .execute();


    if (!existingUser) {
      console.log('not')
      return NextResponse.json({ message: 'User not found. Please sign up.' }, { status: 401 });
    }

    const decryptedPassword = decryptText(existingUser.password);
    console.log('decryptedPassword',decryptedPassword)
    if (decryptedPassword === data.password) {
      const token = jwt.sign(
        { userId: existingUser.id },
        process.env.JWT_SECRET_KEY,
        // { expiresIn: '1h' }
      );
      return NextResponse.json({ token,birthDate:existingUser.birthDate }, { status: 200 }, { message: 'Loggedin successfully.' });
    } else {
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }
  } catch (error) {
    console.error("Error in login route:", error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
