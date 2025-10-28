"use client";

import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth-actions";
import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const handleLogout = async () => {
    setLoading(true);
    await logout();
    redirect("/login");
    setLoading(false);
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
