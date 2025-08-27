export async function exportSvgToPng(svg: SVGSVGElement): Promise<string> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.querySelectorAll(".ui-only").forEach((n) => n.parentNode?.removeChild(n));
  const xml = new XMLSerializer().serializeToString(clone);
  const svg64 = typeof window !== 'undefined' ? window.btoa(unescape(encodeURIComponent(xml))) : Buffer.from(xml).toString('base64');
  const image64 = `data:image/svg+xml;base64,${svg64}`;
  return await rasterize(image64, svg.clientWidth, svg.clientHeight);
}

async function rasterize(url: string, width: number, height: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = url;
  });
}
