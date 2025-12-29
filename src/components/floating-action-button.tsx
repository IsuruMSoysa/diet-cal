"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export function FloatingActionButton({
  onClick,
  className,
}: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className={cn(
        "fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-40",
        "bg-green-600 hover:bg-green-700 text-white",
        className
      )}
    >
      <Plus className="h-6 w-6" />
      <span className="sr-only">Add Meal</span>
    </Button>
  );
}
