import type { MetadataRoute } from "next";

const BASE_URL = "https://mazunte.today";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["en", "es"];
  const routes = ["", "/places", "/search", "/submit"];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of routes) {
      entries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "hourly" : "daily",
        priority: route === "" ? 1 : 0.8,
      });
    }
  }

  return entries;
}
