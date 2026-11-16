import { Metadata } from "next";
import { SinglePageCollegeForm } from "@/components/colleges/single-page-college-form";

export const metadata: Metadata = {
  title: "CLUTCH — Choose Your Campus | NIAT Esports",
  description:
    "Official CLUTCH Esports campus selection portal for NIAT students.",
};

export default function ChooseCampusPage() {
  return <SinglePageCollegeForm />;
}
