import { db } from '@/utils';
import { INVITATIONS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { eq } from 'drizzle-orm';

export async function GET(req) {
    // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response; // Return the authentication error response
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    try {
        // Check if the user has any invitations with compatibility_checked as false
        const invitations = await db
            .select({
                id: INVITATIONS.id,
                inviterId: INVITATIONS.inviter_id,
                compatibilityChecked: INVITATIONS.compatibility_checked,
            })
            .from(INVITATIONS)
            .where(eq(INVITATIONS.user_id, userId)) 
            .execute();

        // Find the invitation with compatibility_checked set to false
        const uncheckedInvitation = invitations.find(invite => !invite.compatibilityChecked);

        return NextResponse.json({
            hasUncheckedInvitation: !!uncheckedInvitation, // true if there is an unchecked invitation
            uncheckedInvitationId: uncheckedInvitation ? uncheckedInvitation.inviterId : null, // Return the inviter's ID
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching invitation status:", error);
        return NextResponse.json({ message: 'Error fetching invitation status' }, { status: 500 });
    }
}