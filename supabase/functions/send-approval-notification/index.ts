<<<<<<< HEAD
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
    eventId: string;
    eventTitle: string;
    organizerEmail: string;
    organizerName: string;
    action: 'approved' | 'rejected' | 'pending_next';
    newLevel?: string;
    rejectionReason?: string;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const payload: NotificationPayload = await req.json();
        const { eventId, eventTitle, organizerEmail, organizerName, action, newLevel, rejectionReason } = payload;

        if (!eventId || !eventTitle || !organizerEmail || !action) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Determine email subject and body based on action
        let subject: string;
        let body: string;

        if (action === 'approved') {
            subject = `🎉 Event Approved: ${eventTitle}`;
            body = `
Dear ${organizerName || 'Organizer'},

Great news! Your event "${eventTitle}" has been fully approved and is now visible to students.

Students can now register for your event through the CMRIT Event Hub.

Next Steps:
- Monitor registrations through your Organizer Dashboard
- Prepare event materials and venue
- Generate attendance QR codes before the event

Best regards,
CMRIT Event Hub Team
      `.trim();
        } else if (action === 'rejected') {
            subject = `❌ Event Rejected: ${eventTitle}`;
            body = `
Dear ${organizerName || 'Organizer'},

We regret to inform you that your event "${eventTitle}" has been rejected.

${rejectionReason ? `Reason: ${rejectionReason}` : ''}

You may modify your event proposal and resubmit for approval.

If you have any questions, please contact the faculty coordinator.

Best regards,
CMRIT Event Hub Team
      `.trim();
        } else if (action === 'pending_next') {
            const levelName = newLevel?.replace('pending_', '').toUpperCase() || 'NEXT LEVEL';
            subject = `⏳ Event Forwarded: ${eventTitle}`;
            body = `
Dear ${organizerName || 'Organizer'},

Your event "${eventTitle}" has been approved and forwarded to the next approval level.

Current Status: Pending ${levelName} Approval

You will receive another notification once the ${levelName} reviews your event.

Best regards,
CMRIT Event Hub Team
      `.trim();
        } else {
            throw new Error('Invalid action type');
        }

        // For now, log the email (in production, integrate with email service like Resend, SendGrid, etc.)
        console.log('=== EMAIL NOTIFICATION ===');
        console.log('To:', organizerEmail);
        console.log('Subject:', subject);
        console.log('Body:', body);
        console.log('========================');

        // TODO: Integrate with actual email service
        // Example with Resend:
        // const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
        // if (RESEND_API_KEY) {
        //   const res = await fetch('https://api.resend.com/emails', {
        //     method: 'POST',
        //     headers: {
        //       'Authorization': `Bearer ${RESEND_API_KEY}`,
        //       'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //       from: 'CMRIT Event Hub <noreply@cmrithyderabad.edu.in>',
        //       to: [organizerEmail],
        //       subject: subject,
        //       text: body,
        //     }),
        //   });
        // }

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Notification logged (email service not configured)',
                email: { to: organizerEmail, subject }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error sending notification:', error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to send notification' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
=======
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
    eventId: string;
    eventTitle: string;
    organizerEmail: string;
    organizerName: string;
    action: 'approved' | 'rejected' | 'pending_next';
    newLevel?: string;
    rejectionReason?: string;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const payload: NotificationPayload = await req.json();
        const { eventId, eventTitle, organizerEmail, organizerName, action, newLevel, rejectionReason } = payload;

        if (!eventId || !eventTitle || !organizerEmail || !action) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Determine email subject and body based on action
        let subject: string;
        let body: string;

        if (action === 'approved') {
            subject = `🎉 Event Approved: ${eventTitle}`;
            body = `
Dear ${organizerName || 'Organizer'},

Great news! Your event "${eventTitle}" has been fully approved and is now visible to students.

Students can now register for your event through the CMRIT Event Hub.

Next Steps:
- Monitor registrations through your Organizer Dashboard
- Prepare event materials and venue
- Generate attendance QR codes before the event

Best regards,
CMRIT Event Hub Team
      `.trim();
        } else if (action === 'rejected') {
            subject = `❌ Event Rejected: ${eventTitle}`;
            body = `
Dear ${organizerName || 'Organizer'},

We regret to inform you that your event "${eventTitle}" has been rejected.

${rejectionReason ? `Reason: ${rejectionReason}` : ''}

You may modify your event proposal and resubmit for approval.

If you have any questions, please contact the faculty coordinator.

Best regards,
CMRIT Event Hub Team
      `.trim();
        } else if (action === 'pending_next') {
            const levelName = newLevel?.replace('pending_', '').toUpperCase() || 'NEXT LEVEL';
            subject = `⏳ Event Forwarded: ${eventTitle}`;
            body = `
Dear ${organizerName || 'Organizer'},

Your event "${eventTitle}" has been approved and forwarded to the next approval level.

Current Status: Pending ${levelName} Approval

You will receive another notification once the ${levelName} reviews your event.

Best regards,
CMRIT Event Hub Team
      `.trim();
        } else {
            throw new Error('Invalid action type');
        }

        // For now, log the email (in production, integrate with email service like Resend, SendGrid, etc.)
        console.log('=== EMAIL NOTIFICATION ===');
        console.log('To:', organizerEmail);
        console.log('Subject:', subject);
        console.log('Body:', body);
        console.log('========================');

        // TODO: Integrate with actual email service
        // Example with Resend:
        // const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
        // if (RESEND_API_KEY) {
        //   const res = await fetch('https://api.resend.com/emails', {
        //     method: 'POST',
        //     headers: {
        //       'Authorization': `Bearer ${RESEND_API_KEY}`,
        //       'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //       from: 'CMRIT Event Hub <noreply@cmrithyderabad.edu.in>',
        //       to: [organizerEmail],
        //       subject: subject,
        //       text: body,
        //     }),
        //   });
        // }

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Notification logged (email service not configured)',
                email: { to: organizerEmail, subject }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error sending notification:', error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to send notification' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
>>>>>>> 009278d72cd8bfc750d2f5053db3b4a8a41dbbe4
