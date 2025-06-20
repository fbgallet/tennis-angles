import { useState, useRef, useCallback, useEffect } from "react";
import type { DragTarget, Position, CourtOrientation } from "../types/tennis";
import { HANDLE_RADIUS } from "../constants/tennis";
import { clamp, dist } from "../utils/coordinates";
import { NET_Y } from "../constants/tennis";
import {
  detectDevice,
  getTouchOptimizedRadius,
  getTouchOptimizedClickRadius,
  normalizePointerEvent,
  isSameTouchPoint,
  type DeviceInfo,
} from "../utils/device-detection";

export function useTouchOptimizedDragHandling() {
  const [dragging, setDragging] = useState<DragTarget>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const anchorsRef = useRef<any>(null);

  // Touch-specific state
  const dragStartPointRef = useRef<{ x: number; y: number } | null>(null);
  const lastTouchTimeRef = useRef<number>(0);
  const lastTouchTargetRef = useRef<DragTarget>(null);
  const touchMoveThresholdRef = useRef<number>(10);
  const isDraggingRef = useRef<boolean>(false);
  const preventClickRef = useRef<boolean>(false);

  // Initialize device detection
  useEffect(() => {
    const device = detectDevice();
    setDeviceInfo(device);

    // Adjust touch move threshold based on device
    if (device.isMobile) {
      touchMoveThresholdRef.current = 8; // Smaller threshold for mobile
    } else if (device.isTablet) {
      touchMoveThresholdRef.current = 12;
    } else {
      touchMoveThresholdRef.current = 15;
    }
  }, []);

  function createHitTestFunction(
    player1: Position,
    player2: Position,
    shot1: Position,
    shot2: Position,
    shot3: Position,
    shot4: Position,
    courtToPx: (pos: Position) => { x: number; y: number },
    player1bis?: Position,
    player2bis?: Position
  ) {
    return function hitTestHandles(
      px: number,
      py: number,
      radiusOverride?: number
    ): DragTarget {
      const baseRadius = radiusOverride ?? HANDLE_RADIUS;
      const r = deviceInfo
        ? getTouchOptimizedClickRadius(deviceInfo, baseRadius)
        : baseRadius;

      const player1Px = courtToPx(player1);
      const player2Px = courtToPx(player2);
      const shot1Px = courtToPx(shot1);
      const shot2Px = courtToPx(shot2);
      const shot3Px = courtToPx(shot3);
      const shot4Px = courtToPx(shot4);

      // Check additional players first (they might overlap with main players)
      if (player1bis) {
        const player1bisPx = courtToPx(player1bis);
        if (dist(px, py, player1bisPx.x, player1bisPx.y) < r)
          return "player1bis";
      }
      if (player2bis) {
        const player2bisPx = courtToPx(player2bis);
        if (dist(px, py, player2bisPx.x, player2bisPx.y) < r)
          return "player2bis";
      }

      if (dist(px, py, player1Px.x, player1Px.y) < r) return "player1";
      if (dist(px, py, player2Px.x, player2Px.y) < r) return "player2";
      if (dist(px, py, shot1Px.x, shot1Px.y) < r) return "shot1";
      if (dist(px, py, shot2Px.x, shot2Px.y) < r) return "shot2";
      if (dist(px, py, shot3Px.x, shot3Px.y) < r) return "shot3";
      if (dist(px, py, shot4Px.x, shot4Px.y) < r) return "shot4";
      return null;
    };
  }

  const handleStart = useCallback(
    (
      e: React.PointerEvent | React.TouchEvent | React.MouseEvent,
      canvasRef: React.RefObject<HTMLCanvasElement>,
      hitTestHandles: (px: number, py: number) => DragTarget
    ) => {
      if (!canvasRef.current || !anchorsRef.current) return;

      // Ignore multi-touch events (pinch-to-zoom)
      if ("touches" in e && e.touches.length > 1) {
        return { isDoubleTap: false, target: null };
      }

      // Prevent default to avoid conflicts, but only for single touch events
      if ("touches" in e && e.touches.length === 1) {
        // Only prevent default if we're touching a draggable element
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const normalized = normalizePointerEvent(e);
        const px = (normalized.clientX - rect.left) * scaleX;
        const py = (normalized.clientY - rect.top) * scaleY;
        const hit = hitTestHandles(px, py);

        if (hit) {
          e.preventDefault(); // Only prevent default if touching a draggable element
        }
      }

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const normalized = normalizePointerEvent(e);
      const px = (normalized.clientX - rect.left) * scaleX;
      const py = (normalized.clientY - rect.top) * scaleY;

      // Store drag start point
      dragStartPointRef.current = { x: px, y: py };
      isDraggingRef.current = false;
      preventClickRef.current = false;

      const hit = hitTestHandles(px, py);

      if (hit) {
        setDragging(hit);

        // Handle double-tap detection for touch devices
        if (deviceInfo?.isTouch && (hit === "player1" || hit === "player2")) {
          const currentTime = Date.now();
          const isDoubleTap =
            currentTime - lastTouchTimeRef.current < 300 &&
            lastTouchTargetRef.current === hit;

          if (isDoubleTap) {
            // Double-tap detected - this will be handled by the parent component
            lastTouchTimeRef.current = 0;
            lastTouchTargetRef.current = null;
            return { isDoubleTap: true, target: hit };
          } else {
            lastTouchTimeRef.current = currentTime;
            lastTouchTargetRef.current = hit;
          }
        }
      }

      return { isDoubleTap: false, target: hit };
    },
    [deviceInfo]
  );

  const handleMove = useCallback(
    (
      e: React.PointerEvent | React.TouchEvent | React.MouseEvent,
      canvasRef: React.RefObject<HTMLCanvasElement>,
      courtOrientation: CourtOrientation,
      setters: {
        setPlayer1: (pos: Position) => void;
        setPlayer2: (pos: Position) => void;
        setPlayer1bis?: (pos: Position) => void;
        setPlayer2bis?: (pos: Position) => void;
        setShot1: (pos: Position) => void;
        setShot2: (pos: Position) => void;
        setShot3: (pos: Position) => void;
        setShot4: (pos: Position) => void;
        setHasMovedPlayer1: (moved: boolean) => void;
        setHasMovedPlayer2: (moved: boolean) => void;
        setHasMovedPlayer1bis?: (moved: boolean) => void;
        setHasMovedPlayer2bis?: (moved: boolean) => void;
      }
    ) => {
      if (!dragging || !canvasRef.current || !anchorsRef.current) return;

      // Prevent default for touch events to avoid scrolling
      if ("touches" in e) {
        e.preventDefault();
      }

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const normalized = normalizePointerEvent(e);
      const px = (normalized.clientX - rect.left) * scaleX;
      const py = (normalized.clientY - rect.top) * scaleY;

      // For mobile devices, start dragging immediately after initial touch
      // The threshold check was causing the dragging to stop after a few pixels
      if (!isDraggingRef.current && dragStartPointRef.current) {
        const moveDistance = Math.hypot(
          px - dragStartPointRef.current.x,
          py - dragStartPointRef.current.y
        );

        // Use a much smaller threshold for mobile, or skip it entirely for touch devices
        const threshold = deviceInfo?.isTouch
          ? 2
          : touchMoveThresholdRef.current;

        if (moveDistance > threshold) {
          isDraggingRef.current = true;
          preventClickRef.current = true;
          // Clear double-tap state since this is a drag
          lastTouchTimeRef.current = 0;
          lastTouchTargetRef.current = null;
        }
      }

      // Always update positions when dragging is active, regardless of threshold
      if (!isDraggingRef.current && !deviceInfo?.isTouch) {
        return; // Only return early for non-touch devices
      }

      if (!anchorsRef.current.pxToCourt) return;

      const pxInCourt = px - anchorsRef.current.offsetX;
      const pyInCourt = py - anchorsRef.current.offsetY;
      const { x: courtX, y: courtY } = anchorsRef.current.pxToCourt({
        px: pxInCourt,
        py: pyInCourt,
      });

      // Calculate logical bounds
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

      // Update positions based on drag target
      if (dragging === "player1") {
        setters.setPlayer1({
          x: clamp(courtX, bgLogicalLeft, bgLogicalRight),
          y: clamp(courtY, bgLogicalTop, NET_Y),
        });
        setters.setHasMovedPlayer1(true);
      } else if (dragging === "player2") {
        setters.setPlayer2({
          x: clamp(courtX, bgLogicalLeft, bgLogicalRight),
          y: clamp(courtY, NET_Y, bgLogicalBottom),
        });
        setters.setHasMovedPlayer2(true);
      } else if (dragging === "player1bis" && setters.setPlayer1bis) {
        setters.setPlayer1bis({
          x: clamp(courtX, bgLogicalLeft, bgLogicalRight),
          y: clamp(courtY, bgLogicalTop, NET_Y),
        });
        if (setters.setHasMovedPlayer1bis) {
          setters.setHasMovedPlayer1bis(true);
        }
      } else if (dragging === "player2bis" && setters.setPlayer2bis) {
        setters.setPlayer2bis({
          x: clamp(courtX, bgLogicalLeft, bgLogicalRight),
          y: clamp(courtY, NET_Y, bgLogicalBottom),
        });
        if (setters.setHasMovedPlayer2bis) {
          setters.setHasMovedPlayer2bis(true);
        }
      } else if (dragging === "shot1") {
        setters.setShot1({ x: courtX, y: courtY });
      } else if (dragging === "shot2") {
        setters.setShot2({ x: courtX, y: courtY });
      } else if (dragging === "shot3") {
        setters.setShot3({ x: courtX, y: courtY });
      } else if (dragging === "shot4") {
        setters.setShot4({ x: courtX, y: courtY });
      }
    },
    [dragging, deviceInfo]
  );

  const handleEnd = useCallback(() => {
    setDragging(null);
    dragStartPointRef.current = null;
    isDraggingRef.current = false;

    // Reset prevent click after a short delay to allow for proper event handling
    setTimeout(() => {
      preventClickRef.current = false;
    }, 100);
  }, []);

  const handleMouseMove = useCallback(
    (
      e: React.MouseEvent,
      canvasRef: React.RefObject<HTMLCanvasElement>,
      hitTestHandles: (px: number, py: number) => DragTarget
    ) => {
      if (!canvasRef.current || deviceInfo?.isTouch) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;
      const px = (e.clientX - rect.left) * scaleX;
      const py = (e.clientY - rect.top) * scaleY;

      const hit = hitTestHandles(px, py);
      canvasRef.current.style.cursor = hit ? "pointer" : "default";
    },
    [deviceInfo]
  );

  // Get touch-optimized radius for drawing
  const getOptimizedRadius = useCallback(
    (baseRadius: number = HANDLE_RADIUS) => {
      return deviceInfo
        ? getTouchOptimizedRadius(deviceInfo, baseRadius)
        : baseRadius;
    },
    [deviceInfo]
  );

  return {
    dragging,
    deviceInfo,
    anchorsRef,
    createHitTestFunction,
    handleStart,
    handleMove,
    handleEnd,
    handleMouseMove,
    getOptimizedRadius,
    isDragging: isDraggingRef.current,
    preventClick: preventClickRef.current,
  };
}
