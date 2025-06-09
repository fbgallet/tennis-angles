import { useState, useRef } from "react";
import type { DragTarget, Position, CourtOrientation } from "../types/tennis";
import { HANDLE_RADIUS } from "../constants/tennis";
import { clamp, dist } from "../utils/coordinates";
import { NET_Y } from "../constants/tennis";

export function useDragHandling() {
  const [dragging, setDragging] = useState<DragTarget>(null);
  const anchorsRef = useRef<any>(null);

  function createHitTestFunction(
    player1: Position,
    player2: Position,
    shot1: Position,
    shot2: Position,
    shot3: Position,
    shot4: Position,
    courtToPx: (pos: Position) => { x: number; y: number }
  ) {
    return function hitTestHandles(
      px: number,
      py: number,
      radiusOverride?: number
    ): DragTarget {
      const r = radiusOverride ?? HANDLE_RADIUS;
      const player1Px = courtToPx(player1);
      const player2Px = courtToPx(player2);
      const shot1Px = courtToPx(shot1);
      const shot2Px = courtToPx(shot2);
      const shot3Px = courtToPx(shot3);
      const shot4Px = courtToPx(shot4);

      if (dist(px, py, player1Px.x, player1Px.y) < r) return "player1";
      if (dist(px, py, player2Px.x, player2Px.y) < r) return "player2";
      if (dist(px, py, shot1Px.x, shot1Px.y) < r) return "shot1";
      if (dist(px, py, shot2Px.x, shot2Px.y) < r) return "shot2";
      if (dist(px, py, shot3Px.x, shot3Px.y) < r) return "shot3";
      if (dist(px, py, shot4Px.x, shot4Px.y) < r) return "shot4";
      return null;
    };
  }

  function handlePointerDown(
    e: React.PointerEvent,
    canvasRef: React.RefObject<HTMLCanvasElement>,
    hitTestHandles: (px: number, py: number) => DragTarget
  ) {
    if (!canvasRef.current || !anchorsRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;

    const hit = hitTestHandles(px, py);
    setDragging(hit);
  }

  function handlePointerMove(
    e: React.PointerEvent,
    canvasRef: React.RefObject<HTMLCanvasElement>,
    courtOrientation: CourtOrientation,
    setters: {
      setPlayer1: (pos: Position) => void;
      setPlayer2: (pos: Position) => void;
      setShot1: (pos: Position) => void;
      setShot2: (pos: Position) => void;
      setShot3: (pos: Position) => void;
      setShot4: (pos: Position) => void;
      setHasMovedPlayer1: (moved: boolean) => void;
      setHasMovedPlayer2: (moved: boolean) => void;
    }
  ) {
    if (!dragging || !canvasRef.current || !anchorsRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;

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
    } else if (dragging === "shot1") {
      setters.setShot1({ x: courtX, y: courtY });
    } else if (dragging === "shot2") {
      setters.setShot2({ x: courtX, y: courtY });
    } else if (dragging === "shot3") {
      setters.setShot3({ x: courtX, y: courtY });
    } else if (dragging === "shot4") {
      setters.setShot4({ x: courtX, y: courtY });
    }
  }

  function handlePointerUp() {
    setDragging(null);
  }

  function handleMouseMove(
    e: React.MouseEvent,
    canvasRef: React.RefObject<HTMLCanvasElement>,
    hitTestHandles: (px: number, py: number) => DragTarget
  ) {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;

    const hit = hitTestHandles(px, py);
    canvasRef.current.style.cursor = hit ? "pointer" : "default";
  }

  return {
    dragging,
    anchorsRef,
    createHitTestFunction,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleMouseMove,
  };
}
