import React, { useRef, useEffect, useState } from "react";
import type {
  Position,
  CourtOrientation,
  Handedness,
  SwingType,
  ResolvedSwingType,
  DragTarget,
} from "../types/tennis";
import { BG_SIZES } from "../constants/tennis";
import { COURT_BG_IMAGES } from "../constants/court-images";
import { getCourtTheme, ANIMATION_TIMINGS } from "../constants/tennis-colors";
import { createCoordinateTransforms } from "../utils/coordinates";
import { drawPlayerHandle, getPlayerArmTheta } from "./PlayerHandle";
import {
  ARM_RACKET_LENGTH,
  CONTACT_POINT_RATIO,
  HANDLE_RADIUS,
} from "../constants/tennis";
import { resolvePlayerSwing, getContactPoint } from "../utils/tennis-logic";
import { calculateBisector } from "../utils/geometry";
import { COURT_LENGTH } from "../constants/tennis";
import tcStyles from "./TennisCourt.module.scss";

interface CourtCanvasProps {
  // Positions
  player1: Position;
  player2: Position;
  player1bis?: Position;
  player2bis?: Position;
  shot1: Position;
  shot2: Position;
  shot3: Position;
  shot4: Position;

  // Settings
  courtOrientation: CourtOrientation;
  courtType: string;
  gameMode?: string;
  player1Handedness: Handedness;
  player1Swing: SwingType;
  player2Handedness: Handedness;
  player2Swing: SwingType;
  prevPlayer1Swing: ResolvedSwingType;
  prevPlayer2Swing: ResolvedSwingType;

  // Display options
  showShotsPlayer1: boolean;
  showShotsPlayer2: boolean;
  showBisectorPlayer1: boolean;
  showBisectorPlayer2: boolean;
  showOptimal: boolean;

  // Canvas size
  canvasSize: { width: number; height: number };

  // Event handlers
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;

  // Refs for coordinate transforms
  onTransformsReady: (transforms: any) => void;
}

