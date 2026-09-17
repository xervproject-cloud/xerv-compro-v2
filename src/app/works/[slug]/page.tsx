import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactFooter } from "@/components/shell/ContactFooter";
import { SiteShell } from "@/components/shell/SiteShell";
import { WorkChallenges } from "@/components/works/WorkChallenges";
import { WorkOverview } from "@/components/works/WorkOverview";
import { WorkQuote } from "@/components/works/WorkQuote";
import { WorkRelated } from "@/components/works/WorkRelated";
import { WorkResults } from "@/components/works/WorkResults";
import { WorkSolutions } from "@/components/works/WorkSolutions";
import { getRelatedWorks, getWork, getWorkSlugs } from "@/lib/data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getWorkSlugs();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) return {};
  return {
    title: work.headline,
    description: work.dek,
  };
}

export default async function WorkDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) notFound();

  const related = getRelatedWorks(slug, 4);

  return (
    <SiteShell workName={work.short}>
      <WorkOverview work={work} />
      <WorkChallenges work={work} />
      <WorkQuote work={work} />
      <WorkSolutions work={work} />
      <WorkResults work={work} />
      <WorkRelated related={related} />
      <ContactFooter />
    </SiteShell>
  );
}
