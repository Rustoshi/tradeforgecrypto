"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-10 w-10 rounded-xl transition-all duration-200",
        "hover:bg-white/5",
        theme === "dark" 
          ? "text-warning hover:text-warning" 
          : "text-text-muted hover:text-primary"
      )}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 transition-transform duration-200 hover:rotate-12" />
      ) : (
        <Moon className="h-5 w-5 transition-transform duration-200 hover:-rotate-12" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
