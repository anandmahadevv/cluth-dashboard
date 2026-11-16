import { Metadata } from "next";
import { SinglePageCollegeForm } from "@/components/colleges/single-page-college-form";

export const metadata: Metadata = {
  title: "CLUTCH — Choose Your College | NIAT Esports",
  description:
    "Official CLUTCH Esports college selection portal for NIAT students. Choose your college to access the tournament dashboard.",
};

export default function HomePage() {
  return <SinglePageCollegeForm />;
}
