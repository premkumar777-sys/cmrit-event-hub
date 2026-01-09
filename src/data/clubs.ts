import {
  Heart,
  Globe,
  Code,
  Rocket,
  Sparkles,
  Mic2,
  BookOpen,
  Palette,
  Eye,
  LucideIcon,
} from "lucide-react";

export interface Club {
  id: string;
  name: string;
  fullName: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  category: string;
  email: string;
  foundedYear: number;
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
}

export const clubs: Club[] = [
  {
    id: "hsga",
    name: "HSGA",
    fullName: "Humanities & Social Good Association",
    description: "Dedicated to promoting social awareness, humanitarian efforts, and community service initiatives. We organize drives, awareness campaigns, and social impact events.",
    icon: Heart,
    color: "text-rose-500",
    bgColor: "bg-rose-500",
    category: "Social",
    email: "hsga@cmrithyderabad.edu.in",
    foundedYear: 2019,
  },
  {
    id: "nss",
    name: "NSS",
    fullName: "National Service Scheme",
    description: "The NSS unit of CMRIT focuses on personality development through community service. We organize blood donation camps, village adoption programs, and environmental initiatives.",
    icon: Globe,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500",
    category: "Service",
    email: "nss@cmrithyderabad.edu.in",
    foundedYear: 2015,
  },
  {
    id: "prompt-techies",
    name: "Prompt Techies",
    fullName: "AI & Tech Innovation Club",
    description: "A community of tech enthusiasts exploring AI, machine learning, and emerging technologies. We host hackathons, workshops, and tech talks with industry experts.",
    icon: Code,
    color: "text-blue-500",
    bgColor: "bg-blue-500",
    category: "Technical",
    email: "coding@cmrithyderabad.edu.in",
    foundedYear: 2022,
  },
  {
    id: "gdg",
    name: "GDG",
    fullName: "Google Developer Group",
    description: "Official Google Developer Group on campus. We organize sessions on Google technologies, Android development, Cloud computing, and prepare students for Google certifications.",
    icon: Rocket,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500",
    category: "Technical",
    email: "gdsc@cmrithyderabad.edu.in",
    foundedYear: 2020,
  },
  {
    id: "dance-club",
    name: "Dance Club",
    fullName: "Rhythm & Moves",
    description: "Express yourself through dance! From classical to contemporary, hip-hop to folk, we celebrate all dance forms. Join us for performances, workshops, and competitions.",
    icon: Sparkles,
    color: "text-purple-500",
    bgColor: "bg-purple-500",
    category: "Cultural",
    email: "dance@cmrithyderabad.edu.in",
    foundedYear: 2016,
  },
  {
    id: "singing-club",
    name: "Singing Club",
    fullName: "Vocal Harmony",
    description: "A melodious community of singers and music lovers. We organize open mics, choir performances, and music competitions. All genres and skill levels welcome!",
    icon: Mic2,
    color: "text-pink-500",
    bgColor: "bg-pink-500",
    category: "Cultural",
    email: "music@cmrithyderabad.edu.in",
    foundedYear: 2016,
  },
  {
    id: "agastya",
    name: "Agastya",
    fullName: "Literary & Debate Society",
    description: "Home to wordsmiths and orators. We host debates, MUNs, poetry slams, creative writing workshops, and literary festivals to nurture communication skills.",
    icon: BookOpen,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500",
    category: "Literary",
    email: "literary@cmrithyderabad.edu.in",
    foundedYear: 2017,
  },
  {
    id: "fine-arts-club",
    name: "Fine Arts Club",
    fullName: "Creative Arts & Design",
    description: "Unleash your creativity! From paintings to sculptures, digital art to installations, we provide a platform for all visual artists to showcase their talent.",
    icon: Palette,
    color: "text-orange-500",
    bgColor: "bg-orange-500",
    category: "Cultural",
    email: "cultural@cmrithyderabad.edu.in",
    foundedYear: 2016,
  },
  {
    id: "ikshana-club",
    name: "Ikshana Club",
    fullName: "Photography & Visual Arts",
    description: "Capture moments, tell stories. We organize photo walks, editing workshops, exhibitions, and photography competitions. From mobile to DSLR, all are welcome!",
    icon: Eye,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500",
    category: "Creative",
    email: "photography@cmrithyderabad.edu.in",
    foundedYear: 2018,
  },
];

export const getClubById = (id: string): Club | undefined => {
  return clubs.find((club) => club.id === id);
};

export const getClubsByCategory = (category: string): Club[] => {
  return clubs.filter((club) => club.category === category);
};
