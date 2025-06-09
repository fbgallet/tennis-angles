import type { Position, BisectorResult, PixelPosition } from "../types/tennis";

export function getAngleDeg(
  v1: { x: number; y: number },
  v2: { x: number; y: number }
) {
  const dot = v1.x * v2.x + v1.y * v2.y;
  const l1 = Math.hypot(v1.x, v1.y);
  const l2 = Math.hypot(v2.x, v2.y);
  const cos = dot / (l1 * l2);
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

export function calculateBisector(
  origin: Position,
  target1: Position,
  target2: Position,
  courtToPx: (pos: Position) => PixelPosition,
  BG_SIZE: { width: number; length: number },
  courtOrientation: "portrait" | "landscape",
  targetBaseline: number // 0 for player2's baseline, COURT_LENGTH for player1's baseline
): BisectorResult {
  // Calculate vectors from origin to targets
  const v1 = { x: target1.x - origin.x, y: target1.y - origin.y };
  const v2 = { x: target2.x - origin.x, y: target2.y - origin.y };

  // Normalize vectors
  const len1 = Math.hypot(v1.x, v1.y);
  const len2 = Math.hypot(v2.x, v2.y);
  const n1 = { x: v1.x / len1, y: v1.y / len1 };
  const n2 = { x: v2.x / len2, y: v2.y / len2 };

  // Calculate bisector direction
  const bis = { x: n1.x + n2.x, y: n1.y + n2.y };
  const bisLen = Math.hypot(bis.x, bis.y);
  const bisNorm = { x: bis.x / bisLen, y: bis.y / bisLen };

  // Calculate intersection with background edge
  let bisectorEnd: Position;

  if (courtOrientation === "landscape") {
    // In landscape mode, extend the bisector much further
    const LARGE_DISTANCE = 50; // Much larger than any court dimension
    bisectorEnd = {
      x: origin.x + bisNorm.x * LARGE_DISTANCE,
      y: origin.y + bisNorm.y * LARGE_DISTANCE,
    };
  } else {
    // Portrait mode: use large distance approach
    const LARGE_DISTANCE = 50;
    bisectorEnd = {
      x: origin.x + bisNorm.x * LARGE_DISTANCE,
      y: origin.y + bisNorm.y * LARGE_DISTANCE,
    };
  }

  // Calculate optimal position on target baseline
  const optimalPosition = {
    x: origin.x + bisNorm.x * ((targetBaseline - origin.y) / bisNorm.y),
    y: targetBaseline,
  };

  return {
    bisectorEndPx: courtToPx(bisectorEnd),
    optimalP1Px: targetBaseline === 0 ? courtToPx(optimalPosition) : undefined,
    optimalP2Px: targetBaseline !== 0 ? courtToPx(optimalPosition) : undefined,
    optimalP1: targetBaseline === 0 ? optimalPosition : undefined,
    optimalP2: targetBaseline !== 0 ? optimalPosition : undefined,
  };
}

export function calculateShotVectors(
  player: Position,
  shot1: Position,
  shot2: Position
) {
  const vDownLine = { x: shot1.x - player.x, y: shot1.y - player.y };
  const vCross = { x: shot2.x - player.x, y: shot2.y - player.y };
  const lenDownLine = Math.hypot(vDownLine.x, vDownLine.y);
  const lenCross = Math.hypot(vCross.x, vCross.y);

  return {
    vDownLine,
    vCross,
    lenDownLine,
    lenCross,
  };
}

export function calculatePlayerDistance(player1: Position, player2: Position) {
  const vP2 = { x: player2.x - player1.x, y: player2.y - player1.y };
  return Math.hypot(vP2.x, vP2.y);
}
