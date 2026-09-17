"use client";

import { BootSplash } from "@/components/motion/BootSplash";
import { CrystalX } from "@/components/motion/CrystalX";
import { DockFoil } from "@/components/motion/DockFoil";
import { SiteEffects } from "@/components/motion/SiteEffects";

export function MotionRoot() {
  return (
    <>
      <BootSplash />
      <SiteEffects />
      <CrystalX />
      <DockFoil />
    </>
  );
}
