"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { useUserSession } from "@/components/providers/user-session-provider";
import { userMenuItems } from "./nav-config";

interface TopNavProps {
  siteName: string;
  onMenuClick: () => void;
}

export function TopNav({ siteName, onMenuClick }: TopNavProps) {
  const session = useUserSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const userName = session?.name || "User";
  const userEmail = session?.email || "";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const siteInitials = siteName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-surface/80 backdrop-blur-xl border-b border-white/[0.06] px-4 lg:px-6">
      {/* Left side - Menu button (mobile) + Logo */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-10 w-10 rounded-xl hover:bg-white/5"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo - visible on mobile, hidden on desktop (shown in sidebar) */}
        <Link href="/dashboard" className="flex items-center gap-3 lg:hidden group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 transition-transform duration-200 group-hover:scale-105">
            <span className="text-xs font-bold text-primary-foreground">{siteInitials}</span>
          </div>
          <span className="font-heading font-semibold text-text-primary">
            {siteName}
          </span>
        </Link>

        {/* Page title area - desktop only */}
        <div className="hidden lg:block" />
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-10 w-10 rounded-xl hover:bg-white/5 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-text-muted" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error ring-2 ring-surface" />
        </Button>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* User dropdown */}
        {mounted ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-xl p-0 hover:bg-white/5 transition-colors"
                aria-label="User menu"
              >
                <Avatar className="h-9 w-9 ring-2 ring-white/10">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-60 rounded-xl border-white/10 bg-surface/95 backdrop-blur-xl shadow-xl"
            >
              <DropdownMenuLabel className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-white/10">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-text-primary">{userName}</p>
                    <p className="text-xs text-text-muted truncate">{userEmail}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/5" />
              {userMenuItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild className="rounded-lg mx-2 my-0.5">
                  <Link href={item.href} className="flex items-center gap-3 cursor-pointer px-3 py-2.5">
                    <item.icon className="h-4 w-4 text-text-muted" />
                    <span>{item.title}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem
                className="cursor-pointer text-error focus:text-error focus:bg-error/10 rounded-lg mx-2 my-0.5 mb-2 px-3 py-2.5"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-3" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" className="relative h-10 w-10 rounded-xl p-0">
            <Avatar className="h-9 w-9 ring-2 ring-white/10">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        )}
      </div>
    </header>
  );
}
