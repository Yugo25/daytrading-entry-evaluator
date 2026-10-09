import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Entry Evaluator",
    short_name: "Evaluator",
    description: "Strategy-based entry evaluation and trade journal",
    start_url: "/evaluate",
    display: "standalone",
    background_color: "#f7f7f5",
    theme_color: "#1d4ed8",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
