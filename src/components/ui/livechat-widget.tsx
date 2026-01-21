"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

export function LiveChatWidget() {
  const pathname = usePathname();
  
  // Don't render livechat on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return <Script src="https://code.jivosite.com/widget/GdIqcMEh66" async />;
}
