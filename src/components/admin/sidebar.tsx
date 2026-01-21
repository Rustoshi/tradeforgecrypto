"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  FileCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { signOut } from "next-auth/react";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Transactions",
    href: "/admin/transactions",
    icon: ArrowLeftRight,
  },
  {
    title: "KYC Review",
    href: "/admin/kyc",
    icon: FileCheck,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface AdminSidebarProps {
  siteName?: string;
}

export function AdminSidebar({ siteName = "HYI Broker" }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  
  // Get initials from site name (max 3 chars)
  const siteInitials = siteName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-border-default bg-surface transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border-default px-4">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <span className="text-xs font-bold text-primary-foreground">{siteInitials}</span>
            </div>
            <span className="font-semibold text-text-primary">Admin</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
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
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-border-default p-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-text-secondary hover:bg-surface-muted hover:text-text-primary",
            collapsed && "justify-center px-0"
          )}
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
}
