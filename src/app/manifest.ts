import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aetheris AI — Low Cost Gmail AI & Automated AI Workflow",
    short_name: "Aetheris AI",
    description: "Low cost Gmail AI, auto mail response, and intelligent AI workflow powered by Google Gemini multimodal intelligence.",
    start_url: "/",
    display: "standalone",
    background_color: "#050713",
    theme_color: "#9333ea",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
