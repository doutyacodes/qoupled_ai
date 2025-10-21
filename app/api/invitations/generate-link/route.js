// app/api/invitations/generate-link/route.js
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { encryptText } from '@/utils/encryption';

export async function POST(req) {
  // Authenticate user
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    // Encrypt the user ID for the invite link (matching /invite page format)
    const encryptedUserId = encryptText(String(userId));
    
    // Get the base URL (handle both development and production)
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    
    // Generate the invite link matching your /invite page format
    // Your /invite page expects: /invite?userId=ENCRYPTED_ID
    const inviteLink = `${baseUrl}/invite?userId=${encodeURIComponent(encryptedUserId)}`;

    return NextResponse.json(
      {
        success: true,
        inviteLink: inviteLink,
        message: 'Invite link generated successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error generating invite link:", error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error generating invite link',
        error: error.message
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve existing link without creating new one
export async function GET(req) {
  // Authenticate user
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    // Encrypt the user ID for the invite link
    const encryptedUserId = encryptText(String(userId));
    
    // Get the base URL
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    
    // Generate the invite link matching your /invite page format
    const inviteLink = `${baseUrl}/invite?userId=${encodeURIComponent(encryptedUserId)}`;

    return NextResponse.json(
      {
        success: true,
        inviteLink: inviteLink
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error retrieving invite link:", error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error retrieving invite link'
      },
      { status: 500 }
    );
  }
}