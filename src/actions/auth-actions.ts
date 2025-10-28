// actions/auth-actions.ts
"use server";

import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin"; // Your Admin SDK import

// Define the maximum duration for the session (e.g., 5 days)
const MAX_AGE = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds

export async function createSessionCookie(idToken: string) {
  try {
    // 1. **Verify Token:** The Admin SDK securely verifies the token's signature, issuer, and audience.
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // 2. **Check Recency:** Ensure the token is new enough to warrant a new session cookie.
    if (new Date().getTime() / 1000 - decodedToken.auth_time > 5 * 60) {
      throw new Error("Recent sign-in required.");
    }

    // 3. **Create Session Cookie:** Generate a secure, expiring session cookie.
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: MAX_AGE,
    });

    // 4. **Set Cookie:** Use Next.js 'cookies()' to set the HTTP-only cookie.
    (
      await // 4. **Set Cookie:** Use Next.js 'cookies()' to set the HTTP-only cookie.
      cookies()
    ).set("session", sessionCookie, {
      maxAge: MAX_AGE, // Max duration for the cookie
      httpOnly: true, // Prevents client-side JavaScript access (security!)
      secure: true, // Only send over HTTPS (essential for Vercel/production)
      path: "/", // Available throughout the application
      sameSite: "lax",
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to create session cookie:", error);
    // You must delete the cookie on failure to clear the session state
    (
      await // You must delete the cookie on failure to clear the session state
      cookies()
    ).delete("session");
    throw new Error("Authentication failed on the server.");
  }
}

export async function logout() {
  // Remove the session cookie to log out the user
  (await cookies()).delete("session");
  return { success: true };
}
