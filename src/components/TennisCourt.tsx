import React, { useRef, useEffect, useState } from 'react';
import ShotInfoPanel from './ShotInfoPanel';

// Tennis court dimensions (in meters)
const COURT_LENGTH = 23.77;
const COURT_WIDTH = 10.97;
const SINGLES_WIDTH = 8.23;
const NET_HEIGHT = 0.914;
// Net Y position (middle of the court)
const NET_Y = COURT_LENGTH / 2;

// Background image (court-bg.png) dimensions in meters (including extra space)
const BG_LENGTH = 28.0; // estimate: 2m extra behind each baseline, 0.5m each side
const BG_WIDTH = 13.0;

// Responsive canvas: scale to parent/container
function getScale(width: number, height: number) {
  return Math.min(width / BG_WIDTH, height / BG_LENGTH);
}

// Convert meters to canvas px (with scale and offset for extra space)
// Pixel-perfect mapping using provided background pixel coordinates
// Anchor points are now dynamic and defined in useEffect based on offsetX, offsetY, drawWidth, drawHeight.
const COURT_X_LEFT = (COURT_WIDTH - SINGLES_WIDTH) / 2;
const COURT_X_RIGHT = COURT_WIDTH - (COURT_WIDTH - SINGLES_WIDTH) / 2;
const COURT_Y_TOP = 0;
const COURT_Y_BOTTOM = COURT_LENGTH;

// --- Precise affine mapping for singles court ---
// courtToPx and pxToCourt will be defined inside the useEffect drawing effect, using dynamic anchors.
// courtToPx and pxToCourt will be defined inside the useEffect drawing effect, using dynamic anchors.


// Singles sideline anchors (ITF standard, meters from left edge)
const leftSinglesX = 0.914;
const rightSinglesX = 8.229;
const singlesCenterX = (leftSinglesX + rightSinglesX) / 2;

// Default position for Player 1 (top side, center)
const DEFAULT_PLAYER1 = {
  x: singlesCenterX, // center of singles baseline
  y: 0, // on the baseline
};
const BASELINE_OFFSET = (BG_LENGTH - COURT_LENGTH) / 2;
const BASELINE_Y_BG = BASELINE_OFFSET + COURT_LENGTH;
const NET_Y_BG = BASELINE_OFFSET + COURT_LENGTH / 2;

const DEFAULT_PLAYER2 = {
  x: COURT_WIDTH / 2,
  y: COURT_LENGTH, // singles baseline
};

const DEFAULT_SHOT1 = { x: leftSinglesX, y: COURT_LENGTH }; // left singles sideline, opponent baseline
const DEFAULT_SHOT2 = { x: rightSinglesX, y: COURT_LENGTH }; // right singles sideline, opponent baseline

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

// --- Patch hitTestHandles to use larger click radius for player1 ---
// (If not already using, update the hitTestHandles implementation to accept a radius argument)


// Hit detection radius in px
const HANDLE_RADIUS = 18;
const HANDLE_CLICK_RADIUS = 32; // Larger clickable zone for double-click/long-press

type DragTarget = 'player1' | 'player2' | 'shot1' | 'shot2' | null;

import tcStyles from './TennisCourt.module.scss';

const ARM_RACKET_LENGTH = 0.85; // meters (approximate: arm+racquet)

