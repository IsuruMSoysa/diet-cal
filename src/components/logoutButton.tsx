"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth-actions";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const handleLogout = async () => {
    setLoading(true);
    try {
      // 1. Sign out from Firebase Auth (client-side)
      await signOut(auth);
      
      // 2. Delete session cookie (server-side)
      await logout();
      
      // 3. Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleLogout}>
      {loading ? (
        <>
          <span className="mr-2 animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-600"></span>{" "}
          Logging out...
        </>
      ) : (
        "Logout"
      )}
    </Button>
  );
}
