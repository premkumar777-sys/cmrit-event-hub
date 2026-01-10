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

// CMRIT Brand Colors
const CMRIT_BLUE = "#1e3a5f";
const CMRIT_ORANGE = "#e67e22";
const CMRIT_GREEN = "#27ae60";

// Common email header with CMRIT branding
const emailHeader = `
  <div style="background: linear-gradient(135deg, ${CMRIT_BLUE} 0%, #2c5282 100%); padding: 30px 20px; text-align: center;">
    <img src="https://www.cmrithyderabad.edu.in/wp-content/uploads/2022/09/CMRIT-Hyderabad-Logo.png" alt="CMRIT Logo" style="height: 80px; margin-bottom: 15px;" />
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">CMRIT Events</h1>
    <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 14px;">Explore to Invent</p>
  </div>
`;

// Common email footer with social links
const emailFooter = `
  <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 3px solid ${CMRIT_ORANGE};">
    <div style="margin-bottom: 20px;">
      <a href="https://www.cmrithyderabad.edu.in" style="color: ${CMRIT_BLUE}; text-decoration: none; font-weight: 600;">🌐 Website</a>
      <span style="margin: 0 15px; color: #ccc;">|</span>
      <a href="https://www.instagram.com/cmrithyderabad" style="color: ${CMRIT_BLUE}; text-decoration: none; font-weight: 600;">📷 Instagram</a>
      <span style="margin: 0 15px; color: #ccc;">|</span>
      <a href="https://www.linkedin.com/school/cmrit-hyderabad" style="color: ${CMRIT_BLUE}; text-decoration: none; font-weight: 600;">💼 LinkedIn</a>
    </div>
    <p style="color: #64748b; font-size: 12px; margin: 0 0 10px 0;">
      CMR Institute of Technology, Hyderabad<br/>
      Kandlakoya, Medchal Road, Hyderabad - 501401
    </p>
    <p style="color: #94a3b8; font-size: 11px; margin: 0;">
      © ${new Date().getFullYear()} CMRIT Events | Powered by Innovation
    </p>
  </div>
`;

