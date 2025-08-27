import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Floorplan Editor",
  description: "SVG-based floorplan editor (metric-true)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-[#f7f7f8] text-[#0f1720]">{children}</body>
    </html>
  );
}
