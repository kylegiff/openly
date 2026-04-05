import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "openly",
  description: "Post to X and LinkedIn without opening the apps.",
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
