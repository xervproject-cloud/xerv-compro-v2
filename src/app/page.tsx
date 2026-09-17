import { HomeApproach } from "@/components/home/HomeApproach";
import { HomeIntro } from "@/components/home/HomeIntro";
import { HomeServices } from "@/components/home/HomeServices";
import { HomeWork } from "@/components/home/HomeWork";
import { ContactFooter } from "@/components/shell/ContactFooter";
import { SiteShell } from "@/components/shell/SiteShell";

export default function HomePage() {
  return (
    <SiteShell>
      <HomeIntro />
      <HomeApproach />
      <HomeServices />
      <HomeWork />
      <ContactFooter />
    </SiteShell>
  );
}
