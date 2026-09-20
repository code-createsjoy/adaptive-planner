import { createFileRoute } from "@tanstack/react-router";
import { AdaptiveApp } from "@/components/adaptive/AdaptiveApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Adaptive — Your day changes. Your plan adapts." },
      { name: "description", content: "A calm adaptive daily planner that helps you understand changes, protect transitions, and choose what happens next." },
      { property: "og:title", content: "Adaptive — Your day changes. Your plan adapts." },
      { property: "og:description", content: "A calm adaptive daily planner that keeps you in control when plans change." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdaptiveApp,
});