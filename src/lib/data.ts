import aboutJson from "@/data/about.json";
import navbarJson from "@/data/navbar.json";
import servicesJson from "@/data/services.json";
import worksJson from "@/data/works.json";
import type { AboutData, Navbar, Service, Work } from "@/lib/types";

function normalizeAssetPath(path: string): string {
  if (!path) return path;
  const trimmed = path.replace(/^\/+/, "/");
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

const works = (worksJson as Work[]).map((work) => ({
  ...work,
  images: work.images.map(normalizeAssetPath),
}));
const services = servicesJson as Service[];
const navbar = navbarJson as Navbar;
const about = aboutJson as AboutData;

export function getWorks(): Work[] {
  return works;
}

export function getWork(slug: string): Work | undefined {
  return works.find((work) => work.slug === slug);
}

export function getFeaturedHome(): Work[] {
  return works
    .filter((work) => work.featuredOnHome)
    .sort((a, b) => (a.homeFeaturedOrder ?? 0) - (b.homeFeaturedOrder ?? 0));
}

export function getAlsoDelivered(): Work[] {
  return works
    .filter((work) => work.alsoDelivered)
    .sort((a, b) => (a.alsoDeliveredOrder ?? 0) - (b.alsoDeliveredOrder ?? 0));
}

export function getWorksIndex(): Work[] {
  const featured = works
    .filter((work) => work.featuredOnWorks)
    .sort((a, b) => (a.worksFeaturedOrder ?? 0) - (b.worksFeaturedOrder ?? 0));
  const rest = works.filter((work) => !work.featuredOnWorks);
  return [...featured, ...rest];
}

export function getRelatedWorks(slug: string, limit = 4): Work[] {
  return works.filter((work) => work.slug !== slug).slice(0, limit);
}

export function getServices(): Service[] {
  return services;
}

export function getNavbar(): Navbar {
  return navbar;
}

export function getAbout(): AboutData {
  return about;
}

export function getWorkSlugs(): { slug: string }[] {
  return works.map((work) => ({ slug: work.slug }));
}

export function workHref(slug: string): string {
  return `/works/${slug}`;
}

export function imagesAttr(images: string[]): string {
  return images.join(",");
}
