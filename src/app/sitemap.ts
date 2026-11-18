import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/projekty",
    "/mapa",
    "/studio",
    "/kontakt",
    "/ochrana-soukromi",
    "/impressum",
  ];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "monthly" as const })),
    ...projects.map((p) => ({
      url: `${site.url}/projekty/${p.slug}`,
      changeFrequency: "yearly" as const,
    })),
  ];
}
