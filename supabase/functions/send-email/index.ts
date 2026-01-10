import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  type: "welcome" | "event_registration" | "canteen_booking" | "event_reminder" | "certificate";
  to: string;
  userName: string;
  data?: {
    eventTitle?: string;
    eventDate?: string;
    eventTime?: string;
    eventVenue?: string;
    slotTime?: string;
    slotDate?: string;
    certificateUrl?: string;
  };
}

const emailTemplates = {
  welcome: (userName: string) => ({
    subject: "Welcome to CMRIT Events! 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to CMRIT Events!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Hi ${userName}! 👋</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for joining CMRIT Events - your one-stop platform for campus events, approvals, and more!
          </p>
          <p style="color: #4b5563; line-height: 1.6;">
            <strong>What you can do:</strong>
          </p>
          <ul style="color: #4b5563;">
            <li>🎯 Discover and register for campus events</li>
            <li>📋 Submit and track event approvals</li>
            <li>🍽️ Book canteen slots</li>
            <li>📜 Get digital certificates</li>
          </ul>
          <a href="https://smartcmr.lovable.app" style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px;">
            Explore Events →
          </a>
        </div>
        <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
          © 2024 CMRIT Events | Powered by Google
        </div>
      </div>
    `,
  }),

  event_registration: (userName: string, data: EmailPayload["data"]) => ({
    subject: `Registration Confirmed: ${data?.eventTitle} ✅`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10B981, #3B82F6); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Registration Confirmed! 🎉</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Hi ${userName}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            You have successfully registered for the following event:
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3B82F6;">
            <h3 style="color: #1f2937; margin-top: 0;">${data?.eventTitle}</h3>
            <p style="color: #4b5563; margin: 5px 0;">📅 Date: <strong>${data?.eventDate}</strong></p>
            <p style="color: #4b5563; margin: 5px 0;">⏰ Time: <strong>${data?.eventTime}</strong></p>
            <p style="color: #4b5563; margin: 5px 0;">📍 Venue: <strong>${data?.eventVenue}</strong></p>
          </div>
          <p style="color: #4b5563; line-height: 1.6; margin-top: 20px;">
            Please arrive 10 minutes early for check-in. Don't forget to bring your student ID!
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
          © 2024 CMRIT Events | Powered by Google
        </div>
      </div>
    `,
  }),

  canteen_booking: (userName: string, data: EmailPayload["data"]) => ({
    subject: `Canteen Slot Booked: ${data?.slotTime} ✅`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #F59E0B, #EF4444); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Slot Booked! 🍽️</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Hi ${userName}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Your canteen slot has been booked successfully!
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #F59E0B;">
            <p style="color: #4b5563; margin: 5px 0;">📅 Date: <strong>${data?.slotDate}</strong></p>
            <p style="color: #4b5563; margin: 5px 0;">⏰ Time Slot: <strong>${data?.slotTime}</strong></p>
          </div>
          <p style="color: #4b5563; line-height: 1.6; margin-top: 20px;">
            Please show this email or your booking confirmation at the canteen.
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
          © 2024 CMRIT Events | Powered by Google
        </div>
      </div>
    `,
  }),

  event_reminder: (userName: string, data: EmailPayload["data"]) => ({
    subject: `Reminder: ${data?.eventTitle} is Tomorrow! ⏰`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8B5CF6, #EC4899); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Event Reminder! ⏰</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Hi ${userName}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Just a friendly reminder that you're registered for an event tomorrow:
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #8B5CF6;">
            <h3 style="color: #1f2937; margin-top: 0;">${data?.eventTitle}</h3>
            <p style="color: #4b5563; margin: 5px 0;">📅 Date: <strong>${data?.eventDate}</strong></p>
            <p style="color: #4b5563; margin: 5px 0;">⏰ Time: <strong>${data?.eventTime}</strong></p>
            <p style="color: #4b5563; margin: 5px 0;">📍 Venue: <strong>${data?.eventVenue}</strong></p>
          </div>
          <p style="color: #4b5563; line-height: 1.6; margin-top: 20px;">
            Don't forget to bring your student ID! See you there! 🎉
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
          © 2024 CMRIT Events | Powered by Google
        </div>
      </div>
    `,
  }),

  certificate: (userName: string, data: EmailPayload["data"]) => ({
    subject: `Your Certificate is Ready! 🎓`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Certificate Ready! 🎓</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Congratulations ${userName}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Your certificate for <strong>${data?.eventTitle}</strong> is now ready!
          </p>
          <a href="${data?.certificateUrl}" style="display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px;">
            Download Certificate →
          </a>
          <p style="color: #4b5563; line-height: 1.6; margin-top: 20px;">
            Thank you for participating! Keep exploring more events on CMRIT Events.
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
          © 2024 CMRIT Events | Powered by Google
        </div>
      </div>
    `,
  }),
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: EmailPayload = await req.json();
    const { type, to, userName, data } = payload;

    if (!type || !to || !userName) {
      throw new Error("Missing required fields: type, to, userName");
    }

    // Get email template
    let emailContent;
    switch (type) {
      case "welcome":
        emailContent = emailTemplates.welcome(userName);
        break;
      case "event_registration":
        emailContent = emailTemplates.event_registration(userName, data);
        break;
      case "canteen_booking":
        emailContent = emailTemplates.canteen_booking(userName, data);
        break;
      case "event_reminder":
        emailContent = emailTemplates.event_reminder(userName, data);
        break;
      case "certificate":
        emailContent = emailTemplates.certificate(userName, data);
        break;
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    // Send email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "CMRIT Events <onboarding@resend.dev>",
        to: [to],
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const result = await res.json();
    console.log(`Email sent successfully: ${type} to ${to}`, result);

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
