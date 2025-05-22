import React, { useRef, useEffect, useState } from "react";
import ShotInfoPanel from "./ShotInfoPanel"; // Used in sidebar panel
import { drawPlayerHandle, getPlayerArmTheta } from "./PlayerHandle";

// Tennis court dimensions (in meters)
const COURT_LENGTH = 23.77;
const COURT_WIDTH = 10.97;
const SINGLES_WIDTH = 8.23;
const NET_Y = COURT_LENGTH / 2; // Net Y position (middle of the court)

// Responsive canvas: scale to parent/container
function getScale(
  width: number,
  height: number,
  BG_SIZE: { width: number; length: number }
) {
  return Math.min(width / BG_SIZE.width, height / BG_SIZE.length);
}

// Convert meters to canvas px (with scale and offset for extra space)
// Pixel-perfect mapping using provided background pixel coordinates
// Anchor points are now dynamic and defined in useEffect based on offsetX, offsetY, drawWidth, drawHeight.
// Singles sideline anchors (ITF standard, meters from left edge)
const leftSinglesX = 0.914;
const rightSinglesX = 8.229;
const singlesCenterX = (leftSinglesX + rightSinglesX) / 2;
const topY = 0;
const botY = COURT_LENGTH;

// Default position for Player 1 (top side, center)
// These helpers must use BG_SIZE for landscape, not COURT_WIDTH
function getDefaultPlayer1(orientation: CourtOrientation) {
  if (orientation === "portrait") {
    // Top center of court
    return { x: singlesCenterX, y: 0 };
  } else {
    // Landscape: center sideline, left baseline
    return { x: singlesCenterX, y: 0 };
  }
}
function getDefaultPlayer2(orientation: CourtOrientation) {
  if (orientation === "portrait") {
    // Bottom center of court
    return { x: singlesCenterX, y: COURT_LENGTH };
  } else {
    // Landscape: center sideline, right baseline
    return { x: singlesCenterX, y: COURT_LENGTH };
  }
}
function getDefaultShot1(orientation: CourtOrientation) {
  if (orientation === "portrait") {
    // Left singles sideline, bottom (opponent side)
    return { x: leftSinglesX, y: COURT_LENGTH };
  } else {
    // Landscape: left sideline, opponent's baseline, vertical center
    return { x: leftSinglesX, y: botY };
  }
}
function getDefaultShot2(orientation: CourtOrientation) {
  if (orientation === "portrait") {
    // Right singles sideline, bottom (opponent side)
    return { x: rightSinglesX, y: COURT_LENGTH };
  } else {
    // Landscape: right sideline, opponent's baseline, vertical center
    return { x: rightSinglesX, y: botY };
  }
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

// Hit detection radius in px
const HANDLE_RADIUS = 18;
const HANDLE_CLICK_RADIUS = 32; // Larger clickable zone for double-click/long-press

type DragTarget = "player1" | "player2" | "shot1" | "shot2" | null;

import tcStyles from "./TennisCourt.module.scss";

// Arm/racket drawing constants
const ARM_RACKET_LENGTH = 1.105; // meters (approximate: arm+racquet, 30% longer)
const CONTACT_POINT_RATIO = 0.97; // Contact point is 97% of the arm+racquet length

type CourtOrientation = "portrait" | "landscape";

const COURT_BG_IMAGES: Record<string, Record<CourtOrientation, string>> = {
  clay: {
    portrait: "/court-bg-portrait-clay.png",
    landscape: "/court-bg-landscape-clay.png",
  },
  hard: {
    portrait: "/court-bg-portrait-hard.png",
    landscape: "/court-bg-landscape-hard.png",
  },
  grass: {
    portrait: "/court-bg-portrait-grass.png",
    landscape: "/court-bg-landscape-grass.png",
  },
};

type CourtType = "clay" | "hard" | "grass";

const TennisCourt: React.FC = () => {
  // --- Refs for coordinate transforms and hit testing ---
  const pxToCourtRef = useRef<any>(null);
  const courtToPxRef = useRef<any>(null);
  const hitTestHandlesRef = useRef<any>(null);

  // --- State ---
  const [showStatsPanel, setShowStatsPanel] = useState(true);
  const [showAngles, setShowAngles] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [player1, setPlayer1] = useState(() => getDefaultPlayer1("portrait"));
  const [player2, setPlayer2] = useState(() => getDefaultPlayer2("portrait"));
  const [shot1, setShot1] = useState(() => getDefaultShot1("portrait"));
  const [shot2, setShot2] = useState(() => getDefaultShot2("portrait"));
  const [hasMovedPlayer1, setHasMovedPlayer1] = useState(false);
  const [courtOrientation, setCourtOrientation] =
    useState<CourtOrientation>("portrait");

  // Ensure player/shot positions are reset to correct side when orientation changes (unless user has dragged)
  useEffect(() => {
    if (!hasMovedPlayer1) {
      setPlayer1(getDefaultPlayer1(courtOrientation));
      setPlayer2(getDefaultPlayer2(courtOrientation));
      setShot1(getDefaultShot1(courtOrientation));
      setShot2(getDefaultShot2(courtOrientation));
    }
  }, [courtOrientation, hasMovedPlayer1]);
  const [player1Handedness, setPlayer1Handedness] = useState<"right" | "left">(
    "right"
  );
  const [player1Swing, setPlayer1Swing] = useState<
    "auto" | "forehand" | "backhand"
  >("auto");
  const [dragging, setDragging] = useState<DragTarget>(null);

  // --- Refs (if needed) ---
  // Only declare refs for canvas or container if actually used in hooks/effects
  const BG_SIZE =
    courtOrientation === "portrait"
      ? { width: 13.0, length: 28.0 }
      : { width: 28.0, length: 13.0 }; // Landscape: swap width/length

  // --- Coordinate mapping helpers ---
  // Fix: correct coordinate swap/mirror for landscape
  function logicalToDisplay({ x, y }: { x: number; y: number }) {
    // Always identity: logical coordinates are always in portrait system
    return { x, y };
  }
  function displayToLogical({ x, y }: { x: number; y: number }) {
    if (courtOrientation === "portrait") {
      return { x, y };
    } else {
      // Inverse of above: (x, y) -> (COURT_WIDTH - y, x)
      return { x: COURT_WIDTH - y, y: x };
    }
  }

  // --- Remove global courtToPx and pxToCourt: these must only exist in the drawing effect with anchor scope ---
  // Helper for baseline/net Y in BG coordinates
  const BASELINE_OFFSET = (BG_SIZE.length - COURT_LENGTH) / 2;
  const BASELINE_Y_BG = BASELINE_OFFSET + COURT_LENGTH;
  const NET_Y_BG = BASELINE_OFFSET + COURT_LENGTH / 2;
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 800 });
  const [showOptimal, setShowOptimal] = useState(false);
  // Court type (background)
  const [courtType, setCourtType] = useState<CourtType>("hard");
  const [bgImg, setBgImg] = useState<HTMLImageElement | null>(null);
  const [bgLoaded, setBgLoaded] = useState(0); // Dummy state to force redraw
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load court background image when courtType changes
  useEffect(() => {
    const img = new window.Image();
    img.src = COURT_BG_IMAGES[courtType][courtOrientation];
    img.onload = () => {
      setBgImg(img);
      setBgLoaded((v) => v + 1); // Force redraw
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

  // --- Helper: getBisectorAndP2 (for gamification and drawing) ---
  function getBisectorAndP2(originPx?: { x: number; y: number }) {
    // Use true angle bisector in meters (not pixels)
    // Use arm+racquet contact point as origin
    const armExt = (() => {
      // If originPx is provided, convert to court coords
      if (originPx && pxToCourtRef.current) {
        return pxToCourtRef.current({ px: originPx.x, py: originPx.y });
      }
      // Otherwise use player1 + arm (30° forward for right-handed, 150° for left-handed)
      const theta =
        player1Handedness === "right" ? Math.PI / 6 : (5 * Math.PI) / 6;
      return {
        x:
          player1.x + ARM_RACKET_LENGTH * CONTACT_POINT_RATIO * Math.cos(theta),
        y:
          player1.y + ARM_RACKET_LENGTH * CONTACT_POINT_RATIO * Math.sin(theta),
      };
    })();
    const v1 = { x: shot1.x - armExt.x, y: shot1.y - armExt.y };
    const v2 = { x: shot2.x - armExt.x, y: shot2.y - armExt.y };
    // Normalize
    const len1 = Math.hypot(v1.x, v1.y);
    const len2 = Math.hypot(v2.x, v2.y);
    const n1 = { x: v1.x / len1, y: v1.y / len1 };
    const n2 = { x: v2.x / len2, y: v2.y / len2 };
    // Bisector direction
    const bis = { x: n1.x + n2.x, y: n1.y + n2.y };
    const bisLen = Math.hypot(bis.x, bis.y);
    const bisNorm = { x: bis.x / bisLen, y: bis.y / bisLen };
    // Find intersection with baseline (y = COURT_LENGTH)
    let t = (COURT_LENGTH - armExt.y) / bisNorm.y;
    const bisectorEnd = {
      x: armExt.x + bisNorm.x * t,
      y: COURT_LENGTH,
    };
    // Optimal P2 position: just behind baseline, at intersection
    const optimalP2 = {
      x: bisectorEnd.x,
      y: COURT_LENGTH,
    };
    // If you want the pixel version for drawing:
    const courtToPx = courtToPxRef.current || (() => ({ x: 0, y: 0 }));
    return {
      bisectorEndPx: courtToPx({ x: bisectorEnd.x, y: bisectorEnd.y }),
      optimalP2Px: courtToPx({ x: optimalP2.x, y: optimalP2.y }),
      optimalP2,
    };
  }

  // --- Player1 handle double-click for swing toggle ---
  // Dummy state to force redraw after swing change
  const [_, forceUpdate] = useState(0);

  function handlePlayer1DoubleClickCanvas(
    e: React.MouseEvent<HTMLCanvasElement>
  ) {
    if (!canvasRef.current || !hitTestHandlesRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    // Use orientation-aware hit test
    const hit = hitTestHandlesRef.current(px, py);
    if (hit === "player1") {
      setPlayer1Swing((s) => {
        const next =
          s === "auto" ? "forehand" : s === "forehand" ? "backhand" : "auto";
        return next;
      });
      // Force immediate redraw for instant feedback
      setHasMovedPlayer1((v) => !v);
    }
  }

  // --- Mobile long-press support for swing toggle ---
  let longPressTimer: number | null = null;
  function handleTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
    if (!canvasRef.current || !hitTestHandlesRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const px = touch.clientX - rect.left;
    const py = touch.clientY - rect.top;
    // Use orientation-aware hit test
    const hit = hitTestHandlesRef.current(px, py);
    if (hit === "player1") {
      longPressTimer = window.setTimeout(() => {
        setPlayer1Swing((s) => {
          const next =
            s === "auto" ? "forehand" : s === "forehand" ? "backhand" : "auto";
          forceUpdate((v) => v + 1);
          return next;
        });
      }, 500); // 500ms long-press
    }
  }
  function handleTouchEnd() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  // --- Auto-update shot endpoints based on Player 1 position ---
  useEffect(() => {
    if (!hasMovedPlayer1) return;
    // Determine arm+racquet contact point
    const theta =
      player1Handedness === "right" ? (3 * Math.PI) / 4 : Math.PI / 4;
    const contact = {
      x: player1.x + ARM_RACKET_LENGTH * Math.cos(theta),
      y: player1.y + ARM_RACKET_LENGTH * Math.sin(theta),
    };
    // Down-the-line: interpolate from baseline to service line as player advances
    const downLineX = contact.x < singlesCenterX ? leftSinglesX : rightSinglesX;
    const serviceLineY = NET_Y + 6.4;
    const forwardNet = clamp(
      -(contact.y - NET_Y) / (COURT_LENGTH - NET_Y),
      0,
      1
    );
    const lateral = clamp(
      Math.abs(contact.x - singlesCenterX) / (COURT_WIDTH / 2),
      0,
      1
    );

    const downLineY =
      COURT_LENGTH -
      (forwardNet < 1
        ? (1 - lateral) * (COURT_LENGTH - serviceLineY) * (1 - forwardNet)
        : 0);
    const downLine = { x: downLineX, y: downLineY };
    // Cross-court: interpolate from baseline to 1m inside service line based on lateral position
    const crossX = contact.x < singlesCenterX ? rightSinglesX : leftSinglesX;
    const crossY =
      COURT_LENGTH -
      lateral * (COURT_LENGTH - serviceLineY) -
      (forwardNet < 1 ? (1 - forwardNet) * 5 : 0);
    const cross = { x: crossX, y: crossY };
    setShot1(downLine);
    setShot2(cross);
  }, [player1.x, player1.y, hasMovedPlayer1, player1Handedness]);

  // Responsive resize with aspect ratio lock
  useEffect(() => {
    function updateCanvasSize() {
      if (containerRef.current) {
        const containerW = containerRef.current.clientWidth;
        const containerH = containerRef.current.clientHeight;
        let width = containerW;
        let height = containerH;
        // Use correct aspect ratio for orientation
        let aspect = BG_SIZE.width / BG_SIZE.length; // width/height always
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
          // Swap containerW and containerH for the aspect calculation
          aspect = BG_SIZE.width / BG_SIZE.length;
          if (containerH / containerW > 1 / aspect) {
            width = containerW;
            height = Math.round(width / aspect);
          } else {
            height = containerH;
            width = Math.round(height * aspect);
          }
        }
        console.log(
          "containerW",
          containerW,
          "containerH",
          containerH,
          "canvas width",
          width,
          "canvas height",
          height,
          "aspect",
          aspect,
          "orientation",
          courtOrientation
        );

        setCanvasSize({ width, height });
      }
    }
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [courtOrientation, BG_SIZE.width, BG_SIZE.length]);
  // Main effect: handles mapping, refs, and drawing using anchor-based mapping
  // --- Helper: setupCourtTransformsAndAnchors ---
  const anchorsRef = useRef<any>(null);

  function setupCourtTransformsAndAnchors({
    canvasW,
    canvasH,
    BG_SIZE,
    courtOrientation,
    logicalToDisplay,
    displayToLogical,
    courtToPxRef,
    pxToCourtRef,
    hitTestHandlesRef,
  }: any) {
    // Compute draw size/aspect
    const BG_ORIG_WIDTH = courtOrientation === "portrait" ? 500 : 1000;
    const BG_ORIG_HEIGHT = courtOrientation === "portrait" ? 1000 : 500;
    let drawWidth = canvasW;
    let drawHeight = canvasH;
    let offsetX = 0;
    let offsetY = 0;
    const scaleX = drawWidth / BG_ORIG_WIDTH;
    const scaleY = drawHeight / BG_ORIG_HEIGHT;
    let pxTopLeft: { x: number; y: number };
    let pxTopRight: { x: number; y: number };
    let pxBotLeft: { x: number; y: number };
    let pxBotRight: { x: number; y: number };

    if (courtOrientation === "portrait") {
      pxTopLeft = { x: offsetX + 134 * scaleX, y: offsetY + 161 * scaleY };
      pxTopRight = { x: offsetX + 367 * scaleX, y: offsetY + 161 * scaleY };
      pxBotLeft = { x: offsetX + 134 * scaleX, y: offsetY + 843 * scaleY };
      pxBotRight = { x: offsetX + 367 * scaleX, y: offsetY + 843 * scaleY };
    } else {
      // Use measured anchors for landscape image, scaled to image
      pxTopLeft = { x: 160 * scaleX, y: 134 * scaleY };
      pxTopRight = { x: 841 * scaleX, y: 134 * scaleY };
      pxBotLeft = { x: 160 * scaleX, y: 366 * scaleY };
      pxBotRight = { x: 841 * scaleX, y: 366 * scaleY };
    }

    // === DEBUG: Anchor box and scaling ===
    // console.log('[ANCHORS]', {
    //   orientation: courtOrientation,
    //   BG_SIZE,
    //   drawWidth,
    //   drawHeight,
    //   offsetX,
    //   offsetY,
    //   scaleX,
    //   scaleY,
    //   pxTopLeft,
    //   pxTopRight,
    //   pxBotLeft,
    //   pxBotRight,
    // });
    const leftSinglesX = 0.914;
    const rightSinglesX = 8.229;
    const topY = 0;
    const botY = 23.77;
    function courtToPx(logical: { x: number; y: number }) {
      if (courtOrientation === "portrait") {
        // Portrait: standard mapping
        const t = (logical.x - leftSinglesX) / (rightSinglesX - leftSinglesX);
        const s = (logical.y - topY) / (botY - topY);
        const topX = pxTopLeft.x + t * (pxTopRight.x - pxTopLeft.x);
        const botX = pxBotLeft.x + t * (pxBotRight.x - pxBotLeft.x);
        const xPx = topX + s * (botX - topX);
        const yPx = pxTopLeft.y + s * (pxBotLeft.y - pxTopLeft.y);
        return { x: xPx, y: yPx };
      } else {
        // Landscape: swap axes for mapping
        // logical.x (vertical, portrait Y) maps to horizontal axis
        // logical.y (horizontal, portrait X) maps to vertical axis
        // Landscape: swap axes so logical.y (length) maps to xPx, logical.x (width) maps to yPx
        const t = (logical.y - topY) / (botY - topY); // 0 (top) to 1 (bottom)
        const s = (logical.x - leftSinglesX) / (rightSinglesX - leftSinglesX); // 0 (left) to 1 (right)
        const xPx = pxTopLeft.x + t * (pxTopRight.x - pxTopLeft.x);
        const yPx = pxTopLeft.y + s * (pxBotLeft.y - pxTopLeft.y);
        return { x: xPx, y: yPx };
      }
    }
    function pxToCourt({ px, py }: { px: number; py: number }) {
      if (courtOrientation === "portrait") {
        // Portrait: original logic
        const s = (py - pxTopLeft.y) / (pxBotLeft.y - pxTopLeft.y);
        const leftX = pxTopLeft.x + s * (pxBotLeft.x - pxTopLeft.x);
        const rightX = pxTopRight.x + s * (pxBotRight.x - pxTopRight.x);
        const t = (px - leftX) / (rightX - leftX);
        const x = leftSinglesX + t * (rightSinglesX - leftSinglesX);
        const y = topY + s * (botY - topY);
        return displayToLogical({ x, y });
      } else {
        // Landscape: invert the swap logic of courtToPx
        const t = (px - pxTopLeft.x) / (pxTopRight.x - pxTopLeft.x); // 0 (left) to 1 (right)
        const s = (py - pxTopLeft.y) / (pxBotLeft.y - pxTopLeft.y); // 0 (top) to 1 (bottom)
        const logicalY = topY + t * (botY - topY);
        const logicalX = leftSinglesX + s * (rightSinglesX - leftSinglesX);
        // Landscape: do NOT call displayToLogical, just return the mapping directly
        return { x: logicalX, y: logicalY };
      }
    }
    function dist(x1: number, y1: number, x2: number, y2: number) {
      return Math.hypot(x1 - x2, y1 - y2);
    }
    function hitTestHandles(
      px: number,
      py: number,
      radiusOverride?: number
    ): DragTarget {
      const r = radiusOverride ?? HANDLE_RADIUS;
      const player1Px = courtToPx({ x: player1.x, y: player1.y });
      const player2Px = courtToPx({ x: player2.x, y: player2.y });
      const shot1Px = courtToPx({ x: shot1.x, y: shot1.y });
      const shot2Px = courtToPx({ x: shot2.x, y: shot2.y });
      // Log all positions and mouse
      if (window && (window as any).DEBUG_HITTEST) {
        console.log("hitTestHandles", {
          px,
          py,
          player1Px,
          player2Px,
          shot1Px,
          shot2Px,
          offsetX: anchorsRef.current?.offsetX,
          offsetY: anchorsRef.current?.offsetY,
          drawWidth: anchorsRef.current?.drawWidth,
          drawHeight: anchorsRef.current?.drawHeight,
          r,
        });
      }
      if (dist(px, py, player1Px.x, player1Px.y) < r) return "player1";
      if (dist(px, py, player2Px.x, player2Px.y) < r) return "player2";
      if (dist(px, py, shot1Px.x, shot1Px.y) < r) return "shot1";
      if (dist(px, py, shot2Px.x, shot2Px.y) < r) return "shot2";
      return null;
    }
    courtToPxRef.current = courtToPx;
    pxToCourtRef.current = pxToCourt;
    hitTestHandlesRef.current = hitTestHandles;
    // Store latest anchors in ref for dragging
    anchorsRef.current = {
      pxTopLeft,
      pxTopRight,
      pxBotLeft,
      pxBotRight,
      drawWidth,
      drawHeight,
      offsetX,
      offsetY,
      courtToPx,
      pxToCourt,
    };
    // === ANCHOR DEBUG LOG ===
    // console.log('Anchor debug', {
    //   pxTopLeft, pxTopRight, pxBotLeft, pxBotRight,
    //   leftSinglesX, rightSinglesX, topY, botY,
    //   BG_SIZE,
    //   drawWidth, drawHeight, offsetX, offsetY,
    //   orientation: courtOrientation
    // });
    // === END ANCHOR DEBUG ===
    return anchorsRef.current;
  }

  // ... (rest of the code remains the same)

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    // console.log('Canvas debug', {
    //   canvasWidth: canvas.width,
    //   canvasHeight: canvas.height,
    //   cssWidth: rect.width,
    //   cssHeight: rect.height,
    //   scaleX, scaleY
    // });
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    if (!anchorsRef.current || !anchorsRef.current.pxToCourt) return;
    // Subtract offsetX/offsetY to get px/py relative to drawn court
    const pxInCourt = px - anchorsRef.current.offsetX;
    const pyInCourt = py - anchorsRef.current.offsetY;
    const { x: courtX, y: courtY } = anchorsRef.current.pxToCourt({
      px: pxInCourt,
      py: pyInCourt,
    });

    if (anchorsRef.current) {
      let bgLogicalLeft, bgLogicalRight, bgLogicalTop, bgLogicalBottom;
      if (courtOrientation === "portrait") {
        bgLogicalLeft = anchorsRef.current.pxToCourt({ px: 0, py: 0 }).x;
        bgLogicalRight = anchorsRef.current.pxToCourt({
          px: anchorsRef.current.drawWidth,
          py: 0,
        }).x;
        bgLogicalTop = anchorsRef.current.pxToCourt({ px: 0, py: 0 }).y;
        bgLogicalBottom = anchorsRef.current.pxToCourt({
          px: 0,
          py: anchorsRef.current.drawHeight,
        }).y;
      } else {
        // Landscape: axes are swapped
        const leftX = anchorsRef.current.pxToCourt({ px: 0, py: 0 }).x;
        const rightX = anchorsRef.current.pxToCourt({
          px: 0,
          py: anchorsRef.current.drawHeight,
        }).x;
        bgLogicalLeft = Math.min(leftX, rightX);
        bgLogicalRight = Math.max(leftX, rightX);
        const topY = anchorsRef.current.pxToCourt({ px: 0, py: 0 }).y;
        const bottomY = anchorsRef.current.pxToCourt({
          px: anchorsRef.current.drawWidth,
          py: 0,
        }).y;
        bgLogicalTop = Math.min(topY, bottomY);
        bgLogicalBottom = Math.max(topY, bottomY);
      }

      console.log("[BG LOGICAL BOUNDS]", {
        courtOrientation,
        bgLogicalLeft,
        bgLogicalRight,
        bgLogicalTop,
        bgLogicalBottom,
      });

      console.log("[DRAG LOGIC] Player1 drag", {
        orientation: courtOrientation,
        bgLogicalLeft,
        bgLogicalRight,
        bgLogicalTop,
        bgLogicalBottom,
        courtX,
        courtY,
        clampX: clamp(courtX, bgLogicalLeft, bgLogicalRight),
        clampY: clamp(courtY, bgLogicalTop, NET_Y),
      });
      if (dragging === "player1") {
        setPlayer1({
          x: clamp(courtX, bgLogicalLeft, bgLogicalRight),
          y: clamp(courtY, bgLogicalTop, NET_Y),
        });
        setHasMovedPlayer1(true);
      } else if (dragging === "player2") {
        setPlayer2({
          x: clamp(courtX, bgLogicalLeft, bgLogicalRight),
          y: clamp(courtY, NET_Y, bgLogicalBottom),
        });
      } else if (dragging === "shot1") {
        setShot1({ x: courtX, y: courtY });
      } else if (dragging === "shot2") {
        setShot2({ x: courtX, y: courtY });
      }
    }
  }

  // --- Cursor feedback for draggable handles ---
  function handleMouseMove(e: React.MouseEvent) {
    if (!anchorsRef.current) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    // Pass full canvas px/py to hitTestHandles
    const hit = hitTestHandlesRef.current
      ? hitTestHandlesRef.current(px, py)
      : null;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = hit ? "pointer" : "default";
    }
  }

  // --- Draw court and players ---
  function drawCourtAndPlayers(
    ctx: CanvasRenderingContext2D,
    anchors: any,
    bgImg: any
  ) {
    // --- DEBUG: Log anchor box and logical-to-pixel mapping for key points ---
    if (anchors && courtOrientation === "landscape") {
      const { courtToPx } = anchors;
      const logPx = (label: string, logical: { x: number; y: number }) => {
        const px = courtToPx(logical);
        // console.log(`[DEBUG MAP] ${label} logical:`, logical, 'pixel:', px);
      };
      logPx("Player1", { x: singlesCenterX, y: COURT_LENGTH });
      logPx("Player2", { x: singlesCenterX, y: 0 });
      logPx("Shot1", { x: leftSinglesX, y: 0 });
      logPx("Shot2", { x: rightSinglesX, y: 0 });
      logPx("Court Top-Left", { x: leftSinglesX, y: 0 });
      logPx("Court Top-Right", { x: rightSinglesX, y: 0 });
      logPx("Court Bottom-Left", { x: leftSinglesX, y: COURT_LENGTH });
      logPx("Court Bottom-Right", { x: rightSinglesX, y: COURT_LENGTH });
    }
    const { drawWidth, drawHeight, offsetX, offsetY, courtToPx } = anchors;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (bgImg) {
      ctx.drawImage(bgImg, offsetX, offsetY, drawWidth, drawHeight);
    }
    const player1Px = courtToPx({ x: player1.x, y: player1.y });
    let swing: "forehand" | "backhand";
    // Helper to resolve Player 1's swing in auto mode
    // Helper to resolve Player 1's swing in auto mode
    function resolvePlayer1Swing(
      player1: { x: number; y: number },
      handedness: "left" | "right",
      orientation: CourtOrientation
    ): "forehand" | "backhand" {
      if (orientation === "landscape") {
        // Landscape: rel is based on x (sideline-to-sideline)
        // leftSinglesX (min x) to rightSinglesX (max x)
        const rel = (player1.x - leftSinglesX) / (rightSinglesX - leftSinglesX);
        // Right-handed: forehand on left 2/3, backhand on right 1/3
        // Left-handed: forehand on right 2/3, backhand on left 1/3
        return handedness === "right"
          ? rel < 1 / 3
            ? "backhand"
            : "forehand"
          : rel > 2 / 3
          ? "backhand"
          : "forehand";
      } else {
        // Portrait logic (example: based on y position)
        const rel = (player1.x - leftSinglesX) / (rightSinglesX - leftSinglesX);
        return handedness === "right"
          ? rel < 2 / 3
            ? "forehand"
            : "backhand"
          : rel > 1 / 3
          ? "forehand"
          : "backhand";
      }
    }

    if (player1Swing === "auto") {
      swing = resolvePlayer1Swing(player1, player1Handedness, courtOrientation);
    } else {
      swing = player1Swing;
    }
    const theta = getPlayerArmTheta({
      orientation: courtOrientation,
      handedness: player1Handedness,
      swing,
    });
    const armPx = ARM_RACKET_LENGTH;
    let player1ArmExt: { x: number; y: number };
    let player1ArmExtPxForOverlay: { x: number; y: number };
    player1ArmExt = {
      x: player1.x + armPx * Math.cos(theta),
      y: player1.y + armPx * Math.sin(theta),
    };
    player1ArmExtPxForOverlay = courtToPx(player1ArmExt);

    const player2Px = courtToPx({ x: player2.x, y: player2.y });
    const shot1Px = courtToPx({ x: shot1.x, y: shot1.y });
    const shot2Px = courtToPx({ x: shot2.x, y: shot2.y });

    // console.log('[PLAYER1]', 'logical:', player1, 'pixel:', player1Px);
    // console.log('[PLAYER2]', 'logical:', player2, 'pixel:', player2Px);
    // console.log('[SHOT1]', 'logical:', shot1, 'pixel:', shot1Px);
    // console.log('[SHOT2]', 'logical:', shot2, 'pixel:', shot2Px);

    let pxPerMeter: number;
    if (courtOrientation === "portrait") {
      pxPerMeter = Math.sqrt(
        (courtToPx({ x: player1.x + 1, y: player1.y }).x - player1Px.x) ** 2 +
          (courtToPx({ x: player1.x, y: player1.y + 1 }).y - player1Px.y) ** 2
      );
    } else {
      // In landscape, x+1 is vertical, y+1 is horizontal
      pxPerMeter = Math.sqrt(
        (courtToPx({ x: player1.x, y: player1.y + 1 }).x - player1Px.x) ** 2 +
          (courtToPx({ x: player1.x + 1, y: player1.y }).y - player1Px.y) ** 2
      );
    }

    if (showAngles) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(player1ArmExtPxForOverlay.x, player1ArmExtPxForOverlay.y);
      ctx.lineTo(shot1Px.x, shot1Px.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(player1ArmExtPxForOverlay.x, player1ArmExtPxForOverlay.y);
      ctx.lineTo(shot2Px.x, shot2Px.y);
      ctx.stroke();
      ctx.strokeStyle = "orange";
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(player1ArmExtPxForOverlay.x, player1ArmExtPxForOverlay.y);
      const { bisectorEndPx } = getBisectorAndP2(player1ArmExtPxForOverlay);
      ctx.lineTo(bisectorEndPx.x, bisectorEndPx.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // --- DEBUG: Show mapping for landscape mode ---
    if (courtOrientation === "landscape") {
      console.log("[DRAW] player1Px", player1Px, "player1", player1);
    }
    console.log(
      "[drawCourtAndPlayers] player1Swing:",
      swing,
      "orientation:",
      courtOrientation
    );
    drawPlayerHandle({
      ctx,
      x: player1Px.x,
      y: player1Px.y,
      color: "blue",
      handedness: player1Handedness,
      scale: pxPerMeter,
      swing,
      isPlayer1: true,
      orientation: courtOrientation,
    });
    drawPlayerHandle({
      ctx,
      x: player2Px.x,
      y: player2Px.y,
      color: "purple",
      handedness: "right",
      scale: pxPerMeter,
      swing: "forehand",
      isPlayer1: false,
      orientation: courtOrientation,
    });
    if (showAngles) {
      drawShotHandle(ctx, shot1Px.x, shot1Px.y, "red");
      drawShotHandle(ctx, shot2Px.x, shot2Px.y, "red");
    }

    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "lime";
    ctx.beginPath();
    ctx.arc(player1Px.x, player1Px.y, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player2Px.x, player2Px.y, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(shot1Px.x, shot1Px.y, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(shot2Px.x, shot2Px.y, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (!hitTestHandlesRef.current || !canvasRef.current || !anchorsRef.current)
      return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    // Pass full canvas px/py to hitTestHandles
    const hit = hitTestHandlesRef.current(px, py);
    console.log("PointerDown", { px, py, hit });
    setDragging(hit);
  }

  function handlePointerUp(e: React.PointerEvent) {
    setDragging(null);
  }

  useEffect(() => {
    // Use the same helpers as the main effect for transforms and drawing
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const anchors = setupCourtTransformsAndAnchors({
      canvasW: canvasSize.width,
      canvasH: canvasSize.height,
      BG_SIZE,
      courtOrientation,
      logicalToDisplay,
      displayToLogical,
      courtToPxRef,
      pxToCourtRef,
      hitTestHandlesRef,
    });
    drawCourtAndPlayers(ctx, anchors, bgImg);
  }, [
    player1,
    player2,
    shot1,
    shot2,
    showAngles,
    canvasSize,
    bgImg,
    bgLoaded,
    player1Handedness,
  ]);

  // --- Calculate shot/angle info (needed in return) ---
  const vDownLine = { x: shot1.x - player1.x, y: shot1.y - player1.y };
  const vCross = { x: shot2.x - player1.x, y: shot2.y - player1.y };
  const vP2 = { x: player2.x - player1.x, y: player2.y - player1.y };
  const lenDownLine = Math.hypot(vDownLine.x, vDownLine.y);
  const lenCross = Math.hypot(vCross.x, vCross.y);
  const lenP2 = Math.hypot(vP2.x, vP2.y);

  const { bisectorEndPx, optimalP2 } = getBisectorAndP2();
  const lenBisector = Math.hypot(
    optimalP2.x - player1.x,
    optimalP2.y - player1.y
  );
  // Angle between shots (in degrees)
  function getAngleDeg(
    v1: { x: number; y: number },
    v2: { x: number; y: number }
  ) {
    const dot = v1.x * v2.x + v1.y * v2.y;
    const l1 = Math.hypot(v1.x, v1.y);
    const l2 = Math.hypot(v2.x, v2.y);
    const cos = dot / (l1 * l2);
    return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
  }
  const angleDeg = getAngleDeg(vDownLine, vCross);

  // Tailwind + SCSS modules: all controls and info panel use className, not inline style
  return (
    <div className={tcStyles.pageRoot}>
      <div className={tcStyles.sidePanel}>
        <div className={tcStyles.topBar}>Tennis Angle Theory</div>
        <div className={tcStyles.topControls}>
          <div style={{ marginBottom: 12 }}>
            <label
              htmlFor="courtOrientationSelect"
              style={{ fontWeight: "bold", marginRight: 8 }}
            >
              Orientation:
            </label>
            <select
              id="courtOrientationSelect"
              value={courtOrientation}
              onChange={(e) =>
                setCourtOrientation(e.target.value as CourtOrientation)
              }
              className={tcStyles.smallSelect}
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label
              htmlFor="courtTypeSelect"
              style={{ fontWeight: "bold", marginRight: 8 }}
            >
              Court type:
            </label>
            <select
              id="courtTypeSelect"
              value={courtType}
              onChange={(e) => setCourtType(e.target.value as CourtType)}
              className={tcStyles.smallSelect}
            >
              <option value="clay">Clay</option>
              <option value="hard">Hard</option>
              <option value="grass">Grass</option>
            </select>
          </div>
          <div className={tcStyles.controlsPanel}>
            <button className="mr-2" onClick={() => setShowAngles((a) => !a)}>
              {showAngles ? "Hide angles/best shots" : "Show angles/best shots"}
            </button>
            <button
              className="mr-2"
              onClick={() => {
                setPlayer1Handedness((h) => (h === "right" ? "left" : "right"));
                setHasMovedPlayer1((v) => !v);
              }}
            >
              {player1Handedness === "right"
                ? "Switch to Left-handed"
                : "Switch to Right-handed"}
            </button>
            <button
              className="mr-2"
              onClick={() => {
                // Guess logic: is player2 on bisector?
                const bisectorResult = getBisectorAndP2();
                const dist = Math.hypot(
                  player2.x - bisectorResult.optimalP2.x,
                  player2.y - bisectorResult.optimalP2.y
                );
                if (dist < 0.5) setFeedback("You win! 🎾");
                else
                  setFeedback("You lose, try again or ask for the solution.");
              }}
            >
              Play: Guess best P2 position
            </button>
            <button className="mr-2" onClick={() => setShowAngles(true)}>
              Show solution
            </button>
            <span className={tcStyles.feedback}>{feedback}</span>
          </div>
        </div>
        <div className={tcStyles.sidebarBottom}>
          <button
            className={tcStyles.statsToggleBtn}
            onClick={() => setShowStatsPanel((v: boolean) => !v)}
            type="button"
          >
            {showStatsPanel ? "Hide stats" : "Show stats"}
          </button>
          {showStatsPanel && (
            <ShotInfoPanel
              lenDownLine={lenDownLine}
              lenCross={lenCross}
              lenBisector={lenBisector}
              lenP2={lenP2}
              angleDeg={angleDeg}
              visible={true}
              onClose={() => {}}
            />
          )}
        </div>
      </div>
      <div ref={containerRef} className={tcStyles.courtContainer}>
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
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onMouseMove={handleMouseMove}
          onDoubleClick={handlePlayer1DoubleClickCanvas}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-label="Tennis court simulation"
          title={`Player 1: ${player1Handedness} (${
            player1Swing === "auto" ? "auto" : player1Swing
          })\nDouble-click or long-press to toggle swing`}
        />
      </div>
    </div>
  );
};

export default TennisCourt;
