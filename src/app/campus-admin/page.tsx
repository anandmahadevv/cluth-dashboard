import type { Metadata } from "next";
import { CampusAdminPanel } from "@/components/operations/campus-admin-panel";
export const metadata: Metadata = { title:"Campus Admin | CLUTCH",robots:{index:false,follow:false} };
export default function CampusAdminPage() { return <CampusAdminPanel/>; }
