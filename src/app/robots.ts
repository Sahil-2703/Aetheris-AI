import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aetheris.ai";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
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