const emailTemplates = {
  welcome: (userName: string) => ({
    subject: "🎉 Welcome to CMRIT Events - Your Campus Event Hub!",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        ${emailHeader}
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <span style="font-size: 60px;">🎓</span>
          </div>
          <h2 style="color: ${CMRIT_BLUE}; margin: 0 0 20px 0; text-align: center; font-size: 24px;">
            Welcome, ${userName}! 👋
          </h2>
          <p style="color: #475569; line-height: 1.8; font-size: 16px; text-align: center; margin-bottom: 30px;">
            You've successfully joined <strong>CMRIT Events</strong> - your one-stop platform for all campus activities, event registrations, and digital approvals!
          </p>
          
          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px; border-left: 4px solid ${CMRIT_ORANGE};">
            <h3 style="color: ${CMRIT_BLUE}; margin: 0 0 15px 0; font-size: 18px;">🚀 What You Can Do:</h3>
            <ul style="color: #475569; margin: 0; padding-left: 20px; line-height: 2;">
              <li><strong style="color: ${CMRIT_ORANGE};">Discover Events</strong> - Browse upcoming workshops, fests, and activities</li>
              <li><strong style="color: ${CMRIT_GREEN};">Quick Registration</strong> - Register with one click and get instant QR codes</li>
              <li><strong style="color: ${CMRIT_BLUE};">Digital Certificates</strong> - Receive certificates automatically after attending</li>
              <li><strong style="color: ${CMRIT_ORANGE};">Canteen Booking</strong> - Skip the queue with slot reservations</li>
            </ul>
          </div>

          <div style="text-align: center;">
            <a href="https://smartcmr.lovable.app" style="display: inline-block; background: linear-gradient(135deg, ${CMRIT_ORANGE} 0%, #d35400 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(230, 126, 34, 0.4);">
              Explore Events Now →
            </a>
          </div>
        </div>
        ${emailFooter}
      </div>
    `,
  }),

  event_registration: (userName: string, data: EmailPayload["data"]) => ({
    subject: `✅ Registration Confirmed: ${data?.eventTitle}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        ${emailHeader}
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, ${CMRIT_GREEN} 0%, #1e8449 100%); border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px; line-height: 80px;">✓</span>
            </div>
          </div>
          <h2 style="color: ${CMRIT_GREEN}; margin: 0 0 10px 0; text-align: center; font-size: 24px;">
            You're Registered! 🎉
          </h2>
          <p style="color: #64748b; text-align: center; margin-bottom: 30px;">
            Hi ${userName}, your spot is confirmed!
          </p>
          
          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; border: 2px solid ${CMRIT_GREEN};">
            <h3 style="color: ${CMRIT_BLUE}; margin: 0 0 20px 0; font-size: 20px; text-align: center;">
              📌 ${data?.eventTitle}
            </h3>
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">📅</span>
                <span style="color: #475569;"><strong>Date:</strong> ${data?.eventDate}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">⏰</span>
                <span style="color: #475569;"><strong>Time:</strong> ${data?.eventTime}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">📍</span>
                <span style="color: #475569;"><strong>Venue:</strong> ${data?.eventVenue}</span>
              </div>
            </div>
          </div>

          <div style="background: #fffbeb; border-radius: 8px; padding: 15px; margin-bottom: 25px; border-left: 4px solid ${CMRIT_ORANGE};">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>⚡ Pro Tip:</strong> Arrive 10 minutes early and bring your student ID for quick check-in!
            </p>
          </div>

          <div style="text-align: center;">
            <a href="https://smartcmr.lovable.app/registrations" style="display: inline-block; background: linear-gradient(135deg, ${CMRIT_BLUE} 0%, #2c5282 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 16px;">
              View My Registration →
            </a>
          </div>
        </div>
        ${emailFooter}
      </div>
    `,
  }),

  canteen_booking: (userName: string, data: EmailPayload["data"]) => ({
    subject: `🍽️ Canteen Slot Confirmed: ${data?.slotTime}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        ${emailHeader}
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 25px;">
            <span style="font-size: 60px;">🍽️</span>
          </div>
          <h2 style="color: ${CMRIT_ORANGE}; margin: 0 0 20px 0; text-align: center; font-size: 24px;">
            Slot Booked Successfully!
          </h2>
          <p style="color: #64748b; text-align: center; margin-bottom: 30px;">
            Hi ${userName}, your canteen slot is reserved!
          </p>
          
          <div style="background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; border: 2px solid ${CMRIT_ORANGE};">
            <div style="text-align: center;">
              <p style="color: #475569; margin: 0 0 10px 0; font-size: 14px;">YOUR SLOT</p>
              <p style="color: ${CMRIT_BLUE}; margin: 0; font-size: 32px; font-weight: 700;">${data?.slotTime}</p>
              <p style="color: #64748b; margin: 10px 0 0 0; font-size: 16px;">📅 ${data?.slotDate}</p>
            </div>
          </div>

          <div style="background: #f0f9ff; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
            <p style="color: #0369a1; margin: 0; font-size: 14px; text-align: center;">
              💡 Show this email or your booking QR code at the canteen counter
            </p>
          </div>
        </div>
        ${emailFooter}
      </div>
    `,
  }),

  event_reminder: (userName: string, data: EmailPayload["data"]) => ({
    subject: `⏰ Reminder: ${data?.eventTitle} is Tomorrow!`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        ${emailHeader}
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 25px;">
            <span style="font-size: 60px;">⏰</span>
          </div>
          <h2 style="color: ${CMRIT_ORANGE}; margin: 0 0 20px 0; text-align: center; font-size: 24px;">
            Don't Forget - Event Tomorrow!
          </h2>
          <p style="color: #64748b; text-align: center; margin-bottom: 30px;">
            Hi ${userName}, this is your friendly reminder!
          </p>
          
          <div style="background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; border: 2px solid #a855f7;">
            <h3 style="color: ${CMRIT_BLUE}; margin: 0 0 20px 0; font-size: 20px; text-align: center;">
              🎯 ${data?.eventTitle}
            </h3>
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">📅</span>
                <span style="color: #475569;"><strong>Date:</strong> ${data?.eventDate}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">⏰</span>
                <span style="color: #475569;"><strong>Time:</strong> ${data?.eventTime}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">📍</span>
                <span style="color: #475569;"><strong>Venue:</strong> ${data?.eventVenue}</span>
              </div>
            </div>
          </div>

          <p style="color: #475569; text-align: center; font-size: 16px;">
            We're excited to see you there! 🎉
          </p>
        </div>
        ${emailFooter}
      </div>
    `,
  }),

  certificate: (userName: string, data: EmailPayload["data"]) => ({
    subject: `🎓 Your Certificate is Ready - ${data?.eventTitle}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        ${emailHeader}
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 25px;">
            <span style="font-size: 60px;">🏆</span>
          </div>
          <h2 style="color: ${CMRIT_GREEN}; margin: 0 0 20px 0; text-align: center; font-size: 24px;">
            Congratulations, ${userName}! 🎉
          </h2>
          <p style="color: #64748b; text-align: center; margin-bottom: 30px;">
            Your participation certificate is ready to download!
          </p>
          
          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; text-align: center; border: 2px dashed ${CMRIT_GREEN};">
            <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">CERTIFICATE FOR</p>
            <h3 style="color: ${CMRIT_BLUE}; margin: 0; font-size: 22px;">
              ${data?.eventTitle}
            </h3>
          </div>

          <div style="text-align: center;">
            <a href="${data?.certificateUrl}" style="display: inline-block; background: linear-gradient(135deg, ${CMRIT_GREEN} 0%, #1e8449 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(39, 174, 96, 0.4);">
              🏅 Download Certificate
            </a>
          </div>

          <p style="color: #64748b; text-align: center; font-size: 14px; margin-top: 25px;">
            Thank you for participating! Keep exploring more events on CMRIT Events.
          </p>
        </div>
        ${emailFooter}
      </div>
    `,
  }),
};

serve(async (req: Request) => {
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
  } catch (error: unknown) {
    console.error("Error sending email:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
