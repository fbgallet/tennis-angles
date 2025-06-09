import type {
  Position,
  CourtOrientation,
  Handedness,
  ResolvedSwingType,
} from "../types/tennis";
import { getPlayerArmTheta } from "../components/PlayerHandle";
import {
  ARM_RACKET_LENGTH,
  CONTACT_POINT_RATIO,
  LEFT_SINGLES_X,
  RIGHT_SINGLES_X,
  SINGLES_CENTER_X,
  NET_Y,
  COURT_LENGTH,
} from "../constants/tennis";
import { clamp } from "./coordinates";

export function getDefaultPlayerPositions(orientation: CourtOrientation) {
  if (orientation === "portrait") {
    return {
      player1: { x: SINGLES_CENTER_X, y: 0 },
      player2: { x: SINGLES_CENTER_X, y: COURT_LENGTH },
    };
  } else {
    return {
      player1: { x: SINGLES_CENTER_X, y: 0 },
      player2: { x: SINGLES_CENTER_X, y: COURT_LENGTH },
    };
  }
}

export function getDefaultShotPositions(orientation: CourtOrientation) {
  if (orientation === "portrait") {
    return {
      shot1: { x: LEFT_SINGLES_X, y: COURT_LENGTH },
      shot2: { x: RIGHT_SINGLES_X, y: COURT_LENGTH },
      shot3: { x: LEFT_SINGLES_X, y: 0 },
      shot4: { x: RIGHT_SINGLES_X, y: 0 },
    };
  } else {
    return {
      shot1: { x: LEFT_SINGLES_X, y: COURT_LENGTH },
      shot2: { x: RIGHT_SINGLES_X, y: COURT_LENGTH },
      shot3: { x: LEFT_SINGLES_X, y: 0 },
      shot4: { x: RIGHT_SINGLES_X, y: 0 },
    };
  }
}

export function resolvePlayerSwing(
  player: Position,
  handedness: Handedness,
  orientation: CourtOrientation,
  isPlayer1: boolean,
  prevSwing: ResolvedSwingType,
  setPrevSwing?: (swing: ResolvedSwingType) => void
): ResolvedSwingType {
  const rel = (player.x - LEFT_SINGLES_X) / (RIGHT_SINGLES_X - LEFT_SINGLES_X);

  // Define transition zones with hysteresis
  const TRANSITION_WIDTH = 0.25; // 25% transition zone
  const CENTER = isPlayer1 ? 0.4 : 0.6;

  let result: ResolvedSwingType;

  if (orientation === "landscape") {
    // Landscape logic with smooth transitions
    if (handedness === "right") {
      // Right-handed: forehand on right side, backhand on left side
      const threshold = CENTER;
      const hysteresis = TRANSITION_WIDTH / 2;

      if (rel < threshold - hysteresis) {
        result = isPlayer1 ? "backhand" : "forehand";
      } else if (rel > threshold + hysteresis) {
        result = isPlayer1 ? "forehand" : "backhand";
      } else {
        // In transition zone - use hysteresis
        result = prevSwing;
      }
    } else {
      // Left-handed: opposite
      const threshold = CENTER;
      const hysteresis = TRANSITION_WIDTH / 2;

      if (rel < threshold - hysteresis) {
        result = isPlayer1 ? "forehand" : "backhand";
      } else if (rel > threshold + hysteresis) {
        result = isPlayer1 ? "backhand" : "forehand";
      } else {
        // In transition zone - use hysteresis
        result = prevSwing;
      }
    }
  } else {
    // Portrait logic with smooth transitions
    if (handedness === "right") {
      const threshold = isPlayer1 ? 0.6 : 0.4; // Different thresholds for each player
      const hysteresis = TRANSITION_WIDTH / 2;

      if (rel < threshold - hysteresis) {
        result = isPlayer1 ? "forehand" : "backhand";
      } else if (rel > threshold + hysteresis) {
        result = isPlayer1 ? "backhand" : "forehand";
      } else {
        // In transition zone - use hysteresis
        result = prevSwing;
      }
    } else {
      // Left-handed: opposite
      const threshold = isPlayer1 ? 0.4 : 0.6; // Different thresholds for each player
      const hysteresis = TRANSITION_WIDTH / 2;

      if (rel < threshold - hysteresis) {
        result = isPlayer1 ? "backhand" : "forehand";
      } else if (rel > threshold + hysteresis) {
        result = isPlayer1 ? "forehand" : "backhand";
      } else {
        // In transition zone - use hysteresis
        result = prevSwing;
      }
    }
  }

  // Update previous swing state if setter is provided and result changed
  if (setPrevSwing && result !== prevSwing) {
    setPrevSwing(result);
  }

  return result;
}

