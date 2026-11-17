import { redirect } from "next/navigation";

export default function LeaderboardsPage({
  searchParams,
}: {
  searchParams?: { campus?: string; college?: string };
}) {
  const campus = searchParams?.campus || searchParams?.college;
  if (campus) {
    redirect(`/?campus=${encodeURIComponent(campus)}`);
  }
  redirect("/");
}
