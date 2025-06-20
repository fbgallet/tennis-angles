import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Visualiseur de Court de Tennis Interactif | Pratiquez la Théorie des Angles de René Cochet",
  description:
    "Pratiquez le positionnement sur court de tennis avec notre visualiseur interactif. Déplacez les joueurs, ajustez les angles de frappe, et maîtrisez la théorie des angles de René Cochet pour un meilleur positionnement défensif.",
  keywords: [
    "visualiseur tennis",
    "court de tennis interactif",
    "pratique positionnement tennis",
    "pratique théorie des angles",
    "outil d'entraînement tennis",
    "simulateur positionnement court",
    "pratique stratégie tennis",
    "visualiseur René Cochet",
    "calculateur angle tennis",
    "positionnement défensif tennis",
    "théorie des angles tennis",
    "entraînement tennis interactif",
  ],
  openGraph: {
    title:
      "Visualiseur de Court de Tennis Interactif | Pratiquez la Théorie des Angles",
    description:
      "Maîtrisez le positionnement sur court de tennis avec notre visualiseur interactif. Pratiquez la théorie des angles de René Cochet en temps réel.",
    url: "https://tennis-angle-theory.vercel.app/fr/visualizer",
  },
  twitter: {
    title:
      "Visualiseur de Court de Tennis Interactif | Pratiquez la Théorie des Angles",
    description:
      "Maîtrisez le positionnement sur court de tennis avec notre visualiseur interactif. Pratiquez la théorie des angles de René Cochet en temps réel.",
  },
  alternates: {
    canonical: "https://tennis-angle-theory.vercel.app/fr/visualizer",
  },
};

export default function VisualizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
