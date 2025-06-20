import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Théorie des Angles au Tennis | Maîtrisez le Positionnement sur Court avec René Cochet",
  description:
    "Apprenez les principes scientifiques derrière le positionnement optimal sur court de tennis en utilisant la théorie des angles éprouvée de René Cochet et des outils de visualisation interactifs.",
  keywords: [
    "théorie des angles tennis",
    "positionnement court tennis",
    "stratégie tennis",
    "René Cochet",
    "Henri Cochet",
    "tactique tennis",
    "entraînement tennis",
    "bissectrice tennis",
    "géométrie tennis",
    "science du sport",
    "améliorer son tennis",
    "technique tennis",
    "jeu de jambes tennis",
    "anticipation tennis",
    "défense tennis",
  ],
  openGraph: {
    title:
      "Théorie des Angles au Tennis | Maîtrisez le Positionnement sur Court",
    description:
      "Découvrez la théorie des angles de René Cochet pour optimiser votre positionnement au tennis. Simulateur interactif inclus.",
    url: "https://tennis-angle-theory.vercel.app/fr",
    siteName: "Théorie des Angles au Tennis",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Théorie des Angles au Tennis | Maîtrisez le Positionnement sur Court",
    description:
      "Découvrez la théorie des angles de René Cochet pour optimiser votre positionnement au tennis. Simulateur interactif inclus.",
  },
  alternates: {
    canonical: "https://tennis-angle-theory.vercel.app/fr",
    languages: {
      en: "https://tennis-angle-theory.vercel.app/en",
      fr: "https://tennis-angle-theory.vercel.app/fr",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function FrenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
