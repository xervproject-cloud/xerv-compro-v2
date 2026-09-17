"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function CrystalX() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    const cleanups: Array<() => void> = [];

    async function run() {
      const { mountCrystal } = await import("@/components/motion/crystal-mount");
      if (cancelled) return;

      const hosts = Array.from(document.querySelectorAll<HTMLElement>(".crystal-x"));
      for (const host of hosts) {
        if (cancelled) break;
        if (host.querySelector("canvas")) continue;
        try {
          await mountCrystal(host);
          cleanups.push(() => {
            host.querySelectorAll("canvas").forEach((el) => el.remove());
          });
        } catch (err) {
          console.error("crystal-x", err);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
      for (const dispose of cleanups) dispose();
    };
  }, [pathname]);

  return null;
}
