"use client";

import { useState, useCallback } from "react";
import { Sidebar, MobileSidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { MobileBottomNav } from "./mobile-bottom-nav";

interface DashboardLayoutProps {
  children: React.ReactNode;
  siteName: string;
}

export function DashboardLayout({ children, siteName }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const handleMobileMenuChange = useCallback((open: boolean) => {
    setMobileMenuOpen(open);
  }, []);

  return (
    <div className="flex h-screen bg-background ambient-bg noise-texture">
      {/* Desktop Sidebar */}
      <Sidebar
        siteName={siteName}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Mobile Sidebar (Drawer) */}
      <MobileSidebar
        siteName={siteName}
        open={mobileMenuOpen}
        onOpenChange={handleMobileMenuChange}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNav 
          siteName={siteName} 
          onMenuClick={handleMobileMenuToggle} 
        />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {/* Content with padding - accounts for bottom nav on mobile */}
          <div className="p-4 pb-28 lg:p-8 lg:pb-8 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </div>
  );
}
