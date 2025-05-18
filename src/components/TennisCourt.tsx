import React, { useRef, useEffect, useState } from 'react';

// Tennis court dimensions (in meters)
const COURT_LENGTH = 23.77;
const COURT_WIDTH = 10.97;
const SINGLES_WIDTH = 8.23;
const NET_HEIGHT = 0.914;

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

// Hit detection radius in px
const HANDLE_RADIUS = 18;

type DragTarget = 'player1' | 'player2' | 'shot1' | 'shot2' | null;

const TennisCourt: React.FC = () => {
  // Gamification states
  const [showAngles, setShowAngles] = useState(false);
  const [feedback, setFeedback] = useState('');
  // State and refs (declare ONCE)
  const [player1, setPlayer1] = useState(DEFAULT_PLAYER1);
  const [player2, setPlayer2] = useState(DEFAULT_PLAYER2);
  const [shot1, setShot1] = useState(DEFAULT_SHOT1);
  const [shot2, setShot2] = useState(DEFAULT_SHOT2);

  // --- Helper: getBisectorAndP2 (for gamification and drawing) ---
  function getBisectorAndP2() {
    // Use true angle bisector in meters (not pixels)
    const v1 = { x: shot1.x - player1.x, y: shot1.y - player1.y };
    const v2 = { x: shot2.x - player1.x, y: shot2.y - player1.y };
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
    let t = (COURT_LENGTH - player1.y) / bisNorm.y;
    const bisectorEnd = {
      x: player1.x + bisNorm.x * t,
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

  // --- Auto-update shot endpoints based on Player 1 position ---
  useEffect(() => {
    // Singles sideline positions
    const isLeft = player1.x < COURT_WIDTH / 2;
    // Down-the-line: on the same side as Player 1, at intersection of opponent's baseline and singles sideline
    // Down-the-line: intersection of opponent's baseline and the sideline on Player 1's side
    const downLineX = player1.x < singlesCenterX ? leftSinglesX : rightSinglesX;
    const downLine = {
      x: downLineX,
      y: COURT_LENGTH, // singles baseline
    };
    // Cross-court: intersection of opponent's baseline and the opposite singles sideline
    const crossX = player1.x < singlesCenterX ? rightSinglesX : leftSinglesX; // symmetric
    
    // Factor for how far Player 1 is from the center (lateral, 0=center, 1=sideline)
    // Use top-level singlesCenterX for symmetry
    const sidelineDist = Math.abs(player1.x - singlesCenterX);
    const maxSidelineDist = SINGLES_WIDTH / 2;
    const lateralFactor = Math.min(1, sidelineDist / maxSidelineDist);
    // Smoother, realistic progression for cross-court endpoint
    // Use smoothstep interpolation between baseline and minY (2m past net)
    let t = lateralFactor;
    let crossY;
    const NET_Y = COURT_LENGTH / 2;
    const BASELINE_Y = COURT_LENGTH;
    // Minimum Y for endpoint: 2m past net if Player 1 is at/behind baseline
    let minY = NET_Y + 2;
    // If Player 1 moves forward, allow endpoint to move closer to net (never before net)
    if (player1.y > 0) {
      // Allow minY to approach NET_Y + 0.2 as Player 1 approaches net
      const forward = Math.min(1, player1.y / (NET_Y - 0.2));
      minY = minY - (minY - (NET_Y + 0.2)) * forward;
    }
    // Smoothstep cubic Hermite interpolation (0 at baseline, 1 at sideline)
    function smoothstep(edge0: number, edge1: number, x: number) {
      const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
      return t * t * (3 - 2 * t);
    }
    const s = smoothstep(0, 1, t);
    crossY = BASELINE_Y * (1 - s) + minY * s;
    // Clamp so never before net or after baseline
    crossY = Math.max(NET_Y, Math.min(crossY, BASELINE_Y));
    setShot1(downLine);
    setShot2({ x: crossX, y: crossY });
  }, [player1.x, player1.y]);
  const [dragging, setDragging] = useState<DragTarget>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 800 });
  const [showOptimal, setShowOptimal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- BEGIN: Coordinate helpers and constants (top-level scope) ---
  // (Removed: will be recalculated inside drawing effect)
  const NET_Y = COURT_LENGTH / 2;
  // --- END: Coordinate helpers and constants ---


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

  // Remove getShotEndpoints and getBisectorAndP2 from top-level scope. They will be defined inside the drawing effect where helpers are in scope.


  // Draw everything
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { width, height } = canvasSize;
    // --- BEGIN: Coordinate helpers and constants (top-level scope) ---
    // These are updated on every render
    const aspect = BG_WIDTH / BG_LENGTH;
    let drawWidth = canvasRef.current ? canvasRef.current.width : 1;
    let drawHeight = canvasRef.current ? canvasRef.current.height : 1;
    if (drawWidth / drawHeight > aspect) {
      drawWidth = drawHeight * aspect;
    } else {
      drawHeight = drawWidth / aspect;
    }
    let offsetX = canvasRef.current ? (canvasRef.current.width - drawWidth) / 2 : 0;
    let offsetY = canvasRef.current ? (canvasRef.current.height - drawHeight) / 2 : 0;
    let scale = drawWidth / BG_WIDTH;
    const NET_Y = COURT_LENGTH / 2;
    function m2pxXoff(m: number) { return offsetX + (m + (BG_WIDTH - COURT_WIDTH) / 2) * scale; }
    function m2pxYoff(m: number) { return offsetY + (m + (BG_LENGTH - COURT_LENGTH) / 2) * scale; }
    function px2mXoff(px: number) { return (px - offsetX) / scale - (BG_WIDTH - COURT_WIDTH) / 2; }
    function px2mYoff(py: number) { return (py - offsetY) / scale - (BG_LENGTH - COURT_LENGTH) / 2; }
    // --- END: Coordinate helpers and constants ---

    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

    // Dynamic mapping functions for this draw (using scaled anchors, see above)
    function courtToPx({ x, y }: { x: number; y: number }) {
      // Anchors for singles court (left/right baselines in px)
      const leftSinglesX_px = (BG_WIDTH - SINGLES_WIDTH) / 2;
      const rightSinglesX_px = BG_WIDTH - (BG_WIDTH - SINGLES_WIDTH) / 2;
      const pxTop = 0;
      const pxBottom = BG_LENGTH;
      // Map x (court meters) in [COURT_X_LEFT, COURT_X_RIGHT] to pixel X in [leftSinglesX_px, rightSinglesX_px]
      const t = (x - COURT_X_LEFT) / SINGLES_WIDTH;
      const px = leftSinglesX_px + t * (rightSinglesX_px - leftSinglesX_px);
      // Map y (court meters) to pixel Y within baselines
      const s = y / COURT_LENGTH;
      const py = m2pxYoff(pxTop + s * (pxBottom - pxTop));
      return { x: px, y: py };
    }

    // Local helpers for this draw
    function getShotEndpoints() {
      // Down-the-line endpoint (always on singles sideline at baseline)
      const downLine = courtToPxRef.current!({ x: shot1.x, y: shot1.y });
      const crossCourt = courtToPxRef.current!({ x: shot2.x, y: shot2.y });
      return { downLine, crossCourt };
    }
    function getBisectorAndP2() {
      // Use true angle bisector in meters (not pixels)
      const v1 = { x: shot1.x - player1.x, y: shot1.y - player1.y };
      const v2 = { x: shot2.x - player1.x, y: shot2.y - player1.y };
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
      let t = (COURT_LENGTH - player1.y) / bisNorm.y;
      const bisectorEnd = {
        x: player1.x + bisNorm.x * t,
        y: COURT_LENGTH
      };
      // Optimal P2 position: just behind baseline, at intersection
      const optimalP2 = {
        x: bisectorEnd.x,
        y: COURT_LENGTH
      };
      return {
        bisectorEndPx: courtToPxRef.current!({ x: bisectorEnd.x, y: bisectorEnd.y }),
        optimalP2Px: courtToPxRef.current!({ x: optimalP2.x, y: optimalP2.y }),
        optimalP2
      };
    }

    // Draw background
    const bg = new window.Image();
    bg.src = '/court-bg.png';
    bg.onload = () => {
      if (!ctx) return;
      const player1Px = courtToPxRef.current!({ x: player1.x, y: player1.y });
      const player2Px = courtToPxRef.current!({ x: player2.x, y: player2.y });
      const shot1Px = courtToPxRef.current!({ x: shot1.x, y: shot1.y });
      const shot2Px = courtToPxRef.current!({ x: shot2.x, y: shot2.y });
      ctx.drawImage(bg, offsetX, offsetY, drawWidth, drawHeight);
      if (showAngles) {
        // Draw best shots (only if angles are shown)
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(player1Px.x, player1Px.y);
        ctx.lineTo(shot1Px.x, shot1Px.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(player1Px.x, player1Px.y);
        ctx.lineTo(shot2Px.x, shot2Px.y);
        ctx.stroke();

        // Draw bisector
        ctx.strokeStyle = 'orange';
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(player1Px.x, player1Px.y);
        const { bisectorEndPx } = getBisectorAndP2(); // uses courtToPxRef.current inside
        ctx.lineTo(bisectorEndPx.x, bisectorEndPx.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw draggable handles (increased hit area)
      drawPlayerHandle(ctx, player1Px.x, player1Px.y, 'blue');
      drawPlayerHandle(ctx, player2Px.x, player2Px.y, 'purple');
      drawShotHandle(ctx, shot1Px.x, shot1Px.y, 'red');
      drawShotHandle(ctx, shot2Px.x, shot2Px.y, 'red');
    };
    if (bg.complete) bg.onload && bg.onload(null as any); // Redraw if already loaded
  }, [player1, player2, shot1, shot2, canvasSize, showOptimal]);
function drawPlayerHandle(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.beginPath();
  ctx.arc(x, y, HANDLE_RADIUS, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.3;
  ctx.fill();
  ctx.globalAlpha = 1.0;
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
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
    function hitTestHandles(px: number, py: number): DragTarget {
      const player1Px = courtToPxRef.current!({ x: player1.x, y: player1.y });
      if (dist(px, py, player1Px.x, player1Px.y) < HANDLE_RADIUS) return 'player1';
      const player2Px = courtToPxRef.current!({ x: player2.x, y: player2.y });
      if (dist(px, py, player2Px.x, player2Px.y) < HANDLE_RADIUS) return 'player2';
      const shot1Px = courtToPxRef.current!({ x: shot1.x, y: shot1.y });
      if (dist(px, py, shot1Px.x, shot1Px.y) < HANDLE_RADIUS) return 'shot1';
      const shot2Px = courtToPxRef.current!({ x: shot2.x, y: shot2.y });
      if (dist(px, py, shot2Px.x, shot2Px.y) < HANDLE_RADIUS) return 'shot2';
      return null;
    }
    hitTestHandlesRef.current = hitTestHandles;
    courtToPxRef.current = courtToPx;
    pxToCourtRef.current = pxToCourt;
  }, [player1, player2, shot1, shot2, canvasSize, showOptimal]);

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
    const x = courtX;
    const y = courtY;
    if (dragging === 'player1') setPlayer1({ x, y: Math.min(y, NET_Y) });
    else if (dragging === 'player2') setPlayer2({ x, y: Math.max(y, NET_Y) });
    else if (dragging === 'shot1') setShot1({ x, y });
    else if (dragging === 'shot2') setShot2({ x, y });
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

  return (
    <div ref={containerRef} style={{ width: '100%', height: `calc(100vw * ${BG_LENGTH/BG_WIDTH} > 70vh ? 70vh : calc(100vw * ${BG_LENGTH/BG_WIDTH}))`, maxWidth: 800, margin: '0 auto', position: 'relative', aspectRatio: `${BG_WIDTH} / ${BG_LENGTH}` }}>
      {/* Gamification controls */}
      <div style={{position: 'absolute', top: 10, left: 10, zIndex: 2, background: 'rgba(255,255,255,0.85)', padding: 8, borderRadius: 4, fontSize: 14}}>
        <button onClick={() => setShowAngles(a => !a)} style={{marginRight: 8}}>
          {showAngles ? 'Hide angles/best shots' : 'Show angles/best shots'}
        </button>
        <button onClick={() => {
          // Guess logic: is player2 on bisector?
          const bisectorResult = getBisectorAndP2();
          const optimalP2 = bisectorResult.optimalP2;
          const dist = Math.hypot(player2.x - optimalP2.x, player2.y - optimalP2.y);
          if (dist < 0.5) setFeedback('You win! 🎾');
          else setFeedback('You lose, try again or ask for the solution.');
        }} style={{marginRight: 8}}>
          Play: Guess best P2 position
        </button>
        <button onClick={() => setShowAngles(true)} style={{marginRight: 8}}>
          Show solution
        </button>
        <span style={{marginLeft: 8, fontWeight: 'bold'}}>{feedback}</span>
      </div>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ display: 'block', touchAction: 'none', background: '#222', width: '100%', height: '100%' }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerUp}
        onMouseMove={handleMouseMove}
      />
    </div>
  );
}

export default TennisCourt;
