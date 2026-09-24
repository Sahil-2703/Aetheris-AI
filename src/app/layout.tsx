import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aetheris.ai";

export const viewport: Viewport = {
  themeColor: "#9333ea",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Aetheris AI — Low Cost Gmail AI, Smart Mail AI & Automated AI Workflow",
    template: "%s | Aetheris AI — AI Mail Response & Workflow Automation",
  },
  description:
    "Aetheris AI is the ultra low cost Gmail AI and automated AI workflow platform powered by Google Gemini multimodal models. Get instant auto mail response, smart email triage, intelligent chatbot assistance, and email summaries at unmatched low cost.",
  keywords: [
    "workflow",
    "gmail",
    "gmail ai",
    "mail ai",
    "ai workflow",
    "chatgpt",
    "gemini",
    "chatbot",
    "auto mail",
    "ai mail response",
    "low cost",
    "low cost ai",
    "email automation",
    "ai email assistant",
    "google gemini mail",
    "automated email response",
    "smart mail ai",
    "low cost chatbot",
    "ai inbox triage",
    "aetheris ai",
    "email productivity",
    "auto email responder",
    "cheap ai workflow",
    "fast email replies",
    "smart inbox assistant",
  ],
  authors: [{ name: "Aetheris AI Technologies", url: baseUrl }],
  creator: "Aetheris AI Technologies",
  publisher: "Aetheris AI Technologies",
  applicationName: "Aetheris AI",
  category: "technology",
  classification: "AI Workflow Automation & Intelligent Email Assistant",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Aetheris AI",
    title: "Aetheris AI — Low Cost Gmail AI, Smart Mail AI & Automated AI Workflow",
    description:
      "Transform your inbox with low cost Gmail AI, automated mail responses, smart Gemini chatbot intelligence, and autonomous AI workflows.",
    images: [
      {
        url: "/icon.svg",
        width: 1200,
        height: 630,
        alt: "Aetheris AI — Low Cost Gmail AI & AI Workflow Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aetheris AI — Low Cost Gmail AI & Automated AI Workflow",
    description:
      "Instant auto mail response, smart Gmail AI, and Gemini-powered workflows at ultra-low cost.",
    images: ["/icon.svg"],
    creator: "@aetheris_ai",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon.svg" },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      "url": baseUrl,
      "name": "Aetheris AI",
      "description":
        "Low cost Gmail AI, auto mail response, and automated AI workflow platform powered by Google Gemini.",
      "publisher": {
        "@id": `${baseUrl}/#organization`,
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${baseUrl}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      "name": "Aetheris AI Technologies",
      "url": baseUrl,
      "logo": `${baseUrl}/icon.svg`,
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "devd34427@gmail.com",
        "contactType": "customer service",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${baseUrl}/#software`,
      "name": "Aetheris AI - Low Cost Gmail AI & AI Workflow Platform",
      "applicationCategory": "BusinessApplication, ProductivityApplication",
      "operatingSystem": "All (Web Browser, Chrome, Firefox, Safari, Edge)",
      "offers": [
        {
          "@type": "Offer",
          "name": "Free Starter Tier",
          "price": "0",
          "priceCurrency": "INR",
          "description": "5,000 Gemini AI tokens with automatic refill every 3 days",
        },
        {
          "@type": "Offer",
          "name": "Premium Tier",
          "price": "199",
          "priceCurrency": "INR",
          "description": "125,000 Gemini AI tokens with automatic refill every 3 days",
        },
        {
          "@type": "Offer",
          "name": "Premium Pro Tier",
          "price": "499",
          "priceCurrency": "INR",
          "description": "500,000 Gemini AI tokens with automatic refill every 3 days",
        },
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "128",
      },
      "description":
        "Ultra low cost Gmail AI, auto mail response generator, and AI workflow automation engine powered by Google Gemini multimodal intelligence.",
      "featureList": [
        "Gmail AI Inbox Integration",
        "Instant Auto Mail Response",
        "Autonomous AI Workflow",
        "Google Gemini Multimodal AI Engine",
        "Low Cost Subscription with 3-Day Auto Refill",
        "Intelligent Multi-Turn Chatbot Workspace",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased selection:bg-purple-600 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
