"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function DockFoil() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    let cancelled = false;
    let dispose: (() => void) | undefined;

    async function run() {
      const { mountDockFoil } = await import("@/components/motion/dock-foil");
      if (cancelled) return;
      dispose = await mountDockFoil();
    }

    void run();

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [pathname]);

  return null;
}
