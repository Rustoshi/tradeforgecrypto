"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingOverlay() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Minimum display time for the loader
    const minDisplayTime = 600;
    const startTime = Date.now();

    const hideLoader = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayTime - elapsed);
      setTimeout(() => setIsLoading(false), remaining);
    };

    // Check if page is already loaded
    if (document.readyState === "complete") {
      hideLoader();
    } else {
      window.addEventListener("load", hideLoader);
      return () => window.removeEventListener("load", hideLoader);
    }
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-0 z-9999 flex items-center justify-center bg-background"
        >
          <div className="flex flex-col items-center gap-6">
            {/* Animated Logo/Icon */}
            <div className="relative">
              {/* Outer ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/20"
                style={{ width: 80, height: 80 }}
              />
              
              {/* Spinning arc */}
              <motion.svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              >
                <circle
                  cx="40"
                  cy="40"
                  r="38"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="60 180"
                  className="text-primary"
                />
              </motion.svg>

              {/* Center icon */}
              <motion.div
                className="flex h-20 w-20 items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary-foreground"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </div>
              </motion.div>
            </div>

            {/* Loading text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex flex-col items-center gap-2"
            >
              <p className="text-sm font-medium text-text-primary">Loading</p>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-primary"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
