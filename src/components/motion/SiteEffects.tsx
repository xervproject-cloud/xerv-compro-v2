"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { initSiteEffects } from "@/components/motion/site-effects";

export function SiteEffects() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const cleanup = initSiteEffects((href) => {
      const url = new URL(href, window.location.origin);
      const next = `${url.pathname}${url.search}${url.hash}`;
      router.push(next);
    });

    return cleanup;
  }, [pathname, router]);

  return null;
}
