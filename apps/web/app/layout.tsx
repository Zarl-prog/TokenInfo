import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TokenSense",
  description: "See what you're spending. Cut what you're wasting.",
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