const CourtCanvas: React.FC<CourtCanvasProps> = ({
  player1,
  player2,
  player1bis,
  player2bis,
  shot1,
  shot2,
  shot3,
  shot4,
  courtOrientation,
  courtType,
  gameMode,
  player1Handedness,
  player1Swing,
  player2Handedness,
  player2Swing,
  prevPlayer1Swing,
  prevPlayer2Swing,
  showShotsPlayer1,
  showShotsPlayer2,
  showBisectorPlayer1,
  showBisectorPlayer2,
  showOptimal,
  canvasSize,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onMouseMove,
  onDoubleClick,
  onTransformsReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgImg, setBgImg] = useState<HTMLImageElement | null>(null);
  const [bgLoaded, setBgLoaded] = useState(0);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [animationFrame, setAnimationFrame] = useState(0);

  const BG_SIZE = BG_SIZES[courtOrientation];
  const courtTheme = getCourtTheme(courtType);

  // Animation loop for pulsing effects
  useEffect(() => {
    let animationId: number;

    const animate = () => {
      setAnimationFrame(Date.now());
      animationId = requestAnimationFrame(animate);
    };

    if (hoveredElement || isDragging) {
      animate();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [hoveredElement, isDragging]);

  // Calculate pulsing animation values
  const getPulseValues = (timestamp: number) => {
    const progress =
      (timestamp % ANIMATION_TIMINGS.PULSE_DURATION) /
      ANIMATION_TIMINGS.PULSE_DURATION;
    const pulseScale =
      ANIMATION_TIMINGS.PULSE_SCALE_MIN +
      (ANIMATION_TIMINGS.PULSE_SCALE_MAX - ANIMATION_TIMINGS.PULSE_SCALE_MIN) *
        (0.5 + 0.5 * Math.sin(progress * Math.PI * 2));
    const glowIntensity =
      ANIMATION_TIMINGS.GLOW_INTENSITY_MIN +
      (ANIMATION_TIMINGS.GLOW_INTENSITY_MAX -
        ANIMATION_TIMINGS.GLOW_INTENSITY_MIN) *
        (0.5 + 0.5 * Math.sin(progress * Math.PI * 2));
    return { pulseScale, glowIntensity };
  };

  // Create gradient for shot lines
  const createShotGradient = (
    ctx: CanvasRenderingContext2D,
    startPx: { x: number; y: number },
    endPx: { x: number; y: number },
    colors: string[]
  ) => {
    // For single color, just return the color directly
    if (colors.length === 1) {
      return colors[0];
    }

    const gradient = ctx.createLinearGradient(
      startPx.x,
      startPx.y,
      endPx.x,
      endPx.y
    );
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });
    return gradient;
  };

  // Load court background image when courtType or orientation changes
  useEffect(() => {
    const img = new window.Image();
    img.src =
      COURT_BG_IMAGES[courtType as keyof typeof COURT_BG_IMAGES][
        courtOrientation
      ];
    img.onload = () => {
      setBgImg(img);
      setBgLoaded((v) => v + 1);
    };
  }, [courtType, courtOrientation]);

  // Draw a shot endpoint handle (circle only)
  function drawShotHandle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string
  ) {
    ctx.beginPath();
    ctx.arc(x, y, HANDLE_RADIUS - 5, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.7;
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Draw racket at the end of arm
  function drawRacket(
    ctx: CanvasRenderingContext2D,
    armEndPx: { x: number; y: number },
    theta: number,
    color: string,
    swing: ResolvedSwingType
  ) {
    const racketLength = 20; // Length of racket head in pixels
    const racketWidth = 12; // Width of racket head in pixels

    // Position racket center back along arm direction by half racket length
    const racketCenterX = armEndPx.x - (racketLength / 2) * Math.cos(theta);
    const racketCenterY = armEndPx.y - (racketLength / 2) * Math.sin(theta);

    ctx.save();
    ctx.translate(racketCenterX, racketCenterY);

    // Racket orientation: aligned with arm direction
    ctx.rotate(theta);

    // Draw racket head as ellipse (longer axis along arm direction)
    ctx.beginPath();
    ctx.ellipse(0, 0, racketLength / 2, racketWidth / 2, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fill with semi-transparent color
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.3;
    ctx.fill();
    ctx.globalAlpha = 1.0;

    ctx.restore();
  }

  // Main drawing function
  function drawCourtAndPlayers(
    ctx: CanvasRenderingContext2D,
    anchors: any,
    bgImg: HTMLImageElement | null
  ) {
    const { drawWidth, drawHeight, offsetX, offsetY, courtToPx } = anchors;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (bgImg) {
      ctx.drawImage(bgImg, offsetX, offsetY, drawWidth, drawHeight);
    }

    const player1Px = courtToPx(player1);
    const player2Px = courtToPx(player2);
    const shot1Px = courtToPx(shot1);
    const shot2Px = courtToPx(shot2);
    const shot3Px = courtToPx(shot3);
    const shot4Px = courtToPx(shot4);

    // Resolve swings
    const resolvedPlayer1Swing =
      player1Swing === "auto"
        ? resolvePlayerSwing(
            player1,
            player1Handedness,
            courtOrientation,
            true,
            prevPlayer1Swing
          )
        : player1Swing;

    const resolvedPlayer2Swing =
      player2Swing === "auto"
        ? resolvePlayerSwing(
            player2,
            player2Handedness,
            courtOrientation,
            false,
            prevPlayer2Swing
          )
        : player2Swing;

    // Calculate contact points
    const player1ContactPoint = getContactPoint(
      player1,
      player1Handedness,
      resolvedPlayer1Swing,
      true,
      courtOrientation,
      courtToPx,
      anchors.pxToCourt
    );

    const player2ContactPoint = getContactPoint(
      player2,
      player2Handedness,
      resolvedPlayer2Swing,
      false,
      courtOrientation,
      courtToPx,
      anchors.pxToCourt
    );

    const player1ContactPx = courtToPx(player1ContactPoint);
    const player2ContactPx = courtToPx(player2ContactPoint);

    // Calculate pxPerMeter for drawing arms
    let pxPerMeter: number;
    if (courtOrientation === "portrait") {
      pxPerMeter = Math.sqrt(
        (courtToPx({ x: player1.x + 1, y: player1.y }).x - player1Px.x) ** 2 +
          (courtToPx({ x: player1.x, y: player1.y + 1 }).y - player1Px.y) ** 2
      );
    } else {
      pxPerMeter = Math.sqrt(
        (courtToPx({ x: player1.x, y: player1.y + 1 }).x - player1Px.x) ** 2 +
          (courtToPx({ x: player1.x + 1, y: player1.y }).y - player1Px.y) ** 2
      );
    }

    // Calculate arm end positions for visual drawing
    const player1ArmTheta = getPlayerArmTheta({
      orientation: courtOrientation,
      handedness: player1Handedness,
      swing: resolvedPlayer1Swing,
      isPlayer1: true,
    });

    const player2ArmTheta = getPlayerArmTheta({
      orientation: courtOrientation,
      handedness: player2Handedness,
      swing: resolvedPlayer2Swing,
      isPlayer1: false,
    });

    const fullArmPxPlayer1 = ARM_RACKET_LENGTH * pxPerMeter;
    const visualArmEndPxPlayer1 = {
      x: player1Px.x + fullArmPxPlayer1 * Math.cos(player1ArmTheta),
      y: player1Px.y + fullArmPxPlayer1 * Math.sin(player1ArmTheta),
    };

    const fullArmPxPlayer2 = ARM_RACKET_LENGTH * pxPerMeter;
    const visualArmEndPxPlayer2 = {
      x: player2Px.x + fullArmPxPlayer2 * Math.cos(player2ArmTheta),
      y: player2Px.y + fullArmPxPlayer2 * Math.sin(player2ArmTheta),
    };

    // Get animation values for pulsing effects
    const { pulseScale, glowIntensity } = getPulseValues(animationFrame);
    const shouldAnimate =
      hoveredElement === "player1" ||
      hoveredElement === "player2" ||
      isDragging;

    // Player 1 shots with tennis-themed colors and animations
    if (showShotsPlayer1) {
      const shotGradient1 = createShotGradient(
        ctx,
        player1ContactPx,
        shot1Px,
        courtTheme.shots.player1.gradient
      );
      const shotGradient2 = createShotGradient(
        ctx,
        player1ContactPx,
        shot2Px,
        courtTheme.shots.player1.gradient
      );

      ctx.save();
      if (shouldAnimate && hoveredElement === "player1") {
        ctx.shadowColor = courtTheme.shots.player1.primary;
        ctx.shadowBlur = 15 * glowIntensity;
        ctx.lineWidth = 4 * pulseScale;
      } else {
        ctx.lineWidth = 4;
      }

      // Shot 1
      ctx.strokeStyle = shotGradient1;
      ctx.beginPath();
      ctx.moveTo(player1ContactPx.x, player1ContactPx.y);
      ctx.lineTo(shot1Px.x, shot1Px.y);
      ctx.stroke();

      // Shot 2
      ctx.strokeStyle = shotGradient2;
      ctx.beginPath();
      ctx.moveTo(player1ContactPx.x, player1ContactPx.y);
      ctx.lineTo(shot2Px.x, shot2Px.y);
      ctx.stroke();
      ctx.restore();

      // Extended trajectory lines with lighter colors
      ctx.save();
      ctx.strokeStyle = courtTheme.player1.secondary;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      ctx.setLineDash([5, 5]);

      // Extend shot 1 trajectory
      const shot1Direction = {
        x: shot1Px.x - player1ContactPx.x,
        y: shot1Px.y - player1ContactPx.y,
      };
      const shot1Length = Math.hypot(shot1Direction.x, shot1Direction.y);
      if (shot1Length > 0) {
        const shot1Unit = {
          x: shot1Direction.x / shot1Length,
          y: shot1Direction.y / shot1Length,
        };

        // Find intersection with court boundaries
        let extendedShot1End = { x: shot1Px.x, y: shot1Px.y };
        const maxExtension = 2000; // Maximum pixels to extend

        for (let i = 0; i < maxExtension; i += 10) {
          const testPoint = {
            x: shot1Px.x + shot1Unit.x * i,
            y: shot1Px.y + shot1Unit.y * i,
          };

          // Check if we're still within the background image bounds
          if (
            testPoint.x < offsetX ||
            testPoint.x > offsetX + drawWidth ||
            testPoint.y < offsetY ||
            testPoint.y > offsetY + drawHeight
          ) {
            break;
          }
          extendedShot1End = testPoint;
        }

        ctx.beginPath();
        ctx.moveTo(shot1Px.x, shot1Px.y);
        ctx.lineTo(extendedShot1End.x, extendedShot1End.y);
        ctx.stroke();
      }

      // Extend shot 2 trajectory
      const shot2Direction = {
        x: shot2Px.x - player1ContactPx.x,
        y: shot2Px.y - player1ContactPx.y,
      };
      const shot2Length = Math.hypot(shot2Direction.x, shot2Direction.y);
      if (shot2Length > 0) {
        const shot2Unit = {
          x: shot2Direction.x / shot2Length,
          y: shot2Direction.y / shot2Length,
        };

        // Find intersection with court boundaries
        let extendedShot2End = { x: shot2Px.x, y: shot2Px.y };
        const maxExtension = 2000; // Maximum pixels to extend

        for (let i = 0; i < maxExtension; i += 10) {
          const testPoint = {
            x: shot2Px.x + shot2Unit.x * i,
            y: shot2Px.y + shot2Unit.y * i,
          };

          // Check if we're still within the background image bounds
          if (
            testPoint.x < offsetX ||
            testPoint.x > offsetX + drawWidth ||
            testPoint.y < offsetY ||
            testPoint.y > offsetY + drawHeight
          ) {
            break;
          }
          extendedShot2End = testPoint;
        }

        ctx.beginPath();
        ctx.moveTo(shot2Px.x, shot2Px.y);
        ctx.lineTo(extendedShot2End.x, extendedShot2End.y);
        ctx.stroke();
      }

      ctx.restore();
    }

    // Player 1 bisector with tennis-themed colors and animations
    if (showBisectorPlayer1) {
      const bisectorResult = calculateBisector(
        player1ContactPoint,
        shot1,
        shot2,
        courtToPx,
        BG_SIZE,
        courtOrientation,
        COURT_LENGTH
      );

      ctx.save();
      ctx.strokeStyle = courtTheme.bisectors.player1.primary;
      if (shouldAnimate && hoveredElement === "player1") {
        ctx.shadowColor = courtTheme.bisectors.player1.glow;
        ctx.shadowBlur = 20 * glowIntensity;
        ctx.lineWidth = 4 * pulseScale;
        ctx.setLineDash([12 * pulseScale, 8 * pulseScale]);
      } else {
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 6]);
      }

      ctx.beginPath();
      ctx.moveTo(player1ContactPx.x, player1ContactPx.y);
      ctx.lineTo(
        bisectorResult.bisectorEndPx.x,
        bisectorResult.bisectorEndPx.y
      );
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Player 2 shots with tennis-themed colors and animations
    if (showShotsPlayer2) {
      const shotGradient3 = createShotGradient(
        ctx,
        player2ContactPx,
        shot3Px,
        courtTheme.shots.player2.gradient
      );
      const shotGradient4 = createShotGradient(
        ctx,
        player2ContactPx,
        shot4Px,
        courtTheme.shots.player2.gradient
      );

      ctx.save();
      if (shouldAnimate && hoveredElement === "player2") {
        ctx.shadowColor = courtTheme.shots.player2.primary;
        ctx.shadowBlur = 15 * glowIntensity;
        ctx.lineWidth = 4 * pulseScale;
      } else {
        ctx.lineWidth = 4;
      }

      // Shot 3
      ctx.strokeStyle = shotGradient3;
      ctx.beginPath();
      ctx.moveTo(player2ContactPx.x, player2ContactPx.y);
      ctx.lineTo(shot3Px.x, shot3Px.y);
      ctx.stroke();

      // Shot 4
      ctx.strokeStyle = shotGradient4;
      ctx.beginPath();
      ctx.moveTo(player2ContactPx.x, player2ContactPx.y);
      ctx.lineTo(shot4Px.x, shot4Px.y);
      ctx.stroke();
      ctx.restore();

      // Extended trajectory lines with lighter colors
      ctx.save();
      ctx.strokeStyle = courtTheme.player2.secondary;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      ctx.setLineDash([5, 5]);

      // Extend shot 3 trajectory
      const shot3Direction = {
        x: shot3Px.x - player2ContactPx.x,
        y: shot3Px.y - player2ContactPx.y,
      };
      const shot3Length = Math.hypot(shot3Direction.x, shot3Direction.y);
      if (shot3Length > 0) {
        const shot3Unit = {
          x: shot3Direction.x / shot3Length,
          y: shot3Direction.y / shot3Length,
        };

        // Find intersection with court boundaries
        let extendedShot3End = { x: shot3Px.x, y: shot3Px.y };
        const maxExtension = 2000; // Maximum pixels to extend

        for (let i = 0; i < maxExtension; i += 10) {
          const testPoint = {
            x: shot3Px.x + shot3Unit.x * i,
            y: shot3Px.y + shot3Unit.y * i,
          };

          // Check if we're still within the background image bounds
          if (
            testPoint.x < offsetX ||
            testPoint.x > offsetX + drawWidth ||
            testPoint.y < offsetY ||
            testPoint.y > offsetY + drawHeight
          ) {
            break;
          }
          extendedShot3End = testPoint;
        }

        ctx.beginPath();
        ctx.moveTo(shot3Px.x, shot3Px.y);
        ctx.lineTo(extendedShot3End.x, extendedShot3End.y);
        ctx.stroke();
      }

      // Extend shot 4 trajectory
      const shot4Direction = {
        x: shot4Px.x - player2ContactPx.x,
        y: shot4Px.y - player2ContactPx.y,
      };
      const shot4Length = Math.hypot(shot4Direction.x, shot4Direction.y);
      if (shot4Length > 0) {
        const shot4Unit = {
          x: shot4Direction.x / shot4Length,
          y: shot4Direction.y / shot4Length,
        };

        // Find intersection with court boundaries
        let extendedShot4End = { x: shot4Px.x, y: shot4Px.y };
        const maxExtension = 2000; // Maximum pixels to extend

        for (let i = 0; i < maxExtension; i += 10) {
          const testPoint = {
            x: shot4Px.x + shot4Unit.x * i,
            y: shot4Px.y + shot4Unit.y * i,
          };

          // Check if we're still within the background image bounds
          if (
            testPoint.x < offsetX ||
            testPoint.x > offsetX + drawWidth ||
            testPoint.y < offsetY ||
            testPoint.y > offsetY + drawHeight
          ) {
            break;
          }
          extendedShot4End = testPoint;
        }

        ctx.beginPath();
        ctx.moveTo(shot4Px.x, shot4Px.y);
        ctx.lineTo(extendedShot4End.x, extendedShot4End.y);
        ctx.stroke();
      }

      ctx.restore();
    }

    // Player 2 bisector with tennis-themed colors and animations
    if (showBisectorPlayer2) {
      const bisectorResult = calculateBisector(
        player2ContactPoint,
        shot3,
        shot4,
        courtToPx,
        BG_SIZE,
        courtOrientation,
        0
      );

      ctx.save();
      ctx.strokeStyle = courtTheme.bisectors.player2.primary;
      if (shouldAnimate && hoveredElement === "player2") {
        ctx.shadowColor = courtTheme.bisectors.player2.glow;
        ctx.shadowBlur = 20 * glowIntensity;
        ctx.lineWidth = 4 * pulseScale;
        ctx.setLineDash([12 * pulseScale, 8 * pulseScale]);
      } else {
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 6]);
      }

      ctx.beginPath();
      ctx.moveTo(player2ContactPx.x, player2ContactPx.y);
      ctx.lineTo(
        bisectorResult.bisectorEndPx.x,
        bisectorResult.bisectorEndPx.y
      );
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Draw players with tennis-themed colors
    drawPlayerHandle({
      ctx,
      x: player1Px.x,
      y: player1Px.y,
      color: courtTheme.player1.primary,
      handedness: player1Handedness,
      scale: pxPerMeter,
      swing: resolvedPlayer1Swing,
      isPlayer1: true,
      orientation: courtOrientation,
    });

    drawPlayerHandle({
      ctx,
      x: player2Px.x,
      y: player2Px.y,
      color: courtTheme.player2.primary,
      handedness: player2Handedness,
      scale: pxPerMeter,
      swing: resolvedPlayer2Swing,
      isPlayer1: false,
      orientation: courtOrientation,
    });

    // Draw additional players for doubles mode (without shot options)
    if (gameMode === "doubles" && player1bis && player2bis) {
      const player1bisPx = courtToPx(player1bis);
      const player2bisPx = courtToPx(player2bis);

      // Draw player1bis with a slightly different color (lighter version of player1 color)
      drawPlayerHandle({
        ctx,
        x: player1bisPx.x,
        y: player1bisPx.y,
        color: courtTheme.player1.secondary,
        handedness: "right", // Default handedness for doubles partners
        scale: pxPerMeter,
        swing: "forehand", // Default swing for doubles partners
        isPlayer1: true,
        orientation: courtOrientation,
      });

      // Draw player2bis with a slightly different color (lighter version of player2 color)
      drawPlayerHandle({
        ctx,
        x: player2bisPx.x,
        y: player2bisPx.y,
        color: courtTheme.player2.secondary,
        handedness: "right", // Default handedness for doubles partners
        scale: pxPerMeter,
        swing: "forehand", // Default swing for doubles partners
        isPlayer1: false,
        orientation: courtOrientation,
      });
    }

    // Draw rackets with tennis-themed colors (only for main players)
    drawRacket(
      ctx,
      visualArmEndPxPlayer1,
      player1ArmTheta,
      courtTheme.rackets.player1,
      resolvedPlayer1Swing
    );
    drawRacket(
      ctx,
      visualArmEndPxPlayer2,
      player2ArmTheta,
      courtTheme.rackets.player2,
      resolvedPlayer2Swing
    );

    // Draw shot handles with tennis-themed colors
    if (showShotsPlayer1) {
      drawShotHandle(
        ctx,
        shot1Px.x,
        shot1Px.y,
        courtTheme.shots.player1.primary
      );
      drawShotHandle(
        ctx,
        shot2Px.x,
        shot2Px.y,
        courtTheme.shots.player1.primary
      );
    }
    if (showShotsPlayer2) {
      drawShotHandle(
        ctx,
        shot3Px.x,
        shot3Px.y,
        courtTheme.shots.player2.primary
      );
      drawShotHandle(
        ctx,
        shot4Px.x,
        shot4Px.y,
        courtTheme.shots.player2.primary
      );
    }

    // Show optimal positions
    if (showOptimal) {
      const player1BisectorResult = calculateBisector(
        player1ContactPoint,
        shot1,
        shot2,
        courtToPx,
        BG_SIZE,
        courtOrientation,
        COURT_LENGTH
      );

      const player2BisectorResult = calculateBisector(
        player2ContactPoint,
        shot3,
        shot4,
        courtToPx,
        BG_SIZE,
        courtOrientation,
        0
      );

      if (player1BisectorResult.optimalP2Px) {
        // Draw optimal P2 position (for Player 1's shots) with tennis-themed colors
        ctx.save();
        ctx.strokeStyle = courtTheme.optimal.player1.primary;
        ctx.fillStyle = courtTheme.optimal.player1.glow
          .replace(")", ", 0.2)")
          .replace("rgb", "rgba");

        if (shouldAnimate) {
          ctx.shadowColor = courtTheme.optimal.player1.glow;
          ctx.shadowBlur = 25 * glowIntensity;
          ctx.lineWidth = 4 * pulseScale;
          ctx.setLineDash([8 * pulseScale, 4 * pulseScale]);
        } else {
          ctx.lineWidth = 3;
          ctx.setLineDash([6, 4]);
        }

        ctx.beginPath();
        ctx.arc(
          player1BisectorResult.optimalP2Px.x,
          player1BisectorResult.optimalP2Px.y,
          shouldAnimate ? 22 * pulseScale : 20,
          0,
          2 * Math.PI
        );
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);

        // Add label with tennis-themed styling
        ctx.fillStyle = courtTheme.optimal.player1.primary;
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        if (shouldAnimate) {
          ctx.shadowColor = courtTheme.optimal.player1.glow;
          ctx.shadowBlur = 10 * glowIntensity;
        }
        ctx.fillText(
          "Optimal P2",
          player1BisectorResult.optimalP2Px.x,
          player1BisectorResult.optimalP2Px.y - 25
        );
        ctx.restore();
      }

      if (player2BisectorResult.optimalP1Px) {
        // Draw optimal P1 position (for Player 2's shots) with tennis-themed colors
        ctx.save();
        ctx.strokeStyle = courtTheme.optimal.player2.primary;
        ctx.fillStyle = courtTheme.optimal.player2.glow
          .replace(")", ", 0.2)")
          .replace("rgb", "rgba");

        if (shouldAnimate) {
          ctx.shadowColor = courtTheme.optimal.player2.glow;
          ctx.shadowBlur = 25 * glowIntensity;
          ctx.lineWidth = 4 * pulseScale;
          ctx.setLineDash([8 * pulseScale, 4 * pulseScale]);
        } else {
          ctx.lineWidth = 3;
          ctx.setLineDash([6, 4]);
        }

        ctx.beginPath();
        ctx.arc(
          player2BisectorResult.optimalP1Px.x,
          player2BisectorResult.optimalP1Px.y,
          shouldAnimate ? 22 * pulseScale : 20,
          0,
          2 * Math.PI
        );
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);

        // Add label with tennis-themed styling
        ctx.fillStyle = courtTheme.optimal.player2.primary;
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        if (shouldAnimate) {
          ctx.shadowColor = courtTheme.optimal.player2.glow;
          ctx.shadowBlur = 10 * glowIntensity;
        }
        ctx.fillText(
          "Optimal P1",
          player2BisectorResult.optimalP1Px.x,
          player2BisectorResult.optimalP1Px.y - 25
        );
        ctx.restore();
      }
    }
  }

  // Helper function to detect which element is under the mouse
  const detectHoveredElement = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const anchors = createCoordinateTransforms(
      canvasSize.width,
      canvasSize.height,
      courtOrientation
    );

    const player1Px = anchors.courtToPx(player1);
    const player2Px = anchors.courtToPx(player2);

    // Check if mouse is over player 1 (within HANDLE_RADIUS)
    const distToPlayer1 = Math.sqrt(
      (x - player1Px.x) ** 2 + (y - player1Px.y) ** 2
    );
    if (distToPlayer1 <= HANDLE_RADIUS + 10) {
      return "player1";
    }

    // Check if mouse is over player 2 (within HANDLE_RADIUS)
    const distToPlayer2 = Math.sqrt(
      (x - player2Px.x) ** 2 + (y - player2Px.y) ** 2
    );
    if (distToPlayer2 <= HANDLE_RADIUS + 10) {
      return "player2";
    }

    return null;
  };

  // Enhanced mouse move handler with hover detection
  const handleEnhancedMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Call the original mouse move handler
    onMouseMove(e);

    // Detect hover state
    const hoveredEl = detectHoveredElement(e);
    setHoveredElement(hoveredEl);
  };

  // Enhanced pointer down handler for drag detection
  const handleEnhancedPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    onPointerDown(e);
  };

  // Enhanced pointer up handler
  const handleEnhancedPointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    setHoveredElement(null);
    onPointerUp(e);
  };

  // Main drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const anchors = createCoordinateTransforms(
      canvasSize.width,
      canvasSize.height,
      courtOrientation
    );

    // Notify parent of coordinate transforms
    onTransformsReady(anchors);

    drawCourtAndPlayers(ctx, anchors, bgImg);
  }, [
    player1,
    player2,
    shot1,
    shot2,
    shot3,
    shot4,
    showShotsPlayer1,
    showShotsPlayer2,
    showBisectorPlayer1,
    showBisectorPlayer2,
    showOptimal,
    canvasSize,
    bgImg,
    bgLoaded,
    player1Handedness,
    player2Handedness,
    player1Swing,
    player2Swing,
    courtOrientation,
    courtType,
    hoveredElement,
    isDragging,
    animationFrame,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      className={
        `${tcStyles.courtCanvas} ` +
        (courtOrientation === "portrait"
          ? tcStyles.courtCanvasPortrait
          : tcStyles.courtCanvasLandscape)
      }
      tabIndex={0}
      onPointerDown={handleEnhancedPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={handleEnhancedPointerUp}
      onMouseMove={handleEnhancedMouseMove}
      onDoubleClick={onDoubleClick}
      aria-label="Tennis court simulation"
      title={`Player 1: ${player1Handedness} (${
        player1Swing === "auto" ? "auto" : player1Swing
      })\nDouble-click or long-press to toggle swing`}
    />
  );
};

export default CourtCanvas;
