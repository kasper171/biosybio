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
    name: "Plano Free",
    subtitle: "Perfeito para começar",
    price: "€0",
    priceNote: "para sempre",
    features: [
      "Molduras limitadas",
      "Personalização básica",
      "Efeitos básicos",
      "Layouts de perfil",
    ],
    cta: "Começar grátis",
    ctaSolid: false,
  },
  {
    id: "premium",
    name: "Plano Premium",
    subtitle: "Tudo desbloqueado, pagamento único",
    price: "€9,99",
    priceNote: "vitalício",
    popular: true,
    features: [
      "Badge exclusivo",
      "Layouts de perfil",
      "Fontes personalizadas",
      "Todos os efeitos",
      "Efeitos especiais de perfil",
      "Todas as molduras",
      "Personalização avançada",
    ],
    cta: "Obter Premium",
    ctaSolid: true,
  },
];

export const BADGE_PRODUCTS: BadgeProduct[] = [
  {
    id: "custom",
    name: "Badge Personalizada",
    price: "€4,99",
    priceNote: "vitalício",
    description: "Crie uma badge no seu estilo",
    accent: "pink",
  },
  {
    id: "rich",
    name: "Badge Rich",
    price: "€49,99",
    priceNote: "vitalício",
    accent: "gold",
  },
  {
    id: "donator",
    name: "Badge Donator",
    price: "€7,99",
    priceNote: "vitalício",
    accent: "green",
  },
  {
    id: "verified",
    name: "Badge Verified",
    price: "€5,99",
    priceNote: "vitalício",
    accent: "blue",
  },
];
