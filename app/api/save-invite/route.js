import { db } from '@/utils';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { INVITATIONS } from '@/utils/schema'; // Import relevant tables
import { and, eq } from 'drizzle-orm'; // Import necessary Drizzle ORM functions

export async function POST(req) {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId; // Assuming userData contains the inviter's ID
    console.log('userId', userId);

    try {
        const data = await req.json();
        console.log("data", data)
        const invitedUserId = data.userId; // ID of the user being invited

        // Check if the invited user ID is provided
        if (!invitedUserId) {
            return NextResponse.json({ message: 'Invited user ID is required.' }, { status: 400 });
        }


        // Check if the user has any invitations with compatibility_checked as false
        const invitations = await db
            .select({
                id: INVITATIONS.id,
                compatibilityChecked: INVITATIONS.compatibility_checked,
            })
            .from(INVITATIONS)
            .where(eq(INVITATIONS.user_id, userId)) 
            .execute();

        // Find the invitation with compatibility_checked set to false
        const uncheckedInvitation = invitations.find(invite => !invite.compatibilityChecked);


        if(uncheckedInvitation){
            return NextResponse.json({
                hasUncheckedInvitation: !!uncheckedInvitation, // true if there is an unchecked invitation
                uncheckedInvitationId: uncheckedInvitation ? uncheckedInvitation.id : null, // Return the ID or null if none
            }, { status: 200 });
        }

        // Check if an invitation already exists
        const existingInvitation = await db
            .select()
            .from(INVITATIONS)
            .where(
                and(
                    eq(INVITATIONS.user_id, userId),
                    eq(INVITATIONS.inviter_id, invitedUserId)
                )
            )
            .execute();

            
        // If an existing invitation is found, skip the insertion
        if (existingInvitation.length > 0) {
            return NextResponse.json({ message: 'Invitation already exists, skipping.' }, { status: 200 });
        }

        // Insert the invitation into the database
        await db.insert(INVITATIONS).values({
            user_id: userId,
            inviter_id: invitedUserId,
            compatibility_checked: false // Default value
        });

        return NextResponse.json({ message: 'Invitation addded successfully.' }, { status: 201 });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
    }
}