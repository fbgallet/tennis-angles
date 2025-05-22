import React from "react";

export type CourtOrientation = "portrait" | "landscape";

interface PlayerHandleProps {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  color: string;
  handedness?: "left" | "right";
  scale?: number;
  swing: "forehand" | "backhand";
  isPlayer1?: boolean;
  orientation?: CourtOrientation;
}

// Arm/racket drawing constants (should be kept in sync with TennisCourt)
const ARM_RACKET_LENGTH = 1.105; // meters (approximate: arm+racquet, 30% longer)
const CONTACT_POINT_RATIO = 0.97; // Contact point is 97% of the arm+racquet length

/**
 * Draw a draggable player handle (canvas drawing helper)
 * Extracted from TennisCourt.tsx for modularity.
 */
export function getPlayerArmTheta({
  orientation,
  handedness,
  swing,
}: {
  orientation: CourtOrientation;
  handedness: "left" | "right";
  swing: "forehand" | "backhand";
}): number {
  if (orientation === "landscape") {
    // Player faces right (+X):
    //   Right-handed: forehand = +60° (PI/3), backhand = -60° (-PI/3)
    //   Left-handed:  forehand = -60° (-PI/3), backhand = +60° (PI/3)
    if (handedness === "right") {
      return swing === "forehand"
        ? Math.PI / 3 // 60°
        : -Math.PI / 3; // -60° (or 300°)
    } else {
      return swing === "forehand"
        ? -Math.PI / 3 // -60°
        : Math.PI / 3; // +60°
    }
  } else {
    if (handedness === "right") {
      return swing === "backhand" ? Math.PI / 6 : (5 * Math.PI) / 6;
    } else {
      return swing === "backhand" ? (5 * Math.PI) / 6 : Math.PI / 6;
    }
  }
}

export function drawPlayerHandle({
  ctx,
  x,
  y,
  color,
  handedness = "right",
  scale = 1,
  swing,
  isPlayer1 = false,
  orientation = "portrait",
}: PlayerHandleProps) {
  let rel: number = 0;
  if (orientation === "landscape") {
    // NOTE: The rel calculation here is a placeholder; actual mapping may need to be injected from parent
    rel = (y - 99) / (273 - 99);
    rel = Math.max(0, Math.min(1, rel));
  } else {
    rel = (x - 0.914) / (8.229 - 0.914);
  }
  // Use shared function for theta calculation
  let theta: number = getPlayerArmTheta({
    orientation,
    handedness,
    swing,
  });
  let endX: number;
  let endY: number;
  let contactX: number;
  let contactY: number;
  const armPx = ARM_RACKET_LENGTH * scale;
  const contactPx = armPx * CONTACT_POINT_RATIO;

  endX = x + armPx * Math.cos(theta);
  endY = y + armPx * Math.sin(theta);
  contactX = x + contactPx * Math.cos(theta);
  contactY = y + contactPx * Math.sin(theta);
  ctx.save();
  let swingColor = "#000";
  if (swing === "forehand") swingColor = "#1e90ff";
  else if (swing === "backhand") swingColor = "#f39c12";
  ctx.strokeStyle = swingColor;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(contactX, contactY, 6, 0, 2 * Math.PI);
  ctx.fillStyle = swingColor;
  ctx.globalAlpha = 0.7;
  ctx.fill();
  ctx.globalAlpha = 1.0;
  if (isPlayer1) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(contactX, contactY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.globalAlpha = 0.5;
    ctx.fill();
    ctx.restore();
  }
  // Draw reachable semi-circle area
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.2;
  if (orientation === "landscape") {
    if (isPlayer1) {
      ctx.beginPath();
      ctx.arc(x, y, armPx, -Math.PI / 2, Math.PI / 2);
    } else {
      ctx.beginPath();
      ctx.arc(x, y, armPx, Math.PI / 2, (3 * Math.PI) / 2);
    }
  } else {
    if (isPlayer1) {
      ctx.beginPath();
      ctx.arc(x, y, armPx, 0, Math.PI);
    } else {
      ctx.beginPath();
      ctx.arc(x, y, armPx, Math.PI, 2 * Math.PI);
    }
  }
  ctx.fill();
  ctx.restore();

  // Draw player body as ellipse (shoulders width)
  const shoulderWidthMeters = 0.5;
  const shoulderPx = shoulderWidthMeters * scale;
  // Rotate ellipse for landscape orientation
  const bodyRotation = orientation === "landscape" ? Math.PI / 2 : 0;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, shoulderPx, shoulderPx / 2, bodyRotation, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.globalAlpha = 1.0;
  ctx.fill();
  ctx.restore();
}

// If you want a React wrapper for the handle (for overlays, not canvas):
export const PlayerHandle: React.FC<Omit<PlayerHandleProps, "ctx">> = () =>
  null; // Placeholder for future overlay refactor
