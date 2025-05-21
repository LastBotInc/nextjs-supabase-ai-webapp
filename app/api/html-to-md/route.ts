import { isBuildPhase, isProduction } from "@/utils/env-checks";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const maxDuration = 60; // 1 minute

export async function POST(req: NextRequest) {
  // Skip in production environment
  if (isProduction() || isBuildPhase()) {
    return new Response(
      JSON.stringify({
        error: "This endpoint is only available in development",
      }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const { html, selector } = await req.json();

    if (!html) {
      return new Response(
        JSON.stringify({ error: "HTML content is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Dynamic import of TurndownService
    const { default: TurndownService } = await import("turndown");

    // Initialize Turndown with minimal config
    const turndownService = new TurndownService({
      headingStyle: "atx",
      bulletListMarker: "-",
      codeBlockStyle: "fenced",
    });

    // Convert HTML to Markdown
    let content = html;
    if (selector) {
      // If selector is provided, create a temporary DOM element
      const dom = new DOMParser().parseFromString(html, "text/html");
      const element = dom.querySelector(selector);
      content = element ? element.innerHTML : html;
    }

    const markdown = turndownService.turndown(content);

    return new Response(
      JSON.stringify({ markdown }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("HTML to Markdown conversion error:", err);
    return new Response(
      JSON.stringify({ error: "Error converting HTML to Markdown" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
