"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform, useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  currency?: string;
  isBitcoin?: boolean;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({ 
  value, 
  currency = "USD", 
  isBitcoin = false,
  className = "",
  duration = 1.5
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [hasAnimated, setHasAnimated] = useState(false);

  const spring = useSpring(0, {
    stiffness: 50,
    damping: 30,
    duration: duration * 1000,
  });

  const display = useTransform(spring, (current) => {
    if (isBitcoin) {
      return `${current.toFixed(8)} BTC`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(current);
  });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      spring.set(value);
      setHasAnimated(true);
    }
  }, [isInView, value, spring, hasAnimated]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}
