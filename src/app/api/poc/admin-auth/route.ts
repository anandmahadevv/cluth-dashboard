import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/tournament-store";

export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_PASSWORD_HASH) return NextResponse.json({success:false,error:"Super Admin authentication is not configured. Set ADMIN_PASSWORD_HASH on the server."},{status:503});
  try {
    const body = await req.json();
    const { password } = body as { password: string };

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Password is required." },
        { status: 400 }
      );
    }

    const isValid = verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid Super Admin security password." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      authorized: true,
      message: "Super Admin authenticated successfully.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Authentication failed: " + (err.message || err) },
      { status: 500 }
    );
  }
}

