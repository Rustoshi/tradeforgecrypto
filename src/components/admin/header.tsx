"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Menu,
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  FileCheck,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Transactions", href: "/admin/transactions", icon: ArrowLeftRight },
  { title: "KYC Review", href: "/admin/kyc", icon: FileCheck },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminHeaderProps {
  siteName?: string;
}

export function AdminHeader({ siteName = "HYI Broker" }: AdminHeaderProps) {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "AD";

  const siteInitials = siteName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border-default bg-surface px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="h-16 flex flex-row items-center justify-start gap-2 border-b border-border-default px-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <span className="text-xs font-bold text-primary-foreground">{siteInitials}</span>
              </div>
              <SheetTitle className="font-semibold text-text-primary">Admin</SheetTitle>
            </SheetHeader>
            <nav className="flex-1 space-y-1 p-2">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-border-default p-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span>Logout</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <h1 className="text-base md:text-lg font-semibold text-text-primary truncate">
          {siteName} Admin
        </h1>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" />
        </Button>

        <ThemeToggle />

        {mounted ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{session?.user?.name}</p>
                  <p className="text-xs text-text-muted">{session?.user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-error focus:text-error"
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        )}
      </div>
    </header>
  );
}
