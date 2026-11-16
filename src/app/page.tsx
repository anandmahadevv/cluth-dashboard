import { Metadata } from "next";
import { CollegeSelectorDashboard } from "@/components/colleges/college-selector-dashboard";

export const metadata: Metadata = {
  title: "CLUTCH — Choose Your College Arena | NIAT Esports",
  description:
    "Official CLUTCH Esports collegiate tournament hub for NIAT students. Select your college arena, track live leaderboards, and view verified tournament brackets city by city.",
};

export default function HomePage() {
  return <CollegeSelectorDashboard />;
}
