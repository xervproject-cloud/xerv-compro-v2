export type Service = {
  id: string;
  name: string;
  short: string;
  copy: string;
  accent: string;
};

export type TextBlock = {
  title: string;
  body: string;
};

export type Quote = {
  lead: string;
  name: string;
  role: string;
};

export type ResultStat = {
  label: string;
  stat: string;
};

export type Work = {
  slug: string;
  name: string;
  short: string;
  year: string;
  role: string;
  scope: string;
  services: string[];
  industry: string;
  location: string;
  headline: string;
  dek: string;
  home: string;
  images: string[];
  solutions: TextBlock[];
  challenges: TextBlock[];
  approach: TextBlock[];
  quote: Quote;
  results: ResultStat[];
  featuredOnHome: boolean;
  homeFeaturedOrder: number | null;
  alsoDelivered: boolean;
  alsoDeliveredOrder: number | null;
  featuredOnWorks: boolean;
  worksFeaturedOrder: number | null;
  unsafe_pdf?: boolean;
};

export type NavLink = {
  id: string;
  label: string;
  href: string;
  variant?: string;
};

export type SubnavLink = {
  id: string;
  index: string;
  label: string;
  href: string;
};

export type Navbar = {
  primary: NavLink[];
  homeSubnav: SubnavLink[];
  workDetailSubnav: SubnavLink[];
};

export type AboutData = {
  meta: { title: string; description: string };
  eyebrow: string;
  headline: [string, string];
  leads: string[];
  direction: {
    eyebrow: string;
    title: string;
    vision: string;
    mission: string;
    values: { name: string; copy: string }[];
  };
  team: {
    eyebrow: string;
    title: string;
    people: { name: string; role: string }[];
  };
  contact: {
    telephone: string;
    studio: string;
    email: string;
    note: string;
  };
};
