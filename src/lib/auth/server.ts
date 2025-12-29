// lib/auth/server.ts
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin"; // Firebase Admin SDK

// Define the shape of the authenticated user object you want to return
export interface AuthenticatedUser {
  uid: string;
  email: string;
  name: string;
  image?: string;
  // Add any other details you need
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const sessionCookie = (await cookies()).get("session")?.value;

  if (!sessionCookie) {
    return null; // No session cookie found
  }

  try {
    // 1. Verify the session cookie using the Firebase Admin SDK
    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      true
    );

    // 2. The decoded claims contain all the user data
    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email || "",
      name: decodedClaims.name || "User",
      image: decodedClaims.picture || decodedClaims.photoURL || undefined,
    };
  } catch (error) {
    console.error("Error verifying session cookie:", error);
    // Session cookie is invalid, expired, or revoked
    // Note: Cannot delete cookies here as this function may be called from server components
    // Cookie cleanup should be handled in Server Actions, Route Handlers, or Middleware
    return null;
  }
}
