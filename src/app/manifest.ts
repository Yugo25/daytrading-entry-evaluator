import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Entry Evaluator",
    short_name: "Evaluator",
    description: "手法基準に基づくエントリー判定とトレードジャーナル",
    start_url: "/evaluate",
    display: "standalone",
    background_color: "#f7f7f5",
    theme_color: "#1d4ed8",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
