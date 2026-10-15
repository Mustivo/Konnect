import type { Metadata } from "next";
import { Manrope, Mrs_Saint_Delafield } from "next/font/google";
import ReduxProvider from "@/components/providers/ReduxProvider";
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
            __html: `
              (() => {
                try {
                  const savedTheme = localStorage.getItem("konnect-theme");
                  const theme = savedTheme === "dark" ? "dark" : "light";
                  document.documentElement.setAttribute("data-theme", theme);
                  document.documentElement.classList.toggle("dark", theme === "dark");
                } catch (error) {
                  document.documentElement.setAttribute("data-theme", "light");
                  document.documentElement.classList.remove("dark");
                }
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
