"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    gtranslateSettings?: {
      default_language: string;
      detect_browser_language: boolean;
      languages: string[];
      wrapper_selector: string;
    };
  }
}

export function GTranslateWidget() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Hide widget on dashboard/authenticated routes
  const isAuthenticatedRoute = pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin");

  useEffect(() => {
    setMounted(true);

    // Only initialize once
    if (typeof window !== "undefined" && !window.gtranslateSettings) {
      // Create wrapper
      const wrapper = document.createElement("div");
      wrapper.className = "gtranslate_wrapper";
      wrapper.style.cssText = "z-index: 9999 !important;";
      document.body.appendChild(wrapper);

      // Set settings
      window.gtranslateSettings = {
        default_language: "en",
        detect_browser_language: true,
        languages: ["en", "fr", "es", "de", "it", "pt", "ru", "zh-CN", "ja", "ko", "ar", "hi", "nl", "pl", "tr"],
        wrapper_selector: ".gtranslate_wrapper",
      };

      // Load script
      const script = document.createElement("script");
      script.src = "https://cdn.gtranslate.net/widgets/latest/float.js";
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  // Hide/show widget based on route
  useEffect(() => {
    const wrapper = document.querySelector(".gtranslate_wrapper") as HTMLElement;
    if (wrapper) {
      wrapper.style.display = isAuthenticatedRoute ? "none" : "block";
    }
  }, [isAuthenticatedRoute]);

  // Don't render anything - widget creates its own DOM
  if (!mounted) return null;
  return null;
}
