export type PlanTier = {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  priceNote: string;
  popular?: boolean;
  features: string[];
  cta: string;
  ctaSolid: boolean;
};

export type BadgeProduct = {
  id: string;
  name: string;
  price: string;
  priceNote: string;
  description?: string;
  accent?: "gold" | "pink" | "blue" | "green";
};

export const PLANS: PlanTier[] = [
  {
    id: "free",
    name: "Free Plan",
    subtitle: "Perfect to get started",
    price: "€0",
    priceNote: "forever",
    features: [
      "Limited frames",
      "Basic customization",
      "Basic effects",
      "Profile layouts",
    ],
    cta: "Start for free",
    ctaSolid: false,
  },
  {
    id: "premium",
    name: "Premium Plan",
    subtitle: "Everything unlocked, one-time payment",
    price: "€9.99",
    priceNote: "lifetime",
    popular: true,
    features: [
      "Exclusive badge",
      "Profile layouts",
      "Custom fonts",
      "All effects",
      "Special profile effects",
      "All frames",
      "Advanced customization",
    ],
    cta: "Get Premium",
    ctaSolid: true,
  },
];

export const BADGE_PRODUCTS: BadgeProduct[] = [
  {
    id: "custom",
    name: "Custom Badge",
    price: "€4.99",
    priceNote: "lifetime",
    description: "Create a badge in your style",
    accent: "pink",
  },
  {
    id: "rich",
    name: "Rich Badge",
    price: "€49.99",
    priceNote: "lifetime",
    accent: "gold",
  },
  {
    id: "donator",
    name: "Donator Badge",
    price: "€7.99",
    priceNote: "lifetime",
    accent: "green",
  },
  {
    id: "verified",
    name: "Verified Badge",
    price: "€5.99",
    priceNote: "lifetime",
    accent: "blue",
  },
];
