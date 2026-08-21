"use client";

import React from "react";
import { cn, getAvatarColor, getInitials } from "@/lib/utils";
import { Users } from "lucide-react";

interface AvatarProps {
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  isGroup?: boolean;
  online?: boolean;
  className?: string;
}

export function Avatar({
  name = "",
  size = "md",
  isGroup = false,
  online,
  className,
}: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const gradientClass = isGroup
    ? "from-indigo-600 to-purple-700 text-white"
    : getAvatarColor(name);

  return (
    <div className={cn("relative inline-flex items-center justify-center shrink-0", className)}>
      <div
        className={cn(
          "rounded-full font-semibold flex items-center justify-center bg-gradient-to-tr shadow-sm border border-white/10 text-white select-none transition-transform hover:scale-105",
          sizeClasses[size],
          gradientClass
        )}
      >
        {isGroup ? <Users className="w-1/2 h-1/2" /> : getInitials(name)}
      </div>

      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-card",
            size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3",
            online ? "bg-emerald-500 ring-2 ring-emerald-500/20" : "bg-zinc-500"
          )}
        />
      )}
    </div>
  );
}
