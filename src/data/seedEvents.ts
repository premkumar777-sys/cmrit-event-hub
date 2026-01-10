export interface SeedEvent {
  id: string;
  title: string;
  description: string | null;
  date: string; // YYYY-MM-DD
  time: string | null;
  venue: string | null;
  department: string | null;
  category: string | null;
  status: "draft" | "pending" | "approved" | "rejected" | "completed" | "ongoing";
  max_participants: number | null;
  poster_url: string | null;
  organizer_id: string;
  register_url?: string | null;
}

export const seedEvents: SeedEvent[] = [
  {
    id: "sankranthi-2026",
    title: "Sankranthi Celebrations 2026",
    description:
      "Fine Arts Club presents: Sankranthi Celebrations 2026. Events: Rangoli (Team 2–3 members, ₹50 for team of 2, ₹60 for team of 3), Kite Making/Designing (Individual, ₹20), Best Out of Waste (Individual, ₹20). Schedule: Rangoli 11:00–13:00, Kite Making 14:00–16:00. Note: Attendance will be provided. No materials are supplied — bring your own. Contacts: Swaroopa – 6281750856, Pranay – 7702336352. Prizes for winners and runners-up.",
    date: "2026-01-10",
    time: null,
    venue: "CMR Institute of Technology",
    department: "all",
    category: "Cultural",
    status: "approved",
    max_participants: null,
    poster_url: null,
    organizer_id: "seed:fine-arts",
    register_url: "https://qrco.de/bgYA4F",
  } as any,
  {
    id: "techsprint-2026",
    title: "TechSprint 2026 — Open Innovation Hackathon",
    description:
      "GDG on Campus CMRIT presents TechSprint 2026. Timeline: Jan 3 — Agentic AI Workshop + QuizWhiz; Jan 9 & 10 — Main Hackathon (Offline at CMRIT). Registration & team formation deadline extended to Jan 7, 2026. Free to participate. Theme: Open Innovation. Prizes, swags, and certificates for top teams. Register via the Hack2Skill page or check the registration guide.",
    date: "2026-01-09",
    time: null,
    venue: "CMR Institute of Technology",
    department: "all",
    category: "Technical",
    status: "ongoing",
    max_participants: null,
    poster_url: null,
    organizer_id: "seed:gdg",
    register_url: "https://vision.hack2skill.com/event/gdgoc-25-techsprint-cmrit?utm_medium=",
  } as any,
];

export const seedOrganizerNames: { [key: string]: string } = {
  "seed:fine-arts": "Fine Arts Club",
  "seed:gdg": "GDG on Campus",
};
