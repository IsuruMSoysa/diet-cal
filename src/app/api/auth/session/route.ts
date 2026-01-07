import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return NextResponse.json(
      { authenticated: false, reason: "no-cookie" },
      { status: 200 }
    );
  }

  try {
    await adminAuth.verifySessionCookie(sessionCookie, true);

    return NextResponse.json(
      { authenticated: true, reason: "valid" },
      { status: 200 }
    );
  } catch (error: unknown) {
    // For any verification failure, proactively clear the cookie so the client
    // does not get stuck with a stale session.
    cookieStore.delete("session");

    const reason =
      error instanceof Error && error.message === "auth/session-cookie-expired"
        ? "expired"
        : "invalid-or-revoked";

    return NextResponse.json({ authenticated: false, reason }, { status: 200 });
  }
}
