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
  shot1: Position;
  shot2: Position;
  shot3: Position;
  shot4: Position;

  // Settings
  courtOrientation: CourtOrientation;
  courtType: string;
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
  onTouchStart: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchEnd: () => void;

  // Refs for coordinate transforms
  onTransformsReady: (transforms: any) => void;
}

const CourtCanvas: React.FC<CourtCanvasProps> = ({
  player1,
  player2,
  shot1,
  shot2,
  shot3,
  shot4,
  courtOrientation,
  courtType,
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
  onTouchStart,
  onTouchEnd,
  onTransformsReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgImg, setBgImg] = useState<HTMLImageElement | null>(null);
  const [bgLoaded, setBgLoaded] = useState(0);

  const BG_SIZE = BG_SIZES[courtOrientation];

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

    // Player 1 shots
    if (showShotsPlayer1) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(player1ContactPx.x, player1ContactPx.y);
      ctx.lineTo(shot1Px.x, shot1Px.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(player1ContactPx.x, player1ContactPx.y);
      ctx.lineTo(shot2Px.x, shot2Px.y);
      ctx.stroke();
    }

    // Player 1 bisector
    if (showBisectorPlayer1) {
      ctx.strokeStyle = "orange";
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(player1ContactPx.x, player1ContactPx.y);
      const bisectorResult = calculateBisector(
        player1ContactPoint,
        shot1,
        shot2,
        courtToPx,
        BG_SIZE,
        courtOrientation,
        COURT_LENGTH
      );
      ctx.lineTo(
        bisectorResult.bisectorEndPx.x,
        bisectorResult.bisectorEndPx.y
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Player 2 shots
    if (showShotsPlayer2) {
      ctx.strokeStyle = "green";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(player2ContactPx.x, player2ContactPx.y);
      ctx.lineTo(shot3Px.x, shot3Px.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(player2ContactPx.x, player2ContactPx.y);
      ctx.lineTo(shot4Px.x, shot4Px.y);
      ctx.stroke();
    }

    // Player 2 bisector
    if (showBisectorPlayer2) {
      ctx.strokeStyle = "cyan";
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(player2ContactPx.x, player2ContactPx.y);
      const bisectorResult = calculateBisector(
        player2ContactPoint,
        shot3,
        shot4,
        courtToPx,
        BG_SIZE,
        courtOrientation,
        0
      );
      ctx.lineTo(
        bisectorResult.bisectorEndPx.x,
        bisectorResult.bisectorEndPx.y
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw players
    drawPlayerHandle({
      ctx,
      x: player1Px.x,
      y: player1Px.y,
      color: "blue",
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
      color: "purple",
      handedness: player2Handedness,
      scale: pxPerMeter,
      swing: resolvedPlayer2Swing,
      isPlayer1: false,
      orientation: courtOrientation,
    });

    // Draw rackets
    drawRacket(
      ctx,
      visualArmEndPxPlayer1,
      player1ArmTheta,
      "blue",
      resolvedPlayer1Swing
    );
    drawRacket(
      ctx,
      visualArmEndPxPlayer2,
      player2ArmTheta,
      "purple",
      resolvedPlayer2Swing
    );

    // Draw shot handles
    if (showShotsPlayer1) {
      drawShotHandle(ctx, shot1Px.x, shot1Px.y, "red");
      drawShotHandle(ctx, shot2Px.x, shot2Px.y, "red");
    }
    if (showShotsPlayer2) {
      drawShotHandle(ctx, shot3Px.x, shot3Px.y, "green");
      drawShotHandle(ctx, shot4Px.x, shot4Px.y, "green");
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
        // Draw optimal P2 position (for Player 1's shots)
        ctx.save();
        ctx.strokeStyle = "#fbbf24"; // amber-400
        ctx.fillStyle = "rgba(251, 191, 36, 0.2)";
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(
          player1BisectorResult.optimalP2Px.x,
          player1BisectorResult.optimalP2Px.y,
          20,
          0,
          2 * Math.PI
        );
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);

        // Add label
        ctx.fillStyle = "#92400e";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          "Optimal P2",
          player1BisectorResult.optimalP2Px.x,
          player1BisectorResult.optimalP2Px.y - 25
        );
        ctx.restore();
      }

      if (player2BisectorResult.optimalP1Px) {
        // Draw optimal P1 position (for Player 2's shots)
        ctx.save();
        ctx.strokeStyle = "#10b981"; // emerald-500
        ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(
          player2BisectorResult.optimalP1Px.x,
          player2BisectorResult.optimalP1Px.y,
          20,
          0,
          2 * Math.PI
        );
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);

        // Add label
        ctx.fillStyle = "#047857";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          "Optimal P1",
          player2BisectorResult.optimalP1Px.x,
          player2BisectorResult.optimalP1Px.y - 25
        );
        ctx.restore();
      }
    }
  }

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
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onMouseMove={onMouseMove}
      onDoubleClick={onDoubleClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-label="Tennis court simulation"
      title={`Player 1: ${player1Handedness} (${
        player1Swing === "auto" ? "auto" : player1Swing
      })\nDouble-click or long-press to toggle swing`}
    />
  );
};

export default CourtCanvas;
