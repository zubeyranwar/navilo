import { colorful } from "@farming-labs/astro-theme/colorful";
import { defineDocs } from "@farming-labs/docs";

export default defineDocs({
  entry: "docs",
  contentDir: "docs",
  staticExport: true,
  theme: colorful({
    ui: {
      components: { Callout: { variant: "outline" } },
      layout: {
        toc: { enabled: true, depth: 3, style: "default" },
        sidebarWidth: 300,
      },
      sidebar: { style: "default" },
      typography: {
        font: {
          style: {
            sans: "Plus Jakarta Sans, sans-serif",
          },
          h1: { size: "2.25rem", weight: 700, letterSpacing: "-0.025em" },
          h2: { size: "1.5rem", weight: 600, letterSpacing: "-0.015em" },
          h3: { size: "1.25rem", weight: 600 },
          body: { size: "0.975rem", lineHeight: "1.8" },
        },
      },
    },
  }),
  github: {
    url: "https://github.com/farming-labs/docs",
    branch: "main",
    directory: "examples/astro/docs",
  },
  ordering: "numeric",
  nav: {
    title: "Navilo",
    url: "/docs",
  },
  sidebar: { flat: false, collapsible: true },
  pageActions: {
    alignment: "right",
    copyMarkdown: { enabled: true },
    openDocs: {
      enabled: true,
      providers: [
        {
          name: "ChatGPT",
          urlTemplate:
            "https://chatgpt.com/?hints=search&q=Read+{mdxUrl},+I+want+to+ask+questions+about+it.",
        },
        {
          name: "Claude",
          urlTemplate: "https://claude.ai/new?q=Read+{mdxUrl},+I+want+to+ask+questions+about+it.",
        },
      ],
    },
  },
  themeToggle: { enabled: true, default: "dark" },
  breadcrumb: { enabled: true },
  metadata: {
    titleTemplate: "%s – Docs",
    description: "Navilo documentation site built with Farming Labs Docs",
  },
} as any);
