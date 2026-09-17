import type { Metadata } from "next";
import { AboutDirection } from "@/components/about/AboutDirection";
import { AboutIntro } from "@/components/about/AboutIntro";
import { AboutTeam } from "@/components/about/AboutTeam";
import { ContactFooter } from "@/components/shell/ContactFooter";
import { SiteShell } from "@/components/shell/SiteShell";

export const metadata: Metadata = {
  title: "A lean studio, senior by default.",
  description:
    "XERV Project is a custom software agency established by five seasoned IT professionals in West Java, Indonesia.",
};

export default function AboutPage() {
  return (
    <SiteShell>
      <AboutIntro />
      <AboutDirection />
      <AboutTeam />
      <ContactFooter toneStart="#140E28" toneEnd="#0A0718" withBox />
    </SiteShell>
  );
}
