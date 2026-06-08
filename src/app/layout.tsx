import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoopHabit - Master Your Habits One Loop At A Time",
  description: "Download the LoopHabit Android app APK. Group your habits into loops, track numerical progress, log sessions with focus timers, and visualize your streaks.",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
