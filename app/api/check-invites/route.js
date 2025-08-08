import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { INVITATIONS, QUIZ_COMPLETION } from '@/utils/schema';
import { db } from '@/utils';
import { and, eq } from 'drizzle-orm';


export async function GET(req) {

    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
      }
    try {
        const userData = authResult.decoded_Data;
        const userId = userData.userId;
        console.log("userId", userId);
        
        const checkedStatus = await db
            .select({
            checked: INVITATIONS.compatibility_checked,
            inviterId: INVITATIONS.inviter_id 
            })
            .from(INVITATIONS)
            .where(eq(INVITATIONS.user_id, userId))
            .execute();

        console.log("checkedStatus", checkedStatus)
        if (!checkedStatus || checkedStatus.length === 0) {
            return NextResponse.json(
              { message: 'No data found' },
              { status: 201 } // 204 No Content status for no data found
            );
          }

        const completedStatus = checkedStatus && checkedStatus.length > 0 && checkedStatus[0].checked ? checkedStatus[0].checked : false;
        const inviterId = checkedStatus[0].inviterId;
        console.log("inviteStatus", completedStatus)
        console.log({checked: completedStatus })
        return NextResponse.json(
            { inviteStatus: completedStatus, inviterId: inviterId },
            { status: 200 } // Changed status to 200 for successful response
        );
        
        
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
    }
    
}