import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Interactive Tennis Court Visualizer | Practice René Cochet's Angle Theory",
  description:
    "Practice tennis court positioning with our interactive visualizer. Drag players, adjust shot angles, and master René Cochet's angle theory for better defensive positioning.",
  keywords: [
    "tennis visualizer",
    "interactive tennis court",
    "tennis positioning practice",
    "angle theory practice",
    "tennis training tool",
    "court positioning simulator",
    "tennis strategy practice",
    "René Cochet visualizer",
    "tennis angle calculator",
    "defensive positioning tennis",
  ],
  openGraph: {
    title: "Interactive Tennis Court Visualizer | Practice Angle Theory",
    description:
      "Master tennis court positioning with our interactive visualizer. Practice René Cochet's angle theory in real-time.",
    url: "https://tennis-angle-theory.vercel.app/visualizer",
  },
  twitter: {
    title: "Interactive Tennis Court Visualizer | Practice Angle Theory",
    description:
      "Master tennis court positioning with our interactive visualizer. Practice René Cochet's angle theory in real-time.",
  },
  alternates: {
    canonical: "https://tennis-angle-theory.vercel.app/visualizer",
  },
};

export default function VisualizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
