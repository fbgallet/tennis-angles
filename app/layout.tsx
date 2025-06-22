import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "Tennis Angle Theory",
  description:
    "Interactive tennis court positioning visualizer based on René Cochet's angle theory",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/tennis-ball.png",
    apple: "/tennis-ball.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
