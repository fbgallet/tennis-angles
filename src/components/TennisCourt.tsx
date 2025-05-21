import React, { useRef, useEffect, useState } from 'react';
import ShotInfoPanel from './ShotInfoPanel'; // Used in sidebar panel

// Tennis court dimensions (in meters)
const COURT_LENGTH = 23.77;
const COURT_WIDTH = 10.97;
const SINGLES_WIDTH = 8.23;
const NET_Y = COURT_LENGTH / 2; // Net Y position (middle of the court)

// Responsive canvas: scale to parent/container
function getScale(width: number, height: number, BG_SIZE: { width: number; length: number }) {
  return Math.min(width / BG_SIZE.width, height / BG_SIZE.length);
}

// Convert meters to canvas px (with scale and offset for extra space)
// Pixel-perfect mapping using provided background pixel coordinates
// Anchor points are now dynamic and defined in useEffect based on offsetX, offsetY, drawWidth, drawHeight.
// Singles sideline anchors (ITF standard, meters from left edge)
const leftSinglesX = 0.914;
const rightSinglesX = 8.229;
const singlesCenterX = (leftSinglesX + rightSinglesX) / 2;

// Default position for Player 1 (top side, center)
// These helpers must use BG_SIZE for landscape, not COURT_WIDTH
function getDefaultPlayer1(orientation: CourtOrientation, BG_SIZE = { width: 13.0, length: 28.0 }) {
  return orientation === 'portrait'
    ? { x: singlesCenterX, y: 0 }
    : { x: 0, y: singlesCenterX };
}
function getDefaultPlayer2(orientation: CourtOrientation, BG_SIZE = { width: 13.0, length: 28.0 }) {
  return orientation === 'portrait'
    ? { x: COURT_WIDTH / 2, y: COURT_LENGTH }
    : { x: BG_SIZE.length, y: singlesCenterX };
}
function getDefaultShot1(orientation: CourtOrientation, BG_SIZE = { width: 13.0, length: 28.0 }) {
  return orientation === 'portrait'
    ? { x: leftSinglesX, y: COURT_LENGTH }
    : { x: BG_SIZE.length, y: leftSinglesX };
}
function getDefaultShot2(orientation: CourtOrientation, BG_SIZE = { width: 13.0, length: 28.0 }) {
  return orientation === 'portrait'
    ? { x: rightSinglesX, y: COURT_LENGTH }
    : { x: BG_SIZE.length, y: rightSinglesX };
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

// Hit detection radius in px
const HANDLE_RADIUS = 18;
const HANDLE_CLICK_RADIUS = 32; // Larger clickable zone for double-click/long-press

type DragTarget = 'player1' | 'player2' | 'shot1' | 'shot2' | null;

import tcStyles from './TennisCourt.module.scss';

// Arm/racket drawing constants
const ARM_RACKET_LENGTH = 1.105; // meters (approximate: arm+racquet, 30% longer)
const CONTACT_POINT_RATIO = 0.97; // Contact point is 97% of the arm+racquet length

type CourtOrientation = 'portrait' | 'landscape';

const COURT_BG_IMAGES: Record<string, Record<CourtOrientation, string>> = {
  clay: {
    portrait: '/court-bg-portrait-clay.png',
    landscape: '/court-bg-landscape-clay.png',
  },
  hard: {
    portrait: '/court-bg-portrait-hard.png',
    landscape: '/court-bg-landscape-hard.png',
  },
  grass: {
    portrait: '/court-bg-portrait-grass.png',
    landscape: '/court-bg-landscape-grass.png',
  },
};

type CourtType = 'clay' | 'hard' | 'grass';

const TennisCourt: React.FC = () => {
  // --- Refs for coordinate transforms and hit testing ---
  const pxToCourtRef = useRef<any>(null);
  const courtToPxRef = useRef<any>(null);
  const hitTestHandlesRef = useRef<any>(null);

  // --- State ---
  const [showStatsPanel, setShowStatsPanel] = useState(true);
  const [showAngles, setShowAngles] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [player1, setPlayer1] = useState(() => getDefaultPlayer1('portrait'));
  const [player2, setPlayer2] = useState(() => getDefaultPlayer2('portrait'));
  const [shot1, setShot1] = useState(() => getDefaultShot1('portrait'));
  const [shot2, setShot2] = useState(() => getDefaultShot2('portrait'));
  const [hasMovedPlayer1, setHasMovedPlayer1] = useState(false);
  const [player1Handedness, setPlayer1Handedness] = useState<'right' | 'left'>('right');
  const [player1Swing, setPlayer1Swing] = useState<'auto'|'forehand'|'backhand'>('auto');
  const [dragging, setDragging] = useState<DragTarget>(null);
  const [courtOrientation, setCourtOrientation] = useState<CourtOrientation>('portrait');

  // --- Refs (if needed) ---
  // Only declare refs for canvas or container if actually used in hooks/effects
  const BG_SIZE = courtOrientation === 'portrait'
    ? { width: 13.0, length: 28.0 }
    : { width: 28.0, length: 13.0 }; // Landscape: swap width/length


  // --- Coordinate mapping helpers ---
  // Fix: correct coordinate swap/mirror for landscape
  function logicalToDisplay({ x, y }: { x: number; y: number }) {
    if (courtOrientation === 'portrait') return { x, y };
    // landscape: swap x/y, mirror new x axis (which is length)
    return { x: y, y: BG_SIZE.length - x };
  }
  function displayToLogical({ x, y }: { x: number; y: number }) {
    if (courtOrientation === 'portrait') return { x, y };
    // reverse swap/mirror
    return { x: BG_SIZE.length - y, y: x };
  }

  // --- Remove global courtToPx and pxToCourt: these must only exist in the drawing effect with anchor scope ---
  // Helper for baseline/net Y in BG coordinates
  const BASELINE_OFFSET = (BG_SIZE.length - COURT_LENGTH) / 2;
  const BASELINE_Y_BG = BASELINE_OFFSET + COURT_LENGTH;
  const NET_Y_BG = BASELINE_OFFSET + COURT_LENGTH / 2;
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 800 });
  const [showOptimal, setShowOptimal] = useState(false);
  // Court type (background)
  const [courtType, setCourtType] = useState<CourtType>('hard');
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
      setBgLoaded(v => v + 1); // Force redraw
    };
  }, [courtType, courtOrientation]);

  // Draw a draggable player handle
  function drawPlayerHandle(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, handedness: 'left' | 'right' = 'right', scale: number = 1, swing: 'auto'|'forehand'|'backhand' = 'auto') {
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.3;
    ctx.fill();
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    // Draw arm+racquet line (45 deg front)
    ctx.save();
    // Determine swing color
    let swingColor = '#000';
    if (swing === 'forehand') swingColor = '#1e90ff'; // blue for forced forehand
    else if (swing === 'backhand') swingColor = '#f39c12'; // orange for forced backhand
    ctx.strokeStyle = swingColor;
    ctx.lineWidth = 4;
    // Angle logic
    let theta: number;
    if (handedness === 'right') {
      // backhand=+30°, forehand=+150°
      theta = swing === 'backhand' ? (Math.PI/6) : (5*Math.PI/6);
    } else {
      // backhand=+150°, forehand=+30°
      theta = swing === 'backhand' ? (5*Math.PI/6) : (Math.PI/6);
    }
    const armPx = ARM_RACKET_LENGTH * scale;
    // Contact point slightly inside the tip
    const contactPx = armPx * CONTACT_POINT_RATIO;
    const endX = x + armPx * Math.cos(theta);
    const endY = y + armPx * Math.sin(theta);
    const contactX = x + contactPx * Math.cos(theta);
    const contactY = y + contactPx * Math.sin(theta);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    // Draw contact point as a small filled circle
    ctx.restore();
  }

  // Draw a shot endpoint handle (circle only)
  function drawShotHandle(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
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
  function getBisectorAndP2(originPx?: {x:number,y:number}) {
    // Use true angle bisector in meters (not pixels)
    // Use arm+racquet contact point as origin
    const armExt = (() => {
      // If originPx is provided, convert to court coords
      if (originPx && pxToCourtRef.current) {
        return pxToCourtRef.current({ px: originPx.x, py: originPx.y });
      }
      // Otherwise use player1 + arm (30° forward for right-handed, 150° for left-handed)
      const theta = player1Handedness === 'right' ? (Math.PI/6) : (5*Math.PI/6);
      return {
        x: player1.x + ARM_RACKET_LENGTH * CONTACT_POINT_RATIO * Math.cos(theta),
        y: player1.y + ARM_RACKET_LENGTH * CONTACT_POINT_RATIO * Math.sin(theta)
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
      y: COURT_LENGTH
    };
    // Optimal P2 position: just behind baseline, at intersection
    const optimalP2 = {
      x: bisectorEnd.x,
      y: COURT_LENGTH
    };
    // If you want the pixel version for drawing:
    const courtToPx = courtToPxRef.current || (() => ({x:0,y:0}));
    return {
      bisectorEndPx: courtToPx({ x: bisectorEnd.x, y: bisectorEnd.y }),
      optimalP2Px: courtToPx({ x: optimalP2.x, y: optimalP2.y }),
      optimalP2
    };
  }

  // --- Player1 handle double-click for swing toggle ---
  // Dummy state to force redraw after swing change
  const [_, forceUpdate] = useState(0);

  function handlePlayer1DoubleClickCanvas(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!canvasRef.current || !hitTestHandlesRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    // Use orientation-aware hit test
    const hit = hitTestHandlesRef.current(px, py);
    if (hit === 'player1') {
      setPlayer1Swing(s => {
        const next = s === 'auto' ? 'forehand' : s === 'forehand' ? 'backhand' : 'auto';
        return next;
      });
      // Force immediate redraw for instant feedback
      setHasMovedPlayer1(v => !v);
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
    if (hit === 'player1') {
      longPressTimer = window.setTimeout(() => {
        setPlayer1Swing(s => {
          const next = s === 'auto' ? 'forehand' : s === 'forehand' ? 'backhand' : 'auto';
          forceUpdate(v => v + 1);
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
    // Calculate contact point (end of arm+racquet)
    const theta = player1Handedness === 'right' ? (3*Math.PI/4) : (Math.PI/4);
    const contact = {
      x: player1.x + ARM_RACKET_LENGTH * Math.cos(theta),
      y: player1.y + ARM_RACKET_LENGTH * Math.sin(theta)
    };
    // Down-the-line: intersection of opponent's baseline and the sideline on contact point's side
    const isLeft = contact.x < singlesCenterX;
    const downLineX = isLeft ? leftSinglesX : rightSinglesX;
    const downLine = {
      x: downLineX,
      y: COURT_LENGTH
    };
    // Cross-court: intersection of opponent's baseline and the opposite singles sideline
    const crossX = isLeft ? rightSinglesX : leftSinglesX;
    // Lateral factor based on contact point
    const sidelineDist = Math.abs(contact.x - singlesCenterX);
    const maxSidelineDist = SINGLES_WIDTH / 2;
    const lateralFactor = Math.min(1, sidelineDist / maxSidelineDist);
    // Smoother, realistic progression for cross-court endpoint
    // Use smoothstep interpolation between baseline and minY (2m past net)
    const NET_Y = COURT_LENGTH / 2;
    const BASELINE_Y = COURT_LENGTH;
    let minY = NET_Y + 2;
    // If contact moves forward, allow endpoint to move closer to net (never before net)
    if (contact.y > 0) {
      const forward = Math.min(1, contact.y / (NET_Y - 0.2));
      minY = minY - (minY - (NET_Y + 0.2)) * forward;
    }
    function smoothstep(edge0: number, edge1: number, x: number) {
      const tSmooth = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
      return tSmooth * tSmooth * (3 - 2 * tSmooth);
    }
    const s = smoothstep(0, 1, lateralFactor);
    let crossY = BASELINE_Y * (1 - s) + minY * s;
    crossY = Math.max(NET_Y, Math.min(crossY, BASELINE_Y));
    const cross = {
      x: crossX,
      y: crossY
    };
    // Bisector: midpoint between downLine and cross
    const bisector = {
      x: (downLine.x + cross.x) / 2,
      y: COURT_LENGTH
    };
    setShot1(downLine);
    setShot2(cross);
  }, [player1.x, player1.y, hasMovedPlayer1]);

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
        if (courtOrientation === 'portrait') {
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
          if ((containerH / containerW) > (1 / aspect)) {
            width = containerW;
            height = Math.round(width / aspect);
          } else {
            height = containerH;
            width = Math.round(height * aspect);
          }
        }
        console.log('containerW', containerW, 'containerH', containerH, 'canvas width', width, 'canvas height', height, 'aspect', aspect, 'orientation', courtOrientation);

        setCanvasSize({ width, height });
      }
    }
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
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
    const BG_ORIG_WIDTH = courtOrientation === 'portrait' ? 500 : 1000;
    const BG_ORIG_HEIGHT = courtOrientation === 'portrait' ? 1000 : 500;
    let drawWidth = canvasW;
    let drawHeight = canvasH;
    let offsetX = 0;
    let offsetY = 0;
    const scaleX = drawWidth / BG_ORIG_WIDTH;
    const scaleY = drawHeight / BG_ORIG_HEIGHT;
    const pxTopLeft = { x: offsetX + 134 * scaleX, y: offsetY + 161 * scaleY };
    const pxTopRight = { x: offsetX + 367 * scaleX, y: offsetY + 161 * scaleY };
    const pxBotLeft = { x: offsetX + 134 * scaleX, y: offsetY + 843 * scaleY };
    const pxBotRight = { x: offsetX + 367 * scaleX, y: offsetY + 843 * scaleY };
    const leftSinglesX = 0.914;
    const rightSinglesX = 8.229;
    const topY = 0;
    const botY = 23.77;
    function courtToPx(logical: { x: number; y: number }) {
      const { x, y } = logicalToDisplay(logical);
      const t = (x - leftSinglesX) / (rightSinglesX - leftSinglesX);
      const s = (y - topY) / (botY - topY);
      const topX = pxTopLeft.x + t * (pxTopRight.x - pxTopLeft.x);
      const botX = pxBotLeft.x + t * (pxBotRight.x - pxBotLeft.x);
      const xPx = topX + s * (botX - topX);
      const yPx = pxTopLeft.y + s * (pxBotLeft.y - pxTopLeft.y);
      return { x: xPx, y: yPx };
    }
    function pxToCourt({ px, py }: { px: number; py: number }) {
      const s = (py - pxTopLeft.y) / (pxBotLeft.y - pxTopLeft.y);
      const leftX = pxTopLeft.x + s * (pxBotLeft.x - pxTopLeft.x);
      const rightX = pxTopRight.x + s * (pxBotRight.x - pxTopRight.x);
      const t = (px - leftX) / (rightX - leftX);
      const x = leftSinglesX + t * (rightSinglesX - leftSinglesX);
      const y = topY + s * (botY - topY);
      return displayToLogical({ x, y });
    }
    function dist(x1: number, y1: number, x2: number, y2: number) {
      return Math.hypot(x1 - x2, y1 - y2);
    }
    function hitTestHandles(px: number, py: number, radiusOverride?: number): DragTarget {
      const r = radiusOverride ?? HANDLE_RADIUS;
      const player1Px = courtToPx({ x: player1.x, y: player1.y });
      const player2Px = courtToPx({ x: player2.x, y: player2.y });
      const shot1Px = courtToPx({ x: shot1.x, y: shot1.y });
      const shot2Px = courtToPx({ x: shot2.x, y: shot2.y });
      // Log all positions and mouse
      if (window && (window as any).DEBUG_HITTEST) {
        console.log('hitTestHandles', {
          px, py,
          player1Px, player2Px, shot1Px, shot2Px,
          offsetX: anchorsRef.current?.offsetX,
          offsetY: anchorsRef.current?.offsetY,
          drawWidth: anchorsRef.current?.drawWidth,
          drawHeight: anchorsRef.current?.drawHeight,
          r,
        });
      }
      if (dist(px, py, player1Px.x, player1Px.y) < r) return 'player1';
      if (dist(px, py, player2Px.x, player2Px.y) < r) return 'player2';
      if (dist(px, py, shot1Px.x, shot1Px.y) < r) return 'shot1';
      if (dist(px, py, shot2Px.x, shot2Px.y) < r) return 'shot2';
      return null;
    }
    courtToPxRef.current = courtToPx;
    pxToCourtRef.current = pxToCourt;
    hitTestHandlesRef.current = hitTestHandles;
    // Store latest anchors in ref for dragging
    anchorsRef.current = {
      pxTopLeft, pxTopRight, pxBotLeft, pxBotRight,
      drawWidth, drawHeight, offsetX, offsetY,
      courtToPx, pxToCourt
    };
    // === ANCHOR DEBUG LOG ===
    console.log('Anchor debug', {
      pxTopLeft, pxTopRight, pxBotLeft, pxBotRight,
      leftSinglesX, rightSinglesX, topY, botY,
      BG_SIZE,
      drawWidth, drawHeight, offsetX, offsetY,
      orientation: courtOrientation
    });
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
    console.log('Canvas debug', {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      cssWidth: rect.width,
      cssHeight: rect.height,
      scaleX, scaleY
    });
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    if (!anchorsRef.current || !anchorsRef.current.pxToCourt) return;
    // Subtract offsetX/offsetY to get px/py relative to drawn court
    const pxInCourt = px - anchorsRef.current.offsetX;
    const pyInCourt = py - anchorsRef.current.offsetY;
    const { x: courtX, y: courtY } = anchorsRef.current.pxToCourt({ px: pxInCourt, py: pyInCourt });
    if (dragging) {
      console.log('PointerMove', { dragging, px, py, pxInCourt, pyInCourt, courtX, courtY });
    }
    if (dragging === 'player1') {
      setPlayer1({ x: courtX, y: Math.min(courtY, NET_Y) });
      setHasMovedPlayer1(true);
    }
    else if (dragging === 'player2') setPlayer2({ x: courtX, y: Math.max(courtY, NET_Y) });
    else if (dragging === 'shot1') {
      setShot1({ x: courtX, y: courtY });
    }
    else if (dragging === 'shot2') {
      setShot2({ x: courtX, y: courtY });
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
    const hit = hitTestHandlesRef.current ? hitTestHandlesRef.current(px, py) : null;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = hit ? 'pointer' : 'default';
    }
  }

  // --- Draw court and players ---
  function drawCourtAndPlayers(ctx: CanvasRenderingContext2D, anchors: any, bgImg: any) {
    const {
      drawWidth, drawHeight, offsetX, offsetY, courtToPx
    } = anchors;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (bgImg) {
      ctx.drawImage(bgImg, offsetX, offsetY, drawWidth, drawHeight);
    }
    const player1Px = courtToPx({ x: player1.x, y: player1.y });
    let swing: 'forehand'|'backhand';
    if (player1Swing === 'auto') {
      const rel = (player1.x - 0.914) / (8.229 - 0.914);
      swing = player1Handedness === 'right'
        ? (rel < 2/3 ? 'forehand' : 'backhand')
        : (rel > 1/3 ? 'forehand' : 'backhand');
    } else {
      swing = player1Swing;
    }
    let theta: number;
    if (player1Handedness === 'right') {
      theta = swing === 'backhand' ? (Math.PI/4) : (3*Math.PI/4);
    } else {
      theta = swing === 'backhand' ? (3*Math.PI/4) : (Math.PI/4);
    }
    const player1ArmExt = {
      x: player1.x + ARM_RACKET_LENGTH * Math.cos(theta),
      y: player1.y + ARM_RACKET_LENGTH * Math.sin(theta)
    };
    const player1ArmExtPx = courtToPx(player1ArmExt);
    const player2Px = courtToPx({ x: player2.x, y: player2.y });
    const shot1Px = courtToPx({ x: shot1.x, y: shot1.y });
    const shot2Px = courtToPx({ x: shot2.x, y: shot2.y });
    const pxPerMeter = Math.sqrt(
      (courtToPx({ x: player1.x + 1, y: player1.y }).x - player1Px.x) ** 2 +
      (courtToPx({ x: player1.x, y: player1.y + 1 }).y - player1Px.y) ** 2
    );
    if (showAngles) {
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(player1ArmExtPx.x, player1ArmExtPx.y);
      ctx.lineTo(shot1Px.x, shot1Px.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(player1ArmExtPx.x, player1ArmExtPx.y);
      ctx.lineTo(shot2Px.x, shot2Px.y);
      ctx.stroke();
      ctx.strokeStyle = 'orange';
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(player1ArmExtPx.x, player1ArmExtPx.y);
      const { bisectorEndPx } = getBisectorAndP2(player1ArmExtPx);
      ctx.lineTo(bisectorEndPx.x, bisectorEndPx.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    let resolvedSwing: 'forehand'|'backhand';
    if (player1Swing === 'auto') {
      const rel = (player1.x - 0.914) / (8.229 - 0.914);
      resolvedSwing = player1Handedness === 'right'
        ? (rel < 2/3 ? 'forehand' : 'backhand')
        : (rel > 1/3 ? 'forehand' : 'backhand');
    } else {
      resolvedSwing = player1Swing;
    }
    drawPlayerHandle(ctx, player1Px.x, player1Px.y, 'blue', player1Handedness, pxPerMeter, resolvedSwing);
    drawPlayerHandle(ctx, player2Px.x, player2Px.y, 'purple');
    if (showAngles) {
      drawShotHandle(ctx, shot1Px.x, shot1Px.y, 'red');
      drawShotHandle(ctx, shot2Px.x, shot2Px.y, 'red');
    }

    // === DEBUG: Draw hit test centers ===
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = 'lime';
    // Player 1
    ctx.beginPath(); ctx.arc(player1Px.x, player1Px.y, 4, 0, 2 * Math.PI); ctx.fill();
    // Player 2
    ctx.beginPath(); ctx.arc(player2Px.x, player2Px.y, 4, 0, 2 * Math.PI); ctx.fill();
    // Shot 1
    ctx.beginPath(); ctx.arc(shot1Px.x, shot1Px.y, 4, 0, 2 * Math.PI); ctx.fill();
    // Shot 2
    ctx.beginPath(); ctx.arc(shot2Px.x, shot2Px.y, 4, 0, 2 * Math.PI); ctx.fill();
    ctx.restore();
    // === END DEBUG ===
  }

  // --- Pointer event handlers ---
  function handlePointerDown(e: React.PointerEvent) {
    if (!hitTestHandlesRef.current || !canvasRef.current || !anchorsRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    // Pass full canvas px/py to hitTestHandles
    const hit = hitTestHandlesRef.current(px, py);
    console.log('PointerDown', { px, py, hit });
    setDragging(hit);
  }

  function handlePointerUp(e: React.PointerEvent) {
    setDragging(null);
  }

  useEffect(() => {
    // Use the same helpers as the main effect for transforms and drawing
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
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
  }, [player1, player2, shot1, shot2, showAngles, canvasSize, bgImg, bgLoaded, player1Handedness]);

  // --- Calculate shot/angle info (needed in return) ---
  const vDownLine = { x: shot1.x - player1.x, y: shot1.y - player1.y };
  const vCross = { x: shot2.x - player1.x, y: shot2.y - player1.y };
  const vP2 = { x: player2.x - player1.x, y: player2.y - player1.y };
  const lenDownLine = Math.hypot(vDownLine.x, vDownLine.y);
  const lenCross = Math.hypot(vCross.x, vCross.y);
  const lenP2 = Math.hypot(vP2.x, vP2.y);

  const { bisectorEndPx, optimalP2 } = getBisectorAndP2();
  const lenBisector = Math.hypot(optimalP2.x - player1.x, optimalP2.y - player1.y);
  // Angle between shots (in degrees)
  function getAngleDeg(v1: {x:number,y:number}, v2: {x:number,y:number}) {
    const dot = v1.x * v2.x + v1.y * v2.y;
    const l1 = Math.hypot(v1.x, v1.y);
    const l2 = Math.hypot(v2.x, v2.y);
    const cos = dot / (l1 * l2);
    return Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI;
  }
  const angleDeg = getAngleDeg(vDownLine, vCross);

  // Tailwind + SCSS modules: all controls and info panel use className, not inline style
  return (
    <div className={tcStyles.pageRoot}>
      <div className={tcStyles.sidePanel}>
        <div className={tcStyles.topBar}>Tennis Angle Theory</div>
        <div className={tcStyles.topControls}>
          <div style={{marginBottom: 12}}>
            <label htmlFor="courtOrientationSelect" style={{fontWeight: 'bold', marginRight: 8}}>Orientation:</label>
            <select
              id="courtOrientationSelect"
              value={courtOrientation}
              onChange={e => setCourtOrientation(e.target.value as CourtOrientation)}
              className={tcStyles.smallSelect}
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
          <div style={{marginBottom: 12}}>
            <label htmlFor="courtTypeSelect" style={{fontWeight: 'bold', marginRight: 8}}>Court type:</label>
            <select
              id="courtTypeSelect"
              value={courtType}
              onChange={e => setCourtType(e.target.value as CourtType)}
              className={tcStyles.smallSelect}
            >
              <option value="clay">Clay</option>
              <option value="hard">Hard</option>
              <option value="grass">Grass</option>
            </select>
          </div>
          <div className={tcStyles.controlsPanel}>
            <button className="mr-2" onClick={() => setShowAngles(a => !a)}>
              {showAngles ? 'Hide angles/best shots' : 'Show angles/best shots'}
            </button>
            <button className="mr-2" onClick={() => { setPlayer1Handedness(h => h === 'right' ? 'left' : 'right'); setHasMovedPlayer1(v => !v); }}>
              {player1Handedness === 'right' ? 'Switch to Left-handed' : 'Switch to Right-handed'}
            </button>
            <button className="mr-2" onClick={() => {
              // Guess logic: is player2 on bisector?
              const bisectorResult = getBisectorAndP2();
              const dist = Math.hypot(player2.x - bisectorResult.optimalP2.x, player2.y - bisectorResult.optimalP2.y);
              if (dist < 0.5) setFeedback('You win! 🎾');
              else setFeedback('You lose, try again or ask for the solution.');
            }}>
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
            {showStatsPanel ? 'Hide stats' : 'Show stats'}
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
            (courtOrientation === 'portrait'
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
          title={`Player 1: ${player1Handedness} (${player1Swing === 'auto' ? 'auto' : player1Swing})\nDouble-click or long-press to toggle swing`}
        />
      </div>
      {/* <div className={tcStyles.bottomControls}>Future bottom controls here</div> */}
    </div>
  );
  
};

export default TennisCourt;
