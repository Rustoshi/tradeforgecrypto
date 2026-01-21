"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/public/theme-toggle";
import { useTheme } from "next-themes";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#plans", label: "Plans" },
  { href: "/#contact", label: "Contact" },
];

interface PublicHeaderProps {
  siteName: string;
}

export function PublicHeader({ siteName }: PublicHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // On homepage, before scrolling, use white text in light mode
  const isHomepage = pathname === "/";
  const useWhiteText = mounted && isHomepage && !scrolled && resolvedTheme === "light";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-surface/95 backdrop-blur-sm border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">
                {siteName.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <span className={cn(
              "font-heading text-lg font-semibold transition-colors",
              useWhiteText ? "text-white" : "text-text-primary"
            )}>
              {siteName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex lg:items-center lg:gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors rounded-md",
                  pathname === link.href
                    ? useWhiteText ? "text-white bg-white/10" : "text-primary bg-primary/5"
                    : useWhiteText 
                      ? "text-white/80 hover:text-white hover:bg-white/10" 
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex lg:items-center lg:gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className={useWhiteText ? "text-white hover:bg-white/10" : "text-text-secondary"}>
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors",
                useWhiteText 
                  ? "text-white hover:bg-white/10" 
                  : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
              )}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300 ease-in-out",
            mobileMenuOpen ? "max-h-96 pb-4" : "max-h-0"
          )}
        >
          <nav className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-4 py-3 text-sm font-medium transition-colors rounded-md",
                  pathname === link.href
                    ? "text-primary bg-primary/5"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 px-4">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
