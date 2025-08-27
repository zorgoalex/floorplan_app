"use client";
import React from "react";
import { exportSvgToPng } from "@/lib/svgExport";

export function ScreenshotButton() {
  return (
    <button className="btn" onClick={async () => {
      const svg = document.getElementById("floorplan-svg") as SVGSVGElement | null;
      if (!svg) return;
      const url = await exportSvgToPng(svg);
      const a = document.createElement("a");
      a.href = url;
      a.download = `floorplan_${Date.now()}.png`;
      a.click();
    }}>Снять скриншот</button>
  );
}
