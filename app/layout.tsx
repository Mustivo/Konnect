import type { Metadata } from "next";
import { Manrope, Mrs_Saint_Delafield } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const script = Mrs_Saint_Delafield({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Konnect – Learn together, anywhere.",
  description:
    "Engaging live classes, verified educators, and authentic progress tracking built for real achievement.",
  icons: {
    icon: "/konnect-mark.svg",
    shortcut: "/konnect-mark.svg",
    apple: "/konnect-mark.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${script.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `const savedTheme = localStorage.getItem("konnect-theme"); document.documentElement.setAttribute("data-theme", savedTheme === "dark" ? "dark" : "light");`,
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