export function getContactPoint(
  player: Position,
  handedness: Handedness,
  swing: ResolvedSwingType,
  isPlayer1: boolean,
  orientation: CourtOrientation,
  courtToPx?: (pos: Position) => { x: number; y: number },
  pxToCourt?: (pixel: { px: number; py: number }) => Position
): Position {
  const theta = getPlayerArmTheta({
    orientation,
    handedness,
    swing,
    isPlayer1,
  });

  if (!courtToPx || !pxToCourt) {
    // Fallback to simple calculation if transforms not available
    const contactDistance = ARM_RACKET_LENGTH * CONTACT_POINT_RATIO;
    return {
      x: player.x + contactDistance * Math.cos(theta),
      y: player.y + contactDistance * Math.sin(theta),
    };
  }

  // Use pixel-based calculation for consistency with drawing
  const playerPx = courtToPx({ x: player.x, y: player.y });

  // Calculate pxPerMeter
  let pxPerMeter: number;
  if (orientation === "portrait") {
    const testPoint1 = courtToPx({ x: player.x + 1, y: player.y });
    const testPoint2 = courtToPx({ x: player.x, y: player.y + 1 });
    pxPerMeter = Math.sqrt(
      (testPoint1.x - playerPx.x) ** 2 + (testPoint2.y - playerPx.y) ** 2
    );
  } else {
    const testPoint1 = courtToPx({ x: player.x, y: player.y + 1 });
    const testPoint2 = courtToPx({ x: player.x + 1, y: player.y });
    pxPerMeter = Math.sqrt(
      (testPoint1.x - playerPx.x) ** 2 + (testPoint2.y - playerPx.y) ** 2
    );
  }

  // Calculate contact point in pixel space
  const contactPx = ARM_RACKET_LENGTH * pxPerMeter * CONTACT_POINT_RATIO;
  const visualContactPx = {
    x: playerPx.x + contactPx * Math.cos(theta),
    y: playerPx.y + contactPx * Math.sin(theta),
  };

  // Convert back to logical coordinates
  return pxToCourt({
    px: visualContactPx.x,
    py: visualContactPx.y,
  });
}

export function calculateAutoShotPositions(
  player: Position,
  contactPoint: Position,
  orientation: CourtOrientation,
  isPlayer1: boolean
): { shot1: Position; shot2: Position } {
  // Down-the-line: interpolate from baseline to service line as player advances
  const downLineX =
    contactPoint.x < SINGLES_CENTER_X ? LEFT_SINGLES_X : RIGHT_SINGLES_X;
  const serviceLineY = isPlayer1 ? NET_Y + 6.4 : NET_Y - 6.4;
  const targetBaseline = isPlayer1 ? COURT_LENGTH : 0;

  const forwardNet = clamp(
    -(contactPoint.y - NET_Y) / (targetBaseline - NET_Y),
    0,
    1
  );

  const lateral = clamp(
    Math.abs(contactPoint.x - SINGLES_CENTER_X) / (10.97 / 2),
    0,
    1.2
  );

  const downLineY = isPlayer1
    ? COURT_LENGTH -
      (forwardNet < 1
        ? (1 - Math.min(lateral, 1)) *
          (COURT_LENGTH - serviceLineY) *
          (1 - forwardNet)
        : 0)
    : 0 +
      (forwardNet < 1
        ? (1 - Math.min(lateral, 1)) * (serviceLineY - 0) * (1 - forwardNet)
        : 0);

  const downLine = { x: downLineX, y: downLineY };

  // Cross-court: interpolate from baseline to 1m inside service line based on lateral position
  const crossX =
    contactPoint.x < SINGLES_CENTER_X ? RIGHT_SINGLES_X : LEFT_SINGLES_X;

  const lateralScale = orientation === "portrait" ? 7 : 7.5;
  const forwardScale = orientation === "portrait" ? 5 : 5.5;

  const crossY = isPlayer1
    ? Math.max(
        COURT_LENGTH -
          lateral * lateralScale -
          (forwardNet < 1 ? (1 - forwardNet) * forwardScale : 0),
        NET_Y + 1
      )
    : Math.min(
        0 +
          lateral * lateralScale +
          (forwardNet < 1 ? (1 - forwardNet) * forwardScale : 0),
        NET_Y - 1
      );

  const cross = { x: crossX, y: crossY };

  return { shot1: downLine, shot2: cross };
}
