import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mazunte Today",
    short_name: "Mazunte Today",
    description:
      "Discover events, practitioners, and places in Mazunte, Oaxaca",
    start_url: "/",
    display: "standalone",
    background_color: "#F5EDE3",
    theme_color: "#2B6B7F",
    orientation: "portrait",
    categories: ["lifestyle", "entertainment", "social"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