const TennisCourt: React.FC = () => {
  // State for toggling the info panel
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  // Gamification states
  const [showAngles, setShowAngles] = useState(false);
  const [feedback, setFeedback] = useState('');
  // State and refs (declare ONCE)
  const [player1, setPlayer1] = useState(DEFAULT_PLAYER1);
  const [player2, setPlayer2] = useState(DEFAULT_PLAYER2);
  const [shot1, setShot1] = useState(DEFAULT_SHOT1);
  const [shot2, setShot2] = useState(DEFAULT_SHOT2);
  const [hasMovedPlayer1, setHasMovedPlayer1] = useState(false);
  const [player1Handedness, setPlayer1Handedness] = useState<'right' | 'left'>('right');
  // Swing: 'auto' (default), 'forehand', 'backhand'
  const [player1Swing, setPlayer1Swing] = useState<'auto'|'forehand'|'backhand'>('auto');
  const [dragging, setDragging] = useState<DragTarget>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 800 });
  const [showOptimal, setShowOptimal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    let swingColor = '#222';
    if (swing === 'forehand') swingColor = '#1e90ff'; // blue for forehand
    if (swing === 'backhand') swingColor = '#f39c12'; // orange for backhand
    ctx.strokeStyle = swingColor;
    ctx.lineWidth = 4;
    // Angle logic
    let theta: number;
    if (handedness === 'right') {
      theta = swing === 'backhand' ? (Math.PI/4) : (3*Math.PI/4); // backhand=+45°, forehand=+135°
    } else {
      theta = swing === 'backhand' ? (3*Math.PI/4) : (Math.PI/4); // backhand=+135°, forehand=+45°
    }
    const armPx = ARM_RACKET_LENGTH * scale;
    const endX = x + armPx * Math.cos(theta);
    const endY = y + armPx * Math.sin(theta);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    // Draw small F/B label just above the arm, not at the tip
    ctx.save();
    ctx.font = `${10 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = swingColor;
    if (swing === 'forehand' || swing === 'backhand') {
      // Position at 60% of arm length, slightly above the line
      const labelDist = armPx * 0.6;
      const labelX = x + labelDist * Math.cos(theta);
      const labelY = y + labelDist * Math.sin(theta) - 4 * scale;
      ctx.fillText(swing === 'forehand' ? 'F' : 'B', labelX, labelY);
    }
    ctx.restore();
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
    // Use arm+racquet extremity as origin
    const armExt = (() => {
      // If originPx is provided, convert to court coords
      if (originPx && pxToCourtRef.current) {
        return pxToCourtRef.current({ px: originPx.x, py: originPx.y });
      }
      // Otherwise use player1 + arm (45° forward)
      const theta = player1Handedness === 'right' ? (3*Math.PI/4) : (Math.PI/4);
      return {
        x: player1.x + ARM_RACKET_LENGTH * Math.cos(theta),
        y: player1.y + ARM_RACKET_LENGTH * Math.sin(theta)
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
    const hit = hitTestHandlesRef.current(px, py, HANDLE_CLICK_RADIUS);
    if (hit === 'player1') {
      setPlayer1Swing(s => {
        const next = s === 'auto' ? 'forehand' : s === 'forehand' ? 'backhand' : 'auto';
        forceUpdate(v => v + 1); // Force redraw for immediate feedback
        return next;
      });
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
    const hit = hitTestHandlesRef.current(px, py, HANDLE_CLICK_RADIUS);
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
    function handleResize() {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const aspect = BG_WIDTH / BG_LENGTH;
      let width = clientWidth;
      let height = clientHeight;
      if (clientWidth / clientHeight > aspect) {
        // Too wide: letterbox left/right
        width = clientHeight * aspect;
        height = clientHeight;
      } else {
        // Too tall: letterbox top/bottom
        width = clientWidth;
        height = clientWidth / aspect;
      }
      setCanvasSize({ width, height });
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main effect: handles mapping, refs, and drawing using anchor-based mapping
  useEffect(() => {
    // --- Canvas sizing ---
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const canvasW = canvasSize.width;
    const canvasH = canvasSize.height;
    // These should match your background image and scaling logic
    const BG_ORIG_WIDTH = 500; // px, actual image width
    const BG_ORIG_HEIGHT = 1000; // px, actual image height
    // Compute draw size/aspect
    const BG_WIDTH = 13.0;
    const BG_LENGTH = 28.0;
    let drawWidth = canvasW;
    let drawHeight = canvasH;
    let offsetX = 0;
    let offsetY = 0;
    if (canvasW / canvasH > BG_WIDTH / BG_LENGTH) {
      drawHeight = canvasH;
      drawWidth = BG_WIDTH / BG_LENGTH * drawHeight;
      offsetX = (canvasW - drawWidth) / 2;
    } else {
      drawWidth = canvasW;
      drawHeight = BG_LENGTH / BG_WIDTH * drawWidth;
      offsetY = (canvasH - drawHeight) / 2;
    }
    // Anchor-based mapping only:
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
    function courtToPx({ x, y }: { x: number; y: number }) {
      const t = (x - leftSinglesX) / (rightSinglesX - leftSinglesX);
      const s = y / (botY - topY);
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
      const y = s * (botY - topY);
      return { x, y };
    }
    function dist(x1: number, y1: number, x2: number, y2: number) {
      return Math.hypot(x1 - x2, y1 - y2);
    }
    function hitTestHandles(px: number, py: number): DragTarget {
      const player1Px = courtToPx({ x: player1.x, y: player1.y });
      if (dist(px, py, player1Px.x, player1Px.y) < HANDLE_RADIUS) return 'player1';
      const player2Px = courtToPx({ x: player2.x, y: player2.y });
      if (dist(px, py, player2Px.x, player2Px.y) < HANDLE_RADIUS) return 'player2';
      const shot1Px = courtToPx({ x: shot1.x, y: shot1.y });
      if (dist(px, py, shot1Px.x, shot1Px.y) < HANDLE_RADIUS) return 'shot1';
      const shot2Px = courtToPx({ x: shot2.x, y: shot2.y });
      if (dist(px, py, shot2Px.x, shot2Px.y) < HANDLE_RADIUS) return 'shot2';
      return null;
    }
    // Assign to refs
    courtToPxRef.current = courtToPx;
    pxToCourtRef.current = pxToCourt;
    hitTestHandlesRef.current = hitTestHandles;
    // --- Drawing ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bg = new window.Image();
    bg.src = '/court-bg.png';
    const player1Px = courtToPx({ x: player1.x, y: player1.y });
    // Determine swing for contact point
    let swing: 'forehand'|'backhand';
    // Auto-mode: righty = forehand for right 2/3, backhand for left 1/3; lefty is opposite
    if (player1Swing === 'auto') {
      const rel = (player1.x - leftSinglesX) / (rightSinglesX - leftSinglesX); // 0=left, 1=right
      if (player1Handedness === 'right') {
        swing = rel < 2/3 ? 'forehand' : 'backhand';
      } else {
        swing = rel > 1/3 ? 'forehand' : 'backhand';
      }
    } else {
      swing = player1Swing;
    }
    // Arm+racquet extremity in meters and px
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
    const drawAll = () => {
      ctx.drawImage(bg, offsetX, offsetY, drawWidth, drawHeight);
      // Calculate px/meter scale for arm drawing
      const pxPerMeter = Math.sqrt((courtToPx({ x: player1.x + 1, y: player1.y }).x - player1Px.x) ** 2 + (courtToPx({ x: player1.x, y: player1.y + 1 }).y - player1Px.y) ** 2);
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
      // Always use resolved swing for drawing player1 arm (so auto mode is visually correct)
  let resolvedSwing: 'forehand'|'backhand';
  if (player1Swing === 'auto') {
    const rel = (player1.x - leftSinglesX) / (rightSinglesX - leftSinglesX);
    if (player1Handedness === 'right') {
      resolvedSwing = rel < 2/3 ? 'forehand' : 'backhand';
    } else {
      resolvedSwing = rel > 1/3 ? 'forehand' : 'backhand';
    }
  } else {
    resolvedSwing = player1Swing;
  }
  drawPlayerHandle(ctx, player1Px.x, player1Px.y, 'blue', player1Handedness, pxPerMeter, resolvedSwing);
      drawPlayerHandle(ctx, player2Px.x, player2Px.y, 'purple');
      drawShotHandle(ctx, shot1Px.x, shot1Px.y, 'red');
      drawShotHandle(ctx, shot2Px.x, shot2Px.y, 'red');
    };
    if (bg.complete) {
      drawAll();
    } else {
      bg.onload = drawAll;
    }
  }, [player1, player2, shot1, shot2, showAngles, canvasSize]);


  const hitTestHandlesRef = useRef<((px: number, py: number) => DragTarget) | null>(null);
  const courtToPxRef = useRef<(({ x, y }: { x: number; y: number }) => { x: number; y: number }) | null>(null);
  const pxToCourtRef = useRef<(({ px, py }: { px: number; py: number }) => { x: number; y: number }) | null>(null);

  function handlePointerDown(e: React.PointerEvent) {
    if (!hitTestHandlesRef.current) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const hit = hitTestHandlesRef.current(px, py);
    setDragging(hit);
  }

  function handlePointerUp(e: React.PointerEvent) {
    setDragging(null);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    if (!pxToCourtRef.current) return;
    const { x: courtX, y: courtY } = pxToCourtRef.current({ px, py });
    if (dragging === 'player1') {
      setPlayer1({ x: courtX, y: Math.min(courtY, NET_Y) });
      setHasMovedPlayer1(true);
    }
    else if (dragging === 'player2') setPlayer2({ x: courtX, y: Math.max(courtY, NET_Y) });
    else if (dragging === 'shot1') setShot1({ x: courtX, y: courtY });
    else if (dragging === 'shot2') setShot2({ x: courtX, y: courtY });
  }

  // Cursor feedback for draggable handles
  function handleMouseMove(e: React.MouseEvent) {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const hit = hitTestHandlesRef.current ? hitTestHandlesRef.current(px, py) : null;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = hit ? 'pointer' : 'default';
    }
  }

  useEffect(() => {
    const { width: canvasW, height: canvasH } = canvasSize;
    // These should match your background image and scaling logic
    const BG_WIDTH = 10.97;
    const BG_LENGTH = 23.77;
    let drawWidth = canvasW;
    let drawHeight = canvasH;
    let offsetX = 0;
    let offsetY = 0;
    if (canvasW / canvasH > BG_WIDTH / BG_LENGTH) {
      // canvas is wider than court aspect
      drawHeight = canvasH;
      drawWidth = BG_WIDTH / BG_LENGTH * drawHeight;
      offsetX = (canvasW - drawWidth) / 2;
    } else {
      // canvas is taller than court aspect
      drawWidth = canvasW;
      drawHeight = BG_LENGTH / BG_WIDTH * drawWidth;
      offsetY = (canvasH - drawHeight) / 2;
    }
    function dist(x1: number, y1: number, x2: number, y2: number) {
      return Math.hypot(x1 - x2, y1 - y2);
    }
    // --- SCALED PIXEL ANCHORS FOR CURRENT CANVAS SIZE ---
    // Original image size (replace with your actual image size in pixels)
    const BG_ORIG_WIDTH = 500; // set to your actual image width in px
    const BG_ORIG_HEIGHT = 1000; // set to your actual image height in px
    // Compute scale factors for current draw size
    const scaleX = drawWidth / BG_ORIG_WIDTH;
    const scaleY = drawHeight / BG_ORIG_HEIGHT;
    // Scale and offset the anchors
    const pxTopLeft = { x: offsetX + 134 * scaleX, y: offsetY + 161 * scaleY };
    const pxTopRight = { x: offsetX + 367 * scaleX, y: offsetY + 161 * scaleY };
    const pxBotLeft = { x: offsetX + 134 * scaleX, y: offsetY + 843 * scaleY };
    const pxBotRight = { x: offsetX + 367 * scaleX, y: offsetY + 843 * scaleY };
    // Court coordinates for those anchors
    const leftSinglesX = 0.914;
    const rightSinglesX = 8.229;
    const topY = 0;
    const botY = 23.77;
    function courtToPx({ x, y }: { x: number; y: number }) {
      // Bilinear interpolation between the four anchor points
      // t: 0 (left sideline), 1 (right sideline)
      // s: 0 (top baseline), 1 (bottom baseline)
      const t = (x - leftSinglesX) / (rightSinglesX - leftSinglesX);
      const s = y / (botY - topY);
      // Interpolate top and bottom edge
      const topX = pxTopLeft.x + t * (pxTopRight.x - pxTopLeft.x);
      const botX = pxBotLeft.x + t * (pxBotRight.x - pxBotLeft.x);
      const xPx = topX + s * (botX - topX);
      const yPx = pxTopLeft.y + s * (pxBotLeft.y - pxTopLeft.y);
      return { x: xPx, y: yPx };
    }
    function pxToCourt({ px, py }: { px: number; py: number }) {
      // Inverse of the above mapping
      // Estimate s (vertical position between baselines)
      const s = (py - pxTopLeft.y) / (pxBotLeft.y - pxTopLeft.y);
      // Interpolate left/right singles for this s
      const leftX = pxTopLeft.x + s * (pxBotLeft.x - pxTopLeft.x);
      const rightX = pxTopRight.x + s * (pxBotRight.x - pxTopRight.x);
      const t = (px - leftX) / (rightX - leftX);
      const x = leftSinglesX + t * (rightSinglesX - leftSinglesX);
      const y = s * (botY - topY);
      return { x, y };
    }
    function hitTestHandles(px: number, py: number, radiusOverride?: number): DragTarget {
      const r1 = radiusOverride ?? HANDLE_RADIUS;
      const player1Px = courtToPxRef.current!({ x: player1.x, y: player1.y });
      if (dist(px, py, player1Px.x, player1Px.y) < r1) return 'player1';
      const player2Px = courtToPxRef.current!({ x: player2.x, y: player2.y });
      if (dist(px, py, player2Px.x, player2Px.y) < HANDLE_RADIUS) return 'player2';
      const shot1Px = courtToPxRef.current!({ x: shot1.x, y: shot1.y });
      if (dist(px, py, shot1Px.x, shot1Px.y) < HANDLE_RADIUS) return 'shot1';
      const shot2Px = courtToPxRef.current!({ x: shot2.x, y: shot2.y });
      if (dist(px, py, shot2Px.x, shot2Px.y) < HANDLE_RADIUS) return 'shot2';
      return null;
    }
})

  // --- Calculate shot/angle info ---
  const vDownLine = { x: shot1.x - player1.x, y: shot1.y - player1.y };
  const vCross = { x: shot2.x - player1.x, y: shot2.y - player1.y };
  const vP2 = { x: player2.x - player1.x, y: player2.y - player1.y };
  const lenDownLine = Math.hypot(vDownLine.x, vDownLine.y);
  const lenCross = Math.hypot(vCross.x, vCross.y);
  const lenP2 = Math.hypot(vP2.x, vP2.y);
  // Bisector/medium shot length
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
    <div ref={containerRef} className="relative w-full max-w-[800px] mx-auto" style={{height: `calc(100vw * ${BG_LENGTH/BG_WIDTH} > 70vh ? 70vh : calc(100vw * ${BG_LENGTH/BG_WIDTH}))`, aspectRatio: `${BG_WIDTH} / ${BG_LENGTH}`}}>
      {/* Gamification controls */}
      <div className={tcStyles.controlsPanel}>
        <button className="mr-2" onClick={() => setShowAngles(a => !a)}>
          {showAngles ? 'Hide angles/best shots' : 'Show angles/best shots'}
        </button>
        <button className="mr-2" onClick={() => setPlayer1Handedness(h => h === 'right' ? 'left' : 'right')}>
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
      {/* Shot/angle info panel (right box, togglable) */}
      <button
        className={tcStyles.infoToggleBtn}
        onClick={() => setShowInfoPanel(v => !v)}
      >
        {showInfoPanel ? 'Hide info' : 'Show info'}
      </button>
      <ShotInfoPanel
        lenDownLine={lenDownLine}
        lenCross={lenCross}
        lenBisector={lenBisector}
        lenP2={lenP2}
        angleDeg={angleDeg}
        visible={showInfoPanel}
        onClose={() => setShowInfoPanel(false)}
      />
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className={tcStyles.courtCanvas}
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
  );
}

export default TennisCourt;
