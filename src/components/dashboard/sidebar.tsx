"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sidebarNavItems } from "./nav-config";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface SidebarProps {
  siteName: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

interface MobileSidebarProps {
  siteName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Logout handler
async function handleLogout(router: ReturnType<typeof useRouter>) {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  } catch (error) {
    console.error("Logout error:", error);
  }
}

// Desktop Sidebar
export function Sidebar({ siteName, collapsed = false, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const siteInitials = siteName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col transition-all duration-300 ease-out",
        "bg-gradient-to-b from-surface via-surface to-surface-muted/30",
        "border-r border-white/[0.06] dark:border-white/[0.04]",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 transition-transform duration-200 group-hover:scale-105">
              <span className="text-sm font-bold text-primary-foreground">{siteInitials}</span>
            </div>
            <span className="font-heading font-semibold text-text-primary truncate">
              {siteName}
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 transition-transform duration-200 group-hover:scale-105">
              <span className="text-sm font-bold text-primary-foreground">{siteInitials}</span>
            </div>
          </Link>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-text-muted hover:text-text-primary"
            onClick={() => onCollapsedChange?.(!collapsed)}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="w-full h-10 mb-4 text-text-muted hover:text-text-primary"
            onClick={() => onCollapsedChange?.(!collapsed)}
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
        {sidebarNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isActive
                  ? [
                      "bg-primary/10 text-primary",
                      "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
                      "before:h-6 before:w-1 before:rounded-full before:bg-primary",
                      "shadow-sm",
                    ]
                  : "text-text-muted hover:bg-white/[0.04] hover:text-text-primary",
                item.disabled && "pointer-events-none opacity-50",
                collapsed && "justify-center px-0"
              )}
              aria-current={isActive ? "page" : undefined}
              aria-disabled={item.disabled}
            >
              <item.icon className={cn(
                "h-5 w-5 shrink-0 transition-transform duration-200",
                isActive && "scale-110"
              )} />
              {!collapsed && (
                <span className="truncate">{item.title}</span>
              )}
              {!collapsed && item.badge && (
                <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 rounded-xl text-text-muted hover:bg-error/10 hover:text-error transition-colors",
            collapsed && "justify-center px-0"
          )}
          onClick={() => handleLogout(router)}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
}

// Mobile Sidebar (Drawer)
export function MobileSidebar({ siteName, open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const siteInitials = siteName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Close sidebar on route change
  useEffect(() => {
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  if (!mounted) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="left" 
        className="w-[280px] p-0 bg-surface border-r-0 flex flex-col"
      >
        <SheetHeader className="flex h-16 flex-row items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
              <span className="text-sm font-bold text-primary-foreground">{siteInitials}</span>
            </div>
            <SheetTitle className="font-heading font-semibold text-text-primary">
              {siteName}
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {sidebarNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive
                    ? [
                        "bg-primary/10 text-primary",
                        "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
                        "before:h-6 before:w-1 before:rounded-full before:bg-primary",
                      ]
                    : "text-text-muted hover:bg-white/5 hover:text-text-primary",
                  item.disabled && "pointer-events-none opacity-50"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-200",
                  isActive && "scale-110"
                )} />
                <div className="flex flex-col">
                  <span>{item.title}</span>
                  {item.description && (
                    <span className={cn(
                      "text-xs mt-0.5",
                      isActive ? "text-primary/70" : "text-text-muted"
                    )}>
                      {item.description}
                    </span>
                  )}
                </div>
                {item.badge && (
                  <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 pb-safe border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 rounded-xl text-text-muted hover:bg-error/10 hover:text-error transition-colors"
            onClick={() => handleLogout(router)}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Logout</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
