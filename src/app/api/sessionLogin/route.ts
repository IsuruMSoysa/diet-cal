// app/api/sessionLogin/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  const { idToken } = await request.json();

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days (adjust as needed)

  try {
    // 1. Verify the ID token and create a session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    // 2. Set the cookie as an HTTP-only cookie (secure!)
    (
      await // 2. Set the cookie as an HTTP-only cookie (secure!)
      cookies()
    ).set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure in production
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Signed in successfully.",
    });
  } catch (error) {
    console.error("Error creating session cookie:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed." },
      { status: 401 }
    );
  }
}
