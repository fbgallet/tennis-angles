import { useState, useEffect, useRef } from "react";
import type { CourtOrientation } from "../types/tennis";
import { BG_SIZES } from "../constants/tennis";

export function useCanvasSize(courtOrientation: CourtOrientation) {
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 800 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updateCanvasSize() {
      if (containerRef.current) {
        const containerW = containerRef.current.clientWidth;
        const containerH = containerRef.current.clientHeight;
        let width = containerW;
        let height = containerH;

        const BG_SIZE = BG_SIZES[courtOrientation];
        let aspect = BG_SIZE.width / BG_SIZE.length;

        if (courtOrientation === "portrait") {
          // Portrait: width < height
          if (containerW / containerH > aspect) {
            height = containerH;
            width = Math.round(height * aspect);
          } else {
            width = containerW;
            height = Math.round(width / aspect);
          }
        } else {
          // Landscape: width > height
          aspect = BG_SIZE.width / BG_SIZE.length;
          if (containerH / containerW > 1 / aspect) {
            width = containerW;
            height = Math.round(width / aspect);
          } else {
            height = containerH;
            width = Math.round(height * aspect);
          }
        }

        setCanvasSize({ width, height });
      }
    }

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [courtOrientation]);

  return { canvasSize, containerRef };
}
