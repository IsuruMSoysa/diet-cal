"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut } from "lucide-react";
import { SettingsDialog } from "@/components/settings-dialog";
import { logout } from "@/actions/auth-actions";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

interface UserMenuProps {
  userImage?: string;
  userName?: string;
  userId: string;
  onSettingsUpdated?: () => void;
}

export function UserMenu({ userImage, userName, userId, onSettingsUpdated }: UserMenuProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut(auth);
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative h-8 w-8 rounded-full border-2 border-primary overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            {userImage ? (
              <Image
                src={userImage}
                alt={userName || "User"}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                {userName?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm">
            <p className="font-medium">{userName || "User"}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} disabled={loggingOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{loggingOut ? "Logging out..." : "Logout"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        userId={userId}
        onSettingsUpdated={onSettingsUpdated}
      />
    </>
  );
}

