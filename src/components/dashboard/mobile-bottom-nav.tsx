"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { bottomNavItems } from "./nav-config";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 lg:hidden",
        "bg-surface/90 backdrop-blur-xl",
        "border-t border-white/[0.06]"
      )}
      role="navigation"
      aria-label="Mobile navigation"
    >
      {/* Safe area padding for iOS */}
      <div className="pb-safe">
        <div className="flex items-center justify-around px-1 py-1.5">
          {bottomNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl min-w-[64px] transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  isActive
                    ? "text-primary"
                    : "text-text-muted hover:text-text-secondary active:scale-95"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-primary" />
                )}
                <item.icon 
                  className={cn(
                    "h-5 w-5 transition-all duration-200",
                    isActive && "scale-110"
                  )} 
                />
                <span className={cn(
                  "text-[10px] font-medium leading-none transition-all duration-200",
                  isActive && "font-semibold text-primary"
                )}>
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
