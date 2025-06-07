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
const CONTACT_POINT_RATIO = 0.92; // Contact point is 92% of the arm+racquet length (closer to racket end)

/**
 * Draw a draggable player handle (canvas drawing helper)
 * Extracted from TennisCourt.tsx for modularity.
 */
export function getPlayerArmTheta({
  orientation,
  handedness,
  swing,
  isPlayer1 = true,
}: {
  orientation: CourtOrientation;
  handedness: "left" | "right";
  swing: "forehand" | "backhand";
  isPlayer1?: boolean;
}): number {
  if (orientation === "landscape") {
    // In landscape: Player 1 faces right (+X), Player 2 faces left (-X)
    if (isPlayer1) {
      // Player 1 faces right (toward +X direction)
      if (handedness === "right") {
        return swing === "forehand"
          ? Math.PI / 3 // 60° (forward-right)
          : -Math.PI / 3; // -60° (forward-left)
      } else {
        return swing === "forehand"
          ? -Math.PI / 3 // -60° (forward-left)
          : Math.PI / 3; // 60° (forward-right)
      }
    } else {
      // Player 2 faces left (toward -X direction) - angles are mirrored
      if (handedness === "right") {
        return swing === "forehand"
          ? (4 * Math.PI) / 3 // 240° (forward-right for P2)
          : (2 * Math.PI) / 3; // 120° (forward-left for P2)
      } else {
        return swing === "forehand"
          ? (4 * Math.PI) / 3 // 240° (forward-right for P2)
          : (2 * Math.PI) / 3; // 120° (forward-left for P2)
      }
    }
  } else {
    // Portrait mode: Player 1 faces down (+Y), Player 2 faces up (-Y)
    if (isPlayer1) {
      // Player 1 faces down (toward opponent at y=COURT_LENGTH)
      if (handedness === "right") {
        return swing === "backhand" ? Math.PI / 6 : (5 * Math.PI) / 6;
      } else {
        return swing === "backhand" ? (5 * Math.PI) / 6 : Math.PI / 6;
      }
    } else {
      // Player 2 faces up (toward opponent at y=0) - forward is negative Y direction (toward y=0)
      if (handedness === "right") {
        // For Player 2 facing up: forehand is 330° (forward and to the right), backhand is 210° (forward and to the left)
        return swing === "forehand" ? (11 * Math.PI) / 6 : (7 * Math.PI) / 6; // 330° for forehand, 210° for backhand
      } else {
        // Left-handed Player 2: forehand is 210° (forward and to the left), backhand is 330° (forward and to the right)
        return swing === "forehand" ? (7 * Math.PI) / 6 : (11 * Math.PI) / 6; // 210° for forehand, 330° for backhand
      }
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
    isPlayer1,
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
  // Draw racket as oval shape (perpendicular to arm)
  const racketWidth = 8;
  const racketHeight = 4;
  ctx.save();
  ctx.translate(endX, endY);
  ctx.rotate(theta + Math.PI / 2); // Rotate 90° to make racket perpendicular to arm
  ctx.beginPath();
  ctx.ellipse(0, 0, racketWidth, racketHeight, 0, 0, 2 * Math.PI);
  ctx.fillStyle = swingColor;
  ctx.globalAlpha = 0.7;
  ctx.fill();
  ctx.strokeStyle = swingColor;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 1.0;
  ctx.stroke();
  ctx.restore();
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
