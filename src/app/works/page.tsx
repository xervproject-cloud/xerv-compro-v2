import type { Metadata } from "next";
import { ContactFooter } from "@/components/shell/ContactFooter";
import { SiteShell } from "@/components/shell/SiteShell";
import { WorksIndex } from "@/components/works/WorksIndex";

export const metadata: Metadata = {
  title: "Works.",
  description:
    "Index of every engagement XERV Project will put its name on, filterable by discipline.",
};

export default function WorksPage() {
  return (
    <SiteShell>
      <WorksIndex />
      <ContactFooter />
    </SiteShell>
  );
}
