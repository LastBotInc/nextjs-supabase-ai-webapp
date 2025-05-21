import { NextResponse } from "next/server";

// Define the manifest object according to the Web App Manifest spec
const manifest = {
  name: "InnoLease", // App name
  short_name: "InnoLease", // Short name for homescreen
  start_url: "/", // Start URL when launched from homescreen
  display: "standalone", // Display mode
  background_color: "#ffffff", // Background color
  theme_color: "#2563eb", // Theme color (Tailwind blue-600)
  description: "Innovative leasing platform", // App description
  icons: [
    {
      src: "/favicon.ico", // Path to icon (update as needed)
      sizes: "48x48",
      type: "image/x-icon",
    },
    // Add more icon sizes/types as needed
  ],
};

// GET handler for /site.webmanifest
export async function GET() {
  // Return the manifest as JSON with the correct content-type
  return new NextResponse(JSON.stringify(manifest), {
    status: 200,
    headers: {
      "Content-Type": "application/manifest+json; charset=UTF-8",
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
    },
  });
}
