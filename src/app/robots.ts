import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aetheris.ai";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/terms",
          "/privacy",
          "/sign-in",
          "/sign-up",
          "/settings/billing",
        ],
        disallow: [
          "/api/",
          "/dashboard/",
          "/admin/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/terms",
          "/privacy",
          "/sign-in",
          "/sign-up",
          "/settings/billing",
        ],
        disallow: [
          "/api/",
          "/dashboard/",
          "/admin/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
