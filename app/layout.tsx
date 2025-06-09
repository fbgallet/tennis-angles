import "./globals.css";

export const metadata = {
  title: "Tennis Angle Theory",
  description:
    "Interactive tennis court positioning visualizer based on René Cochet's angle theory",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
