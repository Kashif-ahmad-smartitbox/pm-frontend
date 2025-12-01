import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "./context/AuthContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Project Management System",
  description: "Project Management System",
  icons: {
    icon: [
      {
        url: "/logo.png",
        sizes: "any",
      },
      {
        url: "/logo.png",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/logo.png",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
