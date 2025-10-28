"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import axios from "axios";

function GoogleSignInButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 1. Get the ID token for the authenticated user
      const idToken = await user.getIdToken();

      // 2. Call a Server Action/API to create a session cookie
      await axios.post("/api/sessionLogin", { idToken });

      // 3. Redirect the user to the main dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Google Sign-In failed:", error);
      // Handle errors (e.g., show an alert or a message)
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" type="button" onClick={handleSignIn}>
      {loading ? (
        <span className="mr-2 animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-600"></span>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
      )}
      {loading ? "Logging in..." : "Sign in with Google"}
    </Button>
  );
}

export default GoogleSignInButton;
