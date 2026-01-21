"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useRef, type ReactNode, type MouseEvent } from "react";
import Link from "next/link";

interface AnimatedButtonProps {
  children: ReactNode;
  href?: string;
  className?: string;
  variant?: "default" | "outline";
  onClick?: () => void;
}

export function AnimatedButton({ 
  children, 
  href, 
  className, 
  variant = "outline",
  onClick 
}: AnimatedButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples((prev) => [...prev, { x, y, id }]);
    onClick?.();
    
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 400);
  };

  const baseStyles = cn(
    // Base layout
    "relative overflow-hidden rounded-lg px-4 py-2.5 text-xs font-medium",
    "flex items-center justify-center gap-2",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    // Outline variant - Premium surface feel
    variant === "outline" && [
      "bg-surface-muted/50 text-text-primary",
      "border border-white/[0.06]",
      "hover:bg-surface-muted hover:border-white/[0.1]",
      "active:bg-surface",
      // Inner highlight
      "shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
    ],
    // Default variant - Primary action, inviting
    variant === "default" && [
      "bg-primary text-primary-foreground",
      "hover:bg-primary-hover",
      "shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(59,130,246,0.25)]",
      "hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_6px_16px_rgba(59,130,246,0.35)]",
      // Inner highlight
      "shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]",
    ],
    className
  );

  const content = (
    <motion.div
      ref={buttonRef}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98, y: 0 }}
      onClick={handleClick}
      className={baseStyles}
    >
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.3 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={cn(
            "pointer-events-none absolute rounded-full",
            variant === "outline" ? "bg-primary/15" : "bg-white/25"
          )}
          style={{
            left: ripple.x - 20,
            top: ripple.y - 20,
            width: 40,
            height: 40,
          }}
        />
      ))}
      
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
