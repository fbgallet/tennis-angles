import type {
  Position,
  PixelPosition,
  CourtOrientation,
} from "../types/tennis";
import {
  LEFT_SINGLES_X,
  RIGHT_SINGLES_X,
  TOP_Y,
  BOT_Y,
  ANCHOR_POINTS,
  BG_ORIG_DIMENSIONS,
} from "../constants/tennis";

export function getScale(
  width: number,
  height: number,
  BG_SIZE: { width: number; length: number }
) {
  return Math.min(width / BG_SIZE.width, height / BG_SIZE.length);
}

export function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export function logicalToDisplay({ x, y }: Position): Position {
  // Always identity: logical coordinates are always in portrait system
  return { x, y };
}

export function displayToLogical(
  { x, y }: Position,
  courtOrientation: CourtOrientation
): Position {
  if (courtOrientation === "portrait") {
    return { x, y };
  } else {
    // Inverse of above: (x, y) -> (COURT_WIDTH - y, x)
    return { x: 10.97 - y, y: x };
  }
}

export function createCoordinateTransforms(
  canvasW: number,
  canvasH: number,
  courtOrientation: CourtOrientation
) {
  // Compute draw size/aspect
  const BG_ORIG_WIDTH =
    courtOrientation === "portrait"
      ? BG_ORIG_DIMENSIONS.portrait.width
      : BG_ORIG_DIMENSIONS.landscape.width;
  const BG_ORIG_HEIGHT =
    courtOrientation === "portrait"
      ? BG_ORIG_DIMENSIONS.portrait.height
      : BG_ORIG_DIMENSIONS.landscape.height;

  const drawWidth = canvasW;
  const drawHeight = canvasH;
  const offsetX = 0;
  const offsetY = 0;
  const scaleX = drawWidth / BG_ORIG_WIDTH;
  const scaleY = drawHeight / BG_ORIG_HEIGHT;

  const anchors = ANCHOR_POINTS[courtOrientation];

  const pxTopLeft = {
    x: offsetX + anchors.topLeft.x * scaleX,
    y: offsetY + anchors.topLeft.y * scaleY,
  };
  const pxTopRight = {
    x: offsetX + anchors.topRight.x * scaleX,
    y: offsetY + anchors.topRight.y * scaleY,
  };
  const pxBotLeft = {
    x: offsetX + anchors.botLeft.x * scaleX,
    y: offsetY + anchors.botLeft.y * scaleY,
  };
  const pxBotRight = {
    x: offsetX + anchors.botRight.x * scaleX,
    y: offsetY + anchors.botRight.y * scaleY,
  };

  function courtToPx(logical: Position): PixelPosition {
    if (courtOrientation === "portrait") {
      // Portrait: standard mapping
      const t =
        (logical.x - LEFT_SINGLES_X) / (RIGHT_SINGLES_X - LEFT_SINGLES_X);
      const s = (logical.y - TOP_Y) / (BOT_Y - TOP_Y);
      const topX = pxTopLeft.x + t * (pxTopRight.x - pxTopLeft.x);
      const botX = pxBotLeft.x + t * (pxBotRight.x - pxBotLeft.x);
      const xPx = topX + s * (botX - topX);
      const yPx = pxTopLeft.y + s * (pxBotLeft.y - pxTopLeft.y);
      return { x: xPx, y: yPx };
    } else {
      // Landscape: swap axes for mapping
      const t = (logical.y - TOP_Y) / (BOT_Y - TOP_Y);
      const s =
        (logical.x - LEFT_SINGLES_X) / (RIGHT_SINGLES_X - LEFT_SINGLES_X);
      const xPx = pxTopLeft.x + t * (pxTopRight.x - pxTopLeft.x);
      const yPx = pxTopLeft.y + s * (pxBotLeft.y - pxTopLeft.y);
      return { x: xPx, y: yPx };
    }
  }

  function pxToCourt({ px, py }: { px: number; py: number }): Position {
    if (courtOrientation === "portrait") {
      // Portrait: original logic
      const s = (py - pxTopLeft.y) / (pxBotLeft.y - pxTopLeft.y);
      const leftX = pxTopLeft.x + s * (pxBotLeft.x - pxTopLeft.x);
      const rightX = pxTopRight.x + s * (pxBotRight.x - pxTopRight.x);
      const t = (px - leftX) / (rightX - leftX);
      const x = LEFT_SINGLES_X + t * (RIGHT_SINGLES_X - LEFT_SINGLES_X);
      const y = TOP_Y + s * (BOT_Y - TOP_Y);
      return displayToLogical({ x, y }, courtOrientation);
    } else {
      // Landscape: properly invert the courtToPx mapping
      const t = (px - pxTopLeft.x) / (pxTopRight.x - pxTopLeft.x);
      const s = (py - pxTopLeft.y) / (pxBotLeft.y - pxTopLeft.y);
      const logicalY = TOP_Y + t * (BOT_Y - TOP_Y);
      const logicalX = LEFT_SINGLES_X + s * (RIGHT_SINGLES_X - LEFT_SINGLES_X);
      return { x: logicalX, y: logicalY };
    }
  }

  return {
    courtToPx,
    pxToCourt,
    pxTopLeft,
    pxTopRight,
    pxBotLeft,
    pxBotRight,
    drawWidth,
    drawHeight,
    offsetX,
    offsetY,
  };
}

export function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot(x1 - x2, y1 - y2);
}
