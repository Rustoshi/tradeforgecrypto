"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useRef, type ReactNode, type MouseEvent } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export function AnimatedCard({ children, className, delay = 0, hover = true }: AnimatedCardProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples((prev) => [...prev, { x, y, id }]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: "easeOut"
      }}
      whileHover={hover ? { 
        y: -4, 
        boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.15)",
        transition: { duration: 0.2 }
      } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      onClick={handleClick}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-surface p-5",
        "shadow-sm transition-shadow duration-300",
        "before:absolute before:inset-0 before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300",
        "before:bg-linear-to-br before:from-white/5 before:to-transparent",
        "hover:before:opacity-100",
        "dark:shadow-none dark:hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.15)]",
        className
      )}
    >
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.35 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="pointer-events-none absolute rounded-full bg-primary/20"
          style={{
            left: ripple.x - 50,
            top: ripple.y - 50,
            width: 100,
            height: 100,
          }}
        />
      ))}
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
