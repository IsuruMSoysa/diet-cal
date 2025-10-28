import React from "react";
import { CookingPot } from "lucide-react";

function DietCalLogo() {
  return (
    <div className="flex items-center gap-2 self-center font-medium ">
      <div className="bg-green-400 text-primary-foreground flex size-6 items-center justify-center rounded-md">
        <CookingPot className="size-4" />
      </div>
      <span className="text-2xl font-semibold">Diet Cal</span>
    </div>
  );
}

export default DietCalLogo;
